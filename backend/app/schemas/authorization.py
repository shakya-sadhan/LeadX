from pydantic import BaseModel, ConfigDict
import uuid
from typing import List

# ----------------- Role Schemas -----------------
class RoleBase(BaseModel):
    name: str


class RoleCreate(RoleBase):
    pass


class RoleRead(RoleBase):
    id: uuid.UUID
    permissions: List["PermissionRead"] = []

    model_config = ConfigDict(from_attributes=True)


class RoleUpdate(BaseModel):
    name: str


# ----------------- Permission Schemas -----------------
class PermissionBase(BaseModel):
    name: str
    module: str  # optional module grouping


class PermissionCreate(PermissionBase):
    pass


class PermissionRead(PermissionBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


class PermissionUpdate(BaseModel):
    name: str


RoleRead.model_rebuild()
