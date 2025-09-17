from fastapi import HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from datetime import datetime, timedelta, timezone
from app.models.users import User
from app.models.refresh_token import RefreshToken
from app.core.security import hash_password, verify_password
from app.utils.jwt import create_refresh_token

class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def register_user(self, username: str, email: str, password: str) -> User:
        # Duplicate check
        existing = await self.session.exec(
            select(User).where((User.email == email) | (User.username == username))
        )
        if existing.one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already registered"
            )

        user = User(username=username, email=email, password_hash=hash_password(password))
        try:
            self.session.add(user)
            await self.session.commit()
            await self.session.refresh(user)
        except Exception as e:
            await self.session.rollback()
            raise HTTPException(status_code=500, detail="DB Error: cannot register user")
        return user

    async def authenticate_user(self, email: str, password: str) -> User | None:
        result = await self.session.exec(select(User).where(User.email == email))
        user = result.one_or_none()
        if user and verify_password(password, user.password_hash):
            return user
        return None

    async def create_and_store_refresh_token(
        self, user: User, revoke_old: bool = False
    ) -> str:
        """
        revoke_old: if True, old refresh tokens are revoked (single-session)
        """
        if revoke_old:
            result = await self.session.exec(
                select(RefreshToken).where(RefreshToken.user_id == user.id, RefreshToken.revoked == False)
            )
            for old_token in result.all():
                old_token.revoked = True

        token_str = create_refresh_token(user.id)
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        refresh_token = RefreshToken(
            user_id=user.id,
            token=token_str,
            expires_at=expires_at
        )
        try:
            self.session.add(refresh_token)
            await self.session.commit()
        except Exception:
            await self.session.rollback()
            raise HTTPException(status_code=500, detail="DB Error: cannot store refresh token")
        return token_str

    async def revoke_refresh_token(self, token_str: str):
        result = await self.session.exec(select(RefreshToken).where(RefreshToken.token == token_str))
        db_token = result.one_or_none()
        if db_token:
            db_token.revoked = True
            try:
                await self.session.commit()
            except Exception:
                await self.session.rollback()
                raise HTTPException(status_code=500, detail="DB Error: cannot revoke refresh token")
            
    async def logout(self, token_str: str):
        """
        Revoke a specific refresh token (logout from one session)
        """
        result = await self.session.exec(select(RefreshToken).where(RefreshToken.token == token_str))
        db_token = result.one_or_none()
        if not db_token:
            raise HTTPException(status_code=404, detail="Refresh token not found")
        db_token.revoked = True
        try:
            await self.session.commit()
        except Exception:
            await self.session.rollback()
            raise HTTPException(status_code=500, detail="DB error: cannot revoke refresh token")
