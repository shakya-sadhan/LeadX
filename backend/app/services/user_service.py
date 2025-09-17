from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import List
import uuid
from fastapi import HTTPException
from sqlalchemy.orm import selectinload
from app.models.users import User
from app.models.authorization import Role
from app.schemas.users import UserCreate, UserUpdate
from app.core.security import hash_password

class UserService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_users(self) -> list[dict]:
        result = await self.session.exec(
            select(User).options(selectinload(User.roles))
        )
        users = result.all()

        users_list = []
        for u in users:
            user_dict = u.model_dump()
            user_dict["roles"] = [r.name for r in u.roles]
            users_list.append(user_dict)
        return users_list

    async def get_user(self, user_id: uuid.UUID) -> dict:
        result = await self.session.exec(
            select(User)
            .options(selectinload(User.roles))
            .where(User.id == user_id)
        )
        user = result.one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # convert to dict with role names
        user_dict = user.model_dump()
        user_dict["roles"] = [r.name for r in user.roles]
        return user_dict
    
    
    async def create_user(self, data: UserCreate) -> dict:
        user = User(
            username=data.username,
            email=data.email,
            password_hash=hash_password(data.password)
        )

        # fetch roles
        roles_result = await self.session.exec(select(Role).where(Role.id.in_(data.role_ids)))
        user.roles = roles_result.all()  # already loaded

        self.session.add(user)
        await self.session.commit()
        # reload user with roles eagerly loaded
        result = await self.session.exec(
            select(User).where(User.id == user.id).options(selectinload(User.roles))
        )
        user = result.one()

        # return dict with role names
        user_dict = user.model_dump()
        user_dict["roles"] = [r.name for r in user.roles]
        return user_dict

    async def update_user(self, user_id: uuid.UUID, data: UserUpdate) -> dict:
        # Load user + roles eagerly
        result = await self.session.exec(
            select(User)
            .where(User.id == user_id)
            .options(selectinload(User.roles))
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
            # fetch roles
            roles_result = await self.session.exec(
                select(Role).where(Role.id.in_(data.role_ids))
            )
            user.roles = roles_result.all()  # now it's already loaded, safe to assign

        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)

        # Return as dict with role names
        user_dict = user.model_dump()
        user_dict["roles"] = [r.name for r in user.roles]
        return user_dict

    async def delete_user(self, user_id: uuid.UUID) -> bool:
        user = await self.session.get(User, user_id)
        if not user:
            return False
        await self.session.delete(user)
        await self.session.commit()
        return True
