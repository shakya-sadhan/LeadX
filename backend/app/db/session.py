from app.core.config import get_settings
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from collections.abc import AsyncGenerator

setting = get_settings()

engine = create_async_engine(
    setting.DATABASE_URL,
    echo = setting.DEBUG,
    future = True,
    pool_size = 10,
    max_overflow = 20,
)

async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# FastAPI dependency
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session