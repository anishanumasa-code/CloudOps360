from fastapi import FastAPI
from sqlalchemy import text

from app.database.database import Base, engine
from app.models import *

from app.routes.auth import router as auth_router
from app.routes.test import router as test_router
from app.routes.cloud_resource import router as cloud_router
from app.routes.system_metric import router as metric_router
from app.routes.log import router as log_router
from app.routes.incident import router as incident_router
from app.routes.ai_report import router as ai_router
from app.routes.knowledge import router as knowledge_router
from app.routes.dashboard import router as dashboard_router
from app.routes.mfa import router as mfa_router  # <--- Added the MFA Router

from prometheus_fastapi_instrumentator import Instrumentator
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="CloudOps 360 API",
    description="AI-Assisted Cloud Operations Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Instrumentator().instrument(app).expose(app)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(test_router)
app.include_router(cloud_router)
app.include_router(metric_router)
app.include_router(log_router)
app.include_router(incident_router)  
app.include_router(ai_router)
app.include_router(knowledge_router)
app.include_router(dashboard_router)
app.include_router(mfa_router)  # <--- Registered the MFA Router

# Consolidated the root route
@app.get("/")
def home():
    return {"status": "online", "message": "CloudOps 360 API is fully operational"}

@app.get("/health")
def health():
    return {"status": "Healthy"}

@app.get("/db-test")
def db_test():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "Database Connected Successfully"}
    except Exception as e:
        return {"error": str(e)}