from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./blostem.db")

# Engine = database se connection
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # SQLite ke liye zaroori hai
)

# SessionLocal = har request ke liye ek session (connection)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base = sab tables is se inherit karenge
Base = declarative_base()

# Yeh function har API request mein database session deta hai
# aur kaam hone ke baad automatically band kar deta hai
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()