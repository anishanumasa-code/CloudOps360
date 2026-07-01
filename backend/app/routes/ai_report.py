import psutil
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text
from google import genai
from google.genai import types

from app.database.session import SessionLocal

router = APIRouter(prefix="/api/ai", tags=["AI Co-Pilot"])
client = genai.Client()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ChatRequest(BaseModel):
    prompt: str

class ChatResponse(BaseModel):
    reply: str

@router.post("/chat", response_model=ChatResponse)
def ai_chat(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        # 1. SEARCH THE KNOWLEDGE BASE (The Memory Layer)
        # We look for keywords from the user's prompt in past resolutions.
        # Note: If you add pgvector to PostgreSQL later, this becomes an ultra-smart semantic search!
        search_query = text("""
            SELECT original_issue, resolution_steps 
            FROM knowledge_base 
            WHERE original_issue ILIKE :keyword 
            LIMIT 3
        """)
        
        # Simple keyword extraction (grabbing the first long word as a basic search for now)
        keywords = [word for word in request.prompt.split() if len(word) > 4]
        search_term = f"%{keywords[0]}%" if keywords else "%error%"
        
        past_incidents = db.execute(search_query, {"keyword": search_term}).fetchall()
        
        # 2. FORMAT THE HISTORICAL MEMORY
        historical_context = "PREVIOUSLY RESOLVED INCIDENTS (Use these if relevant to the current query):\n"
        if not past_incidents:
            historical_context += "No similar past incidents found.\n"
        else:
            for incident in past_incidents:
                historical_context += f"- Past Issue: {incident.original_issue}\n  Proven Fix: {incident.resolution_steps}\n\n"

        # 3. GATHER LIVE METRICS
        cpu_usage = psutil.cpu_percent(interval=0.1)
        ram_usage = psutil.virtual_memory().percent

        # 4. BUILD THE SYSTEM INSTRUCTION (Combining Live Data + Past Memory)
        system_identity = f"""
        You are an elite CloudOps Site Reliability Engineer (SRE) AI.
        
        LIVE SYSTEM STATE:
        CPU: {cpu_usage}% | RAM: {ram_usage}%
        
        {historical_context}
        
        INSTRUCTIONS:
        1. Answer the user's query.
        2. If the user's issue matches a "PREVIOUSLY RESOLVED INCIDENT", strongly recommend the "Proven Fix".
        3. If you suggest a fix, ask the user if they want you to execute it.
        """

        # 5. GENERATE RESPONSE
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=request.prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_identity,
                temperature=0.2
            )
        )
        
        return {"reply": response.text}
        
    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to connect to AI Core.")