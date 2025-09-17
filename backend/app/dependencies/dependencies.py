from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from sqlalchemy.orm import selectinload
from uuid import UUID
from app.models.authorization import Role, Permission
from app.models.users import User
from app.db.session import get_session
from app.utils.jwt import verify_token

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


# --------------------------
# Get current user dependency
# --------------------------
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_session)
) -> User:
    user_id = verify_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    result = await session.exec(
        select(User)
        .where(User.id == user_id)
        .options(
            selectinload(User.roles).selectinload(Role.permissions)  # class-bound attribute here!
        )
    )
    user = result.one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# --------------------------
# Permission check dependency
# --------------------------
def require_permission(module: str, action: str):
    """
    Dependency that checks if the current user has the given permission (module + action).
    Example: require_permission("user", "create")
    """

    async def dependency(current_user: User = Depends(get_current_user)):
        # Build the full permission code: e.g. "user:create"
        required_code = f"{module}:{action}"

        # roles and permissions are already loaded on current_user
        user_permissions = {
            f"{perm.module}:{perm.name}"
            for role in current_user.roles
            for perm in role.permissions
        }

        if required_code not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing permission: {required_code}",
            )

        return True
 
    return dependency