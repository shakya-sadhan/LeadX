from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List
import uuid

from app.dependencies.dependencies import get_session
from app.services.user_service import UserService
from app.schemas.users import UserRead, UserCreate, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])

# Create user (admin)
@router.post("/", response_model=UserRead)
async def create_user(
    data: UserCreate,
    session: AsyncSession = Depends(get_session),
):
    service = UserService(session)
    user_dict = await service.create_user(data)
    return UserRead.model_validate(user_dict)


# List users
@router.get("/", response_model=List[UserRead])
async def list_users(session: AsyncSession = Depends(get_session)):
    service = UserService(session)
    users_list = await service.list_users()
    return [UserRead.model_validate(u) for u in users_list]


# Get user by ID
@router.get("/{user_id}", response_model=UserRead)
async def get_user(user_id: uuid.UUID, session: AsyncSession = Depends(get_session)):
    service = UserService(session)
    user_dict = await service.get_user(user_id)
    return UserRead.model_validate(user_dict)


# Update user
@router.put("/{user_id}", response_model=UserRead)
async def update_user(
    user_id: uuid.UUID,
    data: UserUpdate,
    session: AsyncSession = Depends(get_session),
):
    service = UserService(session)
    user_dict = await service.update_user(user_id, data)
    return UserRead.model_validate(user_dict)

# Delete user
@router.delete("/{user_id}")
async def delete_user(user_id: uuid.UUID, session: AsyncSession = Depends(get_session)):
    service = UserService(session)
    ok = await service.delete_user(user_id)
    if not ok:
        raise HTTPException(status_code=404, detail="User not found")
    return {"ok": True}
