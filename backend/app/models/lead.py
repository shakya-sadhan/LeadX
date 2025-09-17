import uuid
from sqlmodel import SQLModel, Field, Column, String, Integer, Boolean, Relationship, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.models.timestamp import TimestampMixin
from app.models.users import User
from datetime import datetime, timezone


class Lead(SQLModel, table=True):
    __tablename__ = "leads"

    # Required fields
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(UUID(as_uuid=True), primary_key=True, nullable=False),
    )
    business_name: str = Field(sa_column=Column(String, nullable=False, index=True))
    industry: str = Field(sa_column=Column(String, nullable=False, index=True))
    lead_score: int = Field(sa_column=Column(Integer, nullable=False, index=True))
    verified: bool = Field(sa_column=Column(Boolean, nullable=False, default=False))

    # Optional fields
    contact_person: str | None = Field(default=None, sa_column=Column(String, nullable=True))
    designation: str | None = Field(default=None, sa_column=Column(String, nullable=True))
    contact_number: str | None = Field(default=None, sa_column=Column(String, nullable=True))
    email: str | None = Field(default=None, sa_column=Column(String, nullable=True, unique=True, index=True))
    address: str | None = Field(default=None, sa_column=Column(String, nullable=True))
    country: str | None = Field(default=None, sa_column=Column(String, nullable=True))
    website: str | None = Field(default=None, sa_column=Column(String, nullable=True))
    summary: str | None = Field(default=None, sa_column=Column(String, nullable=True))
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False, onupdate=lambda: datetime.now(timezone.utc))
    )
