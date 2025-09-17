from pydantic import BaseModel, EmailStr, StringConstraints
from typing import Annotated, List
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
    password: PasswordStr
    role_ids: List[uuid.UUID] 

# Login
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Update user
class UserUpdate(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    password: PasswordStr | None = None
    is_active: bool | None = None
    role_ids: List[uuid.UUID] | None = None

# Response / Read user
class UserRead(UserBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    roles: List[str]

    model_config = {
        "from_attributes": True 
    }

# JWT Token responses
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenRefresh(BaseModel):
    refresh_token: str
