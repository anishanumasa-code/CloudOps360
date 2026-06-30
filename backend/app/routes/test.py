from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(tags=["Test"])


@router.get("/test")
def test(current_user: User = Depends(get_current_user)):
    return {
        "message": "Authenticated",
        "user": current_user.email
    }