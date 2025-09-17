from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from app.db.session import get_session
from app.models.authorization import Role, Permission
from app.schemas.authorization import (
    RoleCreate, RoleRead, RoleUpdate,
    PermissionCreate, PermissionRead, PermissionUpdate
)
from app.services.authorization import RoleService, PermissionService
from typing import List
import uuid

router = APIRouter(prefix="/authorize", tags=["Authorization"])

# ----------------- Role Endpoints -----------------
@router.post("/roles", response_model=RoleRead)
async def create_role(role: RoleCreate, session: AsyncSession = Depends(get_session)):
    service = RoleService(session)
    db_role = Role(**role.model_dump())
    created = await service.create_role(db_role)
    return RoleRead.model_validate(created)

@router.get("/roles", response_model=List[RoleRead])
async def list_roles(session: AsyncSession = Depends(get_session)):
    service = RoleService(session)
    roles = await service.list_roles()
    return [RoleRead.model_validate(r) for r in roles]

@router.get("/roles/{role_id}", response_model=RoleRead)
async def get_role(role_id: uuid.UUID, session: AsyncSession = Depends(get_session)):
    service = RoleService(session)
    role = await service.get_role(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return RoleRead.model_validate(role)

@router.put("/roles/{role_id}", response_model=RoleRead)
async def update_role(role_id: uuid.UUID, data: RoleUpdate, session: AsyncSession = Depends(get_session)):
    service = RoleService(session)
    role = await service.get_role(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    updated = await service.update_role(role, data.name)
    return RoleRead.model_validate(updated)

@router.delete("/roles/{role_id}")
async def delete_role(role_id: uuid.UUID, session: AsyncSession = Depends(get_session)):
    service = RoleService(session)
    ok = await service.delete_role(role_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Role not found")
    return {"ok": True}

@router.put("/roles/{role_id}/permissions", response_model=RoleRead)
async def assign_permissions(role_id: uuid.UUID, permission_ids: List[uuid.UUID], session: AsyncSession = Depends(get_session)):
    service = RoleService(session)
    try:
        role = await service.assign_permissions(role_id, permission_ids)
        return RoleRead.model_validate(role)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# ----------------- Permission Endpoints -----------------
@router.post("/permissions", response_model=PermissionRead)
async def create_permission(permission: PermissionCreate, session: AsyncSession = Depends(get_session)):
    service = PermissionService(session)
    db_permission = Permission(**permission.model_dump())
    created = await service.create_permission(db_permission)
    return PermissionRead.model_validate(created)

@router.get("/permissions", response_model=List[PermissionRead])
async def list_permissions(session: AsyncSession = Depends(get_session)):
    service = PermissionService(session)
    permissions = await service.list_permissions()
    return [PermissionRead.model_validate(p) for p in permissions]

@router.get("/permissions/{permission_id}", response_model=PermissionRead)
async def get_permission(permission_id: uuid.UUID, session: AsyncSession = Depends(get_session)):
    service = PermissionService(session)
    permission = await service.get_permission(permission_id)
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    return PermissionRead.model_validate(permission)

@router.put("/permissions/{permission_id}", response_model=PermissionRead)
async def update_permission(permission_id: uuid.UUID, data: PermissionUpdate, session: AsyncSession = Depends(get_session)):
    service = PermissionService(session)
    permission = await service.get_permission(permission_id)
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    updated = await service.update_permission(permission, data.name)
    return PermissionRead.model_validate(updated)

@router.delete("/permissions/{permission_id}")
async def delete_permission(permission_id: uuid.UUID, session: AsyncSession = Depends(get_session)):
    service = PermissionService(session)
    ok = await service.delete_permission(permission_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Permission not found")
    return {"ok": True}
