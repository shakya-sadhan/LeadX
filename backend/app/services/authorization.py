from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.authorization import Role, Permission
import uuid
from typing import List, Optional

class RoleService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_role(self, role: Role) -> Role:
        self.session.add(role)
        await self.session.commit()
        await self.session.refresh(role)
        return role

    async def get_role(self, role_id: uuid.UUID) -> Optional[Role]:
        result = await self.session.get(Role, role_id, options=[selectinload(Role.permissions)])
        return result

    async def list_roles(self, skip: int = 0, limit: int = 100) -> List[Role]:
        result = await self.session.exec(
            select(Role)
            .options(selectinload(Role.permissions))
            .offset(skip)
            .limit(limit)
        )
        return result.all()

    async def update_role(self, role: Role, new_name: str) -> Role:
        role.name = new_name
        self.session.add(role)
        await self.session.commit()
        await self.session.refresh(role)
        return role

    async def delete_role(self, role_id: uuid.UUID) -> bool:
        role = await self.session.get(Role, role_id)
        if not role:
            return False
        await self.session.delete(role)
        await self.session.commit()
        return True

    async def assign_permissions(self, role_id: uuid.UUID, permission_ids: List[uuid.UUID]) -> Role:
        role = await self.session.get(Role, role_id, options=[selectinload(Role.permissions)])
        if not role:
            raise ValueError("Role not found")

        result = await self.session.exec(select(Permission).where(Permission.id.in_(permission_ids)))
        permissions = result.all()

        role.permissions = permissions
        self.session.add(role)
        await self.session.commit()
        await self.session.refresh(role)
        return role


class PermissionService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_permission(self, permission: Permission) -> Permission:
        self.session.add(permission)
        await self.session.commit()
        await self.session.refresh(permission)
        return permission

    async def get_permission(self, permission_id: uuid.UUID) -> Optional[Permission]:
        return await self.session.get(Permission, permission_id)

    async def list_permissions(self, skip: int = 0, limit: int = 100) -> List[Permission]:
        result = await self.session.exec(
            select(Permission)
            .offset(skip)
            .limit(limit)
        )
        return result.all()

    async def update_permission(self, permission: Permission, new_name: str) -> Permission:
        permission.name = new_name
        self.session.add(permission)
        await self.session.commit()
        await self.session.refresh(permission)
        return permission

    async def delete_permission(self, permission_id: uuid.UUID) -> bool:
        permission = await self.session.get(Permission, permission_id)
        if not permission:
            return False
        await self.session.delete(permission)
        await self.session.commit()
        return True
