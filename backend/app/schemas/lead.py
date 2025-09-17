from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
import uuid


class LeadPreview(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    business_name: str
    industry: Optional[str] = None
    country: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str]=None


class LeadCreate(BaseModel):
    business_name: str
    industry: Optional[str] = None
    contact_person: Optional[str] = None
    designation: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None
    contact_number: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    summary: Optional[str] = None
    lead_score: Optional[int] = None
    verified: Optional[bool] = False

class LeadResponse(LeadPreview):
    id: uuid.UUID
    verified: bool