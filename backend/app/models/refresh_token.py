from sqlmodel import SQLModel, Field, Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import ForeignKey
from datetime import datetime, timezone, timedelta
import uuid

class RefreshToken(SQLModel, table=True):
    __tablename__ = "refresh_tokens"

    # Primary key
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(UUID(as_uuid=True), primary_key=True)
    )

    # Foreign key to users
    user_id: uuid.UUID = Field(
        sa_column=Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    )

    # Token string
    token: str = Field(
        sa_column=Column(String, nullable=False, unique=True, index=True)
    )

    # Revocation flag
    revoked: bool = Field(
        default=False,
        sa_column=Column(Boolean, nullable=False, default=False)
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column("created_at", DateTime(timezone=True), nullable=False)
    )

    expires_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc) + timedelta(days=7),
        sa_column=Column("expires_at", DateTime(timezone=True), nullable=False)
    )
