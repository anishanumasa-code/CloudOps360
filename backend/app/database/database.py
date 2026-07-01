import os
import urllib.parse
from sqlalchemy import create_engine

# 1. Type your raw local password here. 
# urllib.parse.quote_plus will automatically convert '@' to '%40' behind the scenes.
raw_password = "Anish@18"
safe_password = urllib.parse.quote_plus(raw_password)

# 2. Build your local connection string using the safe password
local_db_url = f"postgresql://postgres:{safe_password}@localhost:5432/cloudops360"

# 3. Grab the cloud URL if on Render, otherwise fall back to your local one
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", local_db_url)

# 4. Fix Render's specific "postgres://" naming quirk
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 5. Spin up the engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)