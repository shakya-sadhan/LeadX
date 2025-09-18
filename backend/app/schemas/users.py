from pydantic import BaseModel, EmailStr, StringConstraints
from typing import Annotated, List, Optional
import uuid
from datetime import datetime

# Reusable types
PasswordStr = Annotated[str, StringConstraints(min_length=8, max_length=128)]


# Shared properties
class UserBase(BaseModel):
    username: str
    email: EmailStr
    is_active: bool = True


# Self-registration
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: PasswordStr


# Admin-created user
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: Optional[PasswordStr] = None
    role_ids: List[uuid.UUID]


# Login
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Update user
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[PasswordStr] = None
    is_active: Optional[bool] = None
    role_ids: Optional[List[uuid.UUID]] = None


# Response / Read user
class UserRead(UserBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    roles: List[str]
    profile_pic: Optional[str] = None
    google_sub: Optional[str] = None

    model_config = {"from_attributes": True}


# JWT Token responses
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    refresh_token: str
