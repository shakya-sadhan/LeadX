from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import RedirectResponse, JSONResponse
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select

from app.services import oauth_service
from app.db.session import get_session
from app.models.users import User
from app.services.auth_service import AuthService
from app.utils.jwt import create_access_token
from app.core.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/oauth", tags=["OAuth"])


@router.get("/google/login")
def google_login():
    """
    Redirect user to Google's OAuth 2.0 login page.
    """
    url = oauth_service.get_google_login_url(
        client_id=settings.GOOGLE_CLIENT_ID,
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
    )
    return RedirectResponse(url)


@router.get("/google/callback")
async def google_callback(request: Request, session: AsyncSession = Depends(get_session)):
    """
    Handle OAuth callback from Google.
    If user exists → log them in, else → register new account with default role.
    """
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not found")

    # 1️⃣ Get Google user info
    userinfo = await oauth_service.exchange_code_for_userinfo(
        code=code,
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
    )

    google_sub = userinfo.get("id")
    email = userinfo.get("email")
    name = userinfo.get("name")
    picture = userinfo.get("picture")

    if not email:
        raise HTTPException(status_code=400, detail="Google did not return an email")

    # 2️⃣ Check if user exists by google_sub
    result = await session.exec(select(User).where(User.google_sub == google_sub))
    user = result.one_or_none()

    auth_service = AuthService(session)

    if not user:
        # 2a. Fallback: check by email
        result = await session.exec(select(User).where(User.email == email))
        user = result.one_or_none()

        if user:
            # Attach google_sub and picture if user exists
            user.google_sub = google_sub
            user.profile_pic = picture
        else:
            # 2b. Register new user via OAuth with default role
            user = await auth_service.register_user(
                username=name or email.split("@")[0],
                email=email,
                password=None,  # No password for OAuth 
                profile_pic=picture,
                google_sub=google_sub
            )

    else:
        # Optional: update profile picture if changed
        if picture and user.profile_pic != picture:
            user.profile_pic = picture
            session.add(user)
            await session.commit()
            await session.refresh(user)

    # 3️⃣ Generate tokens
    access_token = create_access_token(user.id)
    refresh_token = await auth_service.create_and_store_refresh_token(user, revoke_old=False)

    return JSONResponse(
        {
            "id": str(user.id),
            "username": user.username,
            "email": user.email,
            "profile_pic": user.profile_pic,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }
    )