from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import SessionLocal

# Import our dependencies and models
from app.core.dependencies import get_current_user
from app.models.user import User
from app.routes.knowledge import KnowledgeArticle

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Aggregates system-wide metrics for the frontend CloudOps Dashboard."""
    
    # 1. Fetch REAL Data from existing tables
    total_users = db.query(User).count()
    total_kb_articles = db.query(KnowledgeArticle).count()

    # 2. Establish Operational Metrics (Ready to be wired to Phase 4/5/6 tables)
    active_incidents = 3 
    resolved_today = 12
    system_health_score = 98.5
    open_alerts = 2

    # 3. Return the unified JSON structure required by React frontend
    return {
        "status": "success",
        "current_user": {
            "username": current_user.username,
            "role": current_user.role
        },
        "metrics": {
            "users": total_users,
            "knowledge_articles": total_kb_articles,
            "active_incidents": active_incidents,
            "resolved_today": resolved_today,
            "health_score": system_health_score,
            "open_alerts": open_alerts
        },
        "recent_activity": [
            {"time": "Just now", "event": f"User {current_user.username} authenticated successfully."},
            {"time": "10 mins ago", "event": "Automated security scan completed."},
            {"time": "1 hr ago", "event": "Database backup verified."}
        ]
    }