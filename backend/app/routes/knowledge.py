from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Text, or_
from sqlalchemy.orm import Session
from typing import List

from app.database.database import Base
from app.database.session import SessionLocal
from app.core.dependencies import get_current_user
from app.models.user import User

# ---------------------------------------------------------
# 1. THE DATABASE MODEL
# ---------------------------------------------------------
class KnowledgeArticle(Base):
    __tablename__ = "knowledge_base"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)
    issue_description = Column(Text)
    resolution = Column(Text)

# ---------------------------------------------------------
# 2. THE PYDANTIC SCHEMAS
# ---------------------------------------------------------
class ArticleCreate(BaseModel):
    title: str
    issue_description: str
    resolution: str

class ArticleResponse(ArticleCreate):
    id: int
    class Config:
        from_attributes = True

# ---------------------------------------------------------
# 3. THE API ROUTER & ENDPOINTS
# ---------------------------------------------------------
router = APIRouter(prefix="/knowledge", tags=["Knowledge Base"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ArticleResponse)
def save_solution(article: ArticleCreate, db: Session = Depends(get_db)):
    """Saves a resolved incident and AI explanation into the Knowledge Base."""
    new_article = KnowledgeArticle(
        title=article.title,
        issue_description=article.issue_description,
        resolution=article.resolution
    )
    db.add(new_article)
    db.commit()
    db.refresh(new_article)
    return new_article

@router.get("/search", response_model=List[ArticleResponse])
def search_knowledge(query: str, db: Session = Depends(get_db)):
    """Searches past incidents to find existing solutions before pinging the AI."""
    search_term = f"%{query}%"
    articles = db.query(KnowledgeArticle).filter(
        or_(
            KnowledgeArticle.title.ilike(search_term),
            KnowledgeArticle.issue_description.ilike(search_term),
            KnowledgeArticle.resolution.ilike(search_term)
        )
    ).all()
    return articles