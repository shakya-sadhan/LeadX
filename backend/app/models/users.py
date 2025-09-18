from typing import List, Optional
from app.models.authorization import Role, UserRole
from sqlmodel import SQLModel, Field, Column, String, Boolean, Relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.models.timestamp import TimestampMixin

class User(SQLModel, TimestampMixin, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4, 
        sa_column=Column(UUID(as_uuid=True), primary_key=True)
    )
    username: str = Field(sa_column=Column(String(50), nullable=False, unique=True, index=True))
    email: str = Field(sa_column=Column(String(100), nullable=False, unique=True, index=True))
    password_hash: Optional[str] = Field(
        sa_column=Column(String, nullable=True)
    )
    is_active: bool = Field(default=True, sa_column=Column(Boolean, nullable=False, default=True))
    
    google_sub: Optional[str] = Field(
        default=None, sa_column=Column(String(200), unique=True, index=True)
    )
    profile_pic: Optional[str] = None

    # Multi-role support
    roles: List[Role] = Relationship(back_populates="users", link_model=UserRole)
