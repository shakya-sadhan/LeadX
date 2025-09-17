import json
from fastapi import APIRouter, Depends
from app.core.config import get_settings
from app.db.session import get_session
from app.schemas.lead import LeadPreview, LeadResponse, LeadCreate
from langchain.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from sqlmodel.ext.asyncio.session import AsyncSession
from app.models.lead import Lead
from sqlmodel import select

settings = get_settings()
router = APIRouter(prefix="/chat")

llm = ChatGoogleGenerativeAI(
    model= settings.GEMINI_MODEL,
    google_api_key=settings.GEMINI_API_KEY,
)


lead_prompt = ChatPromptTemplate.from_template(
    """
    You are a lead generation assistant.
    Generate {limit} company leads in JSON array format.

    Each object must include:
    - business_name
    - industry
    - contact_person
    - designation
    - address
    - country
    - contact_number
    - email
    - website
    - summary
    - lead_score (1-100)

    Target:
    Clients: {clients}
    Industry: {industry}
    Location: {location}

    Format strictly as JSON array.
    """
)

chat_memory = {}


async def chat(user_id: str, message: str = None, action: str = None, db: AsyncSession = Depends(get_session)):
    # Initialize new user flow
    if user_id not in chat_memory:
        chat_memory[user_id] = {"step": 1}

    mem = chat_memory[user_id]
    step = mem["step"]

    # Step 1 → Ask for type of clients
    if step == 1:
        mem["step"] = 2
        print(f"[User {user_id}] asked: {message}")
        return {"bot": "What type of clients are you looking for?"}

    # Step 2 → Store clients, ask for industry
    if step == 2:
        mem["clients"] = message
        mem["step"] = 3
        print(f"[User {user_id}] answered clients: {message}")
        return {"bot": "Got it! What industry are you targeting?"}

    # Step 3 → Store industry, ask for location
    if step == 3:
        mem["industry"] = message
        mem["step"] = 4
        print(f"[User {user_id}] answered industry: {message}")
        return {"bot": "Great! What location do you prefer?"}

    # Step 4 → Generate lead preview using Gemini
    if step == 4:
        mem["location"] = message
        return await generate_preview(mem)

    # Step 5 → Save leads to database
    if step == 5 and action == "save":
        return await save_leads(mem, db)
    return {"bot": "Step not implemented yet."}


async def generate_preview(mem: dict):
    """
    Generates lead preview using Gemini API and returns a table with more fields.
    """
    # Generate leads using LangChain and Gemini
    chain = lead_prompt | llm
    result = chain.invoke({
        "clients": mem["clients"],
        "industry": mem["industry"],
        "location": mem["location"],
        "limit": 5
    })

    # Log the raw response for debugging
    print(f"[Gemini Response] {result.content}")  # Log the raw response

    # Clean up and parse the result
    try:
        cleaned_content = result.content.strip().replace("```json", "").replace("```", "")
        print(f"[Cleaned Content] {cleaned_content}")

        preview = json.loads(cleaned_content)  
        mem["preview"] = [LeadCreate(**lead) for lead in preview]
    except Exception as e:
        mem["preview"] = []
        print(f"[Error] Failed to parse Gemini response: {e}")


    table = {
        "columns": [
            "Business Name", "Industry", "Country", "Email", "Website"
        ],
        "rows": [
            [
                lead.business_name,
                lead.industry or "-",
                lead.country or "-",
                lead.email or "-",
                lead.website or "-"
            ]
            for lead in mem["preview"]
        ]
    }
    mem["step"] = 5
    return {
        "bot": "Here’s a preview of leads I found:",
        "table": table,
        "button": {"label": "Continue", "action": "save"}
    }

async def save_leads(mem: dict, db: AsyncSession):
    if "preview" not in mem or not mem["preview"]:
        return {"bot": "No lead found to save."}
    
    for lead in mem['preview']:
        lead_data = Lead(
            business_name=lead.business_name,
            industry=lead.industry,
            contact_person=lead.contact_person,
            designation=lead.designation,
            address=lead.address,
            country=lead.country,
            contact_number=lead.contact_number,
            email=lead.email,
            website=lead.website,
            summary=lead.summary,
            lead_score=lead.lead_score,
            verified=False
        )

        db.add(lead_data)

    await db.commit()
    await db.refresh(lead_data)
    return {"bot": "Leads saved successfully."}