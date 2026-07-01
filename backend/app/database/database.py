import os
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base # We need to import these!

# 1. Password encoding
raw_password = "Anish@18" # Make sure to put your real password here
safe_password = urllib.parse.quote_plus(raw_password)

# 2. Local connection string (adjust 'postgres' if your user/db is different)
local_db_url = f"postgresql://postgres:{safe_password}@localhost:5432/postgres"

# 3. Cloud fallback logic
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", local_db_url)

if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 4. Create the engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 5. RESTORED: The session and base classes that FastAPI needs!
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()