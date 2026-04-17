from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, JSON
from sqlalchemy.sql import func
from database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

# LEADS TABLE
# Yeh table un companies ko store karti hai
# jinhe Blostem apna product bechna chahta hai
class Lead(Base):
    __tablename__ = "leads"

    id          = Column(String, primary_key=True, default=generate_uuid)
    name        = Column(String, nullable=False)      # Company ka naam
    industry    = Column(String, nullable=False)      # FinTech, HealthTech etc
    score       = Column(Integer, default=0)          # AI-generated 0-100
    signals     = Column(JSON, default=list)          # [{label, detail}]
    created_at  = Column(DateTime, default=func.now())


# PARTNERS TABLE
# Yeh table un companies ko store karti hai
# jinhone Blostem khareed liya lekin use nahi kar rahe
class Partner(Base):
    __tablename__ = "partners"

    id          = Column(String, primary_key=True, default=generate_uuid)
    name        = Column(String, nullable=False)
    signed_date = Column(DateTime, default=func.now())
    last_active = Column(DateTime, default=func.now())
    stage       = Column(String, default="Onboarding")
    # stage options: Onboarding, Integration, Active, Stalled


# NUDGE QUEUE TABLE
# Yeh table AI-generated nudge emails store karti hai
# jo stalled partners ko bheji jaayengi
class NudgeQueue(Base):
    __tablename__ = "nudge_queue"

    id          = Column(String, primary_key=True, default=generate_uuid)
    partner_id  = Column(String, nullable=False)      # Partner ka ID
    draft_email = Column(Text, nullable=False)        # AI-generated email
    created_at  = Column(DateTime, default=func.now())
    sent        = Column(Boolean, default=False)      # Bheja gaya ya nahi