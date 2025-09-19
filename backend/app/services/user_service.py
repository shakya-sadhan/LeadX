from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import List
import uuid
from fastapi import HTTPException
from sqlalchemy.orm import selectinload
from app.models.users import User
from app.models.authorization import Role
from app.schemas.users import UserCreate, UserUpdate, UserRead
from app.core.security import hash_password


class UserService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_users(self) -> list[UserRead]:
        result = await self.session.exec(
            select(User)
            .options(
                selectinload(User.roles).selectinload(Role.permissions)
            )
        )
        users = result.all()
        return [UserRead.model_validate(u, from_attributes=True) for u in users]

    async def get_user(self, user_id: uuid.UUID) -> UserRead:
        result = await self.session.exec(
            select(User)
            .where(User.id == user_id)
            .options(
                selectinload(User.roles).selectinload(Role.permissions)
            )
        )
        user = result.one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return UserRead.model_validate(user, from_attributes=True)

    async def create_user(self, data: UserCreate) -> UserRead:
        user = User(
            username=data.username,
            email=data.email,
            password_hash=hash_password(data.password)
        )

        # assign roles
        roles_result = await self.session.exec(
            select(Role).where(Role.id.in_(data.role_ids))
        )
        user.roles = roles_result.all()

        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)

        # reload user with roles + permissions
        result = await self.session.exec(
            select(User)
            .where(User.id == user.id)
            .options(
                selectinload(User.roles).selectinload(Role.permissions)
            )
        )
        user = result.one()

        return UserRead.model_validate(user, from_attributes=True)

    async def update_user(self, user_id: uuid.UUID, data: UserUpdate) -> UserRead:
        result = await self.session.exec(
            select(User)
            .where(User.id == user_id)
            .options(
                selectinload(User.roles).selectinload(Role.permissions)
            )
        )
        user = result.one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if data.username is not None:
            user.username = data.username
        if data.email is not None:
            user.email = data.email
        if data.password is not None:
            user.password_hash = hash_password(data.password)
        if data.is_active is not None:
            user.is_active = data.is_active

        if data.role_ids is not None:
            roles_result = await self.session.exec(
                select(Role).where(Role.id.in_(data.role_ids))
            )
            user.roles = roles_result.all()

        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)

        return UserRead.model_validate(user, from_attributes=True)

    async def delete_user(self, user_id: uuid.UUID) -> None:
        user = await self.session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        await self.session.delete(user)
        await self.session.commit()
