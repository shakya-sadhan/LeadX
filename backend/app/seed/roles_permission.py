# app/seed/roles_permissions.py
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.authorization import Role, Permission
from app.models.users import User
from app.core.security import hash_password


async def seed_roles_permissions(db: AsyncSession):
    """Seed roles, permissions, and ensure superadmin has all permissions."""
    roles = ["superadmin", "admin", "user"]
    permissions = ["create_user", "delete_user", "edit_user", "view_user"]

    role_objs = {}
    perm_objs = {}

    # Seed roles
    for role_name in roles:
        result = await db.exec(select(Role).where(Role.name == role_name))
        role = result.first()
        if not role:
            role = Role(name=role_name)
            db.add(role)
            await db.flush()
        role_objs[role_name] = role

    # Seed permissions
    for perm_name in permissions:
        result = await db.exec(select(Permission).where(Permission.name == perm_name))
        perm = result.first()
        if not perm:
            perm = Permission(name=perm_name)
            db.add(perm)
            await db.flush()
        perm_objs[perm_name] = perm

    await db.commit()

    # Reload superadmin role with permissions
    result = await db.exec(
        select(Role)
        .where(Role.name == "superadmin")
        .options(selectinload(Role.permissions))
    )
    superadmin_role = result.first()

    if superadmin_role:
        # Always ensure superadmin has ALL permissions
        superadmin_role.permissions = list(perm_objs.values())
        db.add(superadmin_role)
        await db.commit()

    print("✅ Roles and permissions seeded successfully!")


async def seed_default_superadmin(
    db: AsyncSession,
    username="superadmin",
    email="superadmin@example.com",
    password="supersecret"
):
    """Seed default superadmin user with the superadmin role."""
    result = await db.exec(select(User).where(User.username == username))
    existing_user = result.first()
    if existing_user:
        print("ℹ️ Superadmin user already exists, skipping seeding.")
        return

    # Load superadmin role (with permissions)
    result = await db.exec(
        select(Role)
        .where(Role.name == "superadmin")
        .options(selectinload(Role.permissions))
    )
    superadmin_role = result.first()

    user = User(
        username=username,
        email=email,
        password_hash=hash_password(password),
        is_active=True,
    )

    if superadmin_role:
        user.roles.append(superadmin_role)

    db.add(user)
    await db.commit()

    print(f"✅ Default superadmin '{username}' created with superadmin role.")
