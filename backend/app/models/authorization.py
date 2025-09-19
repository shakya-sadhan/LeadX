from sqlmodel import SQLModel, Field, Column, Relationship, String
from typing import List, TYPE_CHECKING
import uuid
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone

if TYPE_CHECKING:
    from app.models.users import User

# Role hierarchy
ROLE_HIERARCHY = {
    "superadmin": 3,
    "admin": 2,
    "user": 1
}


class UserRole(SQLModel, table=True):
    __tablename__ = "user_roles"
    user_id: uuid.UUID = Field(foreign_key="users.id", primary_key=True)
    role_id: uuid.UUID = Field(foreign_key="roles.id", primary_key=True)

class RolePermission(SQLModel, table=True):
    __tablename__ = "role_permissions"
    role_id: uuid.UUID = Field(foreign_key="roles.id", primary_key=True)
    permission_id: uuid.UUID = Field(foreign_key="permissions.id", primary_key=True)


class Role(SQLModel, table=True):
    __tablename__ = "roles"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, sa_column=Column(UUID(as_uuid=True), primary_key=True))
    name: str = Field(sa_column=Column(String(50), nullable=False, unique=True, index=True))

    permissions: List["Permission"] = Relationship(back_populates="roles", link_model=RolePermission)
    users: List["User"] = Relationship(back_populates="roles", link_model=UserRole)


class Permission(SQLModel, table=True):
    __tablename__ = "permissions"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, sa_column=Column(UUID(as_uuid=True), primary_key=True))
    name: str = Field(sa_column=Column(String(50), nullable=False, unique=True, index=True))
    module: str = Field(sa_column=Column(String(50), nullable=False, index=True))
    roles: List[Role] = Relationship(back_populates="permissions", link_model=RolePermission)


Role.model_rebuild()
Permission.model_rebuild() 