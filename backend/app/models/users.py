from app.models.timestamp import TimestampMixin
from sqlmodel import SQLModel, Field, Column, String, Boolean, Relationship
import uuid
from sqlalchemy.dialects.postgresql import UUID
from app.models.authorization import Role, UserRole
from typing import List

class User(SQLModel, TimestampMixin, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, sa_column=Column(UUID(as_uuid=True), primary_key=True))
    username: str = Field(sa_column=Column(String(50), nullable=False, unique=True, index=True))
    email: str = Field(sa_column=Column(String(100), nullable=False, unique=True, index=True))
    password_hash: str = Field(sa_column=Column(String, nullable=False))
    is_active: bool = Field(default=True, sa_column=Column(Boolean, nullable=False, default=True))

    # Multi-role support
    roles: List[Role] = Relationship(back_populates="users", link_model=UserRole)

