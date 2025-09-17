from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import datetime, timezone
from sqlmodel import select

from app.db.session import get_session
from app.models.users import User
from app.models.refresh_token import RefreshToken
from app.schemas.users import UserRegister, UserLogin, UserRead, TokenRefresh, Token
from app.utils.jwt import verify_token, create_access_token
from app.dependencies.dependencies import get_current_user
from app.services.auth_service import AuthService

router = APIRouter(prefix="/authenticate", tags=["Authentication"])

@router.post("/register", response_model=UserRead)
async def register(user: UserRegister, session: AsyncSession = Depends(get_session)):
    auth = AuthService(session)
    new_user = await auth.register_user(user.username, user.email, user.password)
    return new_user

@router.post("/login", response_model=Token)
async def login(user: UserLogin, session: AsyncSession = Depends(get_session)):
    auth = AuthService(session)
    db_user = await auth.authenticate_user(user.email, user.password)
    if not db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credentials")

    access_token = create_access_token(db_user.id)
    # Set revoke_old=True for single-session; False for multi-device
    refresh_token = await auth.create_and_store_refresh_token(db_user, revoke_old=True)
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/refresh", response_model=Token)
async def refresh(request: TokenRefresh, session: AsyncSession = Depends(get_session)):
    auth = AuthService(session)
    user_id = verify_token(request.refresh_token)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    result = await session.exec(
        select(RefreshToken).where(
            RefreshToken.token == request.refresh_token,
            RefreshToken.user_id == user_id
        )
    )
    db_token = result.one_or_none()
    if not db_token or db_token.revoked or db_token.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired or revoked")

    await auth.revoke_refresh_token(request.refresh_token)

    result = await session.exec(select(User).where(User.id == user_id))
    user = result.one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    new_access = create_access_token(user.id)
    new_refresh = await auth.create_and_store_refresh_token(user)
    return {"access_token": new_access, "refresh_token": new_refresh, "token_type": "bearer"}


@router.get("/me", response_model=UserRead)
async def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout")
async def logout(request: TokenRefresh, session: AsyncSession = Depends(get_session)):
    """
    Logout by revoking the provided refresh token.
    """
    auth = AuthService(session)
    await auth.logout(request.refresh_token)
    return {"detail": "Logged out successfully"}