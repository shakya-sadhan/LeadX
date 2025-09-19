from fastapi import APIRouter, Depends
from sqlmodel.ext.asyncio.session import AsyncSession
from app.db.session import get_session
from app.services.lead_service import chat

router = APIRouter()

@router.post("/chat")
async def chat_leads(user_id: str, message: str = None, db: AsyncSession=Depends(get_session)):
    response = await chat(user_id=user_id, message=message, db=db)
    return response