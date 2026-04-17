from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db, SessionLocal
from models import Partner, NudgeQueue
from pydantic import BaseModel
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from dotenv import load_dotenv
import google.generativeai as genai
import asyncio
import os
from datetime import datetime, timedelta

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

router = APIRouter()

# ── PYDANTIC MODEL ───────────────────────────────────────
class SendNudgeRequest(BaseModel):
    partner_id: str

# ── HELPER — Nudge email generate karo ──────────────────
async def generate_nudge_email(partner_name: str, stage: str, days_inactive: int) -> str:
    prompt = f"""
You are a Partner Success Manager at Blostem, an AI-powered B2B marketing engine.

Write a warm, helpful re-engagement email for a partner who has gone inactive.

Partner details:
- Company name: {partner_name}
- Current stage: {stage}
- Days since last activity: {days_inactive}

Email tone rules:
- Warm and helpful — not pushy or guilt-tripping
- Acknowledge they are busy — don't make them feel bad
- Offer specific, concrete help based on their stage:
  * Onboarding: help with setup, quick start guide
  * Integration: help unblocking technical issues
  * Active: share a useful feature they might have missed
  * Stalled: genuinely ask what is blocking them, offer to pause gracefully
- Keep it under 150 words
- End with ONE clear call to action

Write the subject line on the first line.
Then write the email body.
Do not add labels like "Subject:" — just write directly.
Return ONLY the email — no extra commentary.
"""
    try:
        response = await asyncio.to_thread(
            model.generate_content,
            prompt
        )
        return response.text.strip()
    except Exception as e:
        print(f"Nudge generation error for {partner_name}: {e}")
        return f"Hi [Name],\n\nWe noticed {partner_name} hasn't been active recently. We'd love to help you get started — reply to this email and we'll set up a quick call.\n\nBest,\nBlostem Partner Success"


# ── HELPER — Stalled partners dhundho aur queue refresh karo ─────────
async def refresh_nudge_queue():
    db = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(days=7)

        # Partners jo 7+ din se inactive hain
        stalled = db.query(Partner).filter(
            Partner.last_active < cutoff
        ).all()

        print(f"Found {len(stalled)} stalled partners")

        for partner in stalled:
            # Check karo ki already unsent nudge hai
            existing = db.query(NudgeQueue).filter(
                NudgeQueue.partner_id == partner.id,
                NudgeQueue.sent == False
            ).first()

            if existing:
                # Already ek pending nudge hai — skip
                continue

            # Days inactive calculate karo
            days_inactive = (datetime.utcnow() - partner.last_active).days

            # AI se nudge email generate karo
            draft = await generate_nudge_email(
                partner.name,
                partner.stage,
                days_inactive
            )

            # Queue mein add karo
            nudge = NudgeQueue(
                partner_id=partner.id,
                draft_email=draft,
                sent=False
            )
            db.add(nudge)
            print(f"  -> Nudge created for {partner.name} ({days_inactive}d inactive)")

        db.commit()

    except Exception as e:
        print(f"Queue refresh error: {e}")
        db.rollback()
    finally:
        db.close()


# ── ROUTES ───────────────────────────────────────────────

# GET /api/nudge/queue
# Sagar ka nudge page yeh call karta hai
@router.get("/nudge/queue")
async def get_nudge_queue(db: Session = Depends(get_db)):
    try:
        # Pehle queue refresh karo — naye stalled partners add karo
        await refresh_nudge_queue()

        # Cutoff calculate karo
        cutoff = datetime.utcnow() - timedelta(days=7)

        # Unsent nudges lo — partner data ke saath
        nudges = db.query(NudgeQueue).filter(
            NudgeQueue.sent == False
        ).all()

        result = []
        for nudge in nudges:
            partner = db.query(Partner).filter(
                Partner.id == nudge.partner_id
            ).first()

            if not partner:
                continue

            days_inactive = (datetime.utcnow() - partner.last_active).days

            result.append({
                "partner_id": partner.id,
                "name": partner.name,
                "days_inactive": days_inactive,
                "stage": partner.stage,
                "draft_email": nudge.draft_email,
                "nudge_id": nudge.id
            })

        # Sort by days_inactive descending — most urgent first
        result.sort(key=lambda x: x["days_inactive"], reverse=True)

        return {"data": result, "error": None}

    except Exception as e:
        print(f"Get nudge queue error: {e}")
        return {"data": None, "error": str(e)}


# POST /api/nudge/send
# Sagar ka "Send nudge" button yeh call karta hai
@router.post("/nudge/send")
async def send_nudge(request: SendNudgeRequest, db: Session = Depends(get_db)):
    try:
        partner_id = request.partner_id

        if not partner_id:
            return {"data": None, "error": "partner_id is required"}

        # Partner dhundho
        partner = db.query(Partner).filter(
            Partner.id == partner_id
        ).first()

        if not partner:
            return {"data": None, "error": f"Partner '{partner_id}' not found"}

        # Unsent nudge dhundho
        nudge = db.query(NudgeQueue).filter(
            NudgeQueue.partner_id == partner_id,
            NudgeQueue.sent == False
        ).first()

        if not nudge:
            return {"data": None, "error": "No pending nudge found for this partner"}

        # Sent mark karo
        nudge.sent = True
        db.commit()

        print(f"-> Nudge marked as sent for {partner.name}")

        # Optional: SendGrid se actual email bhejo
        # Abhi ke liye sirf DB mein mark karo
        sendgrid_key = os.getenv("SENDGRID_API_KEY")
        if sendgrid_key and sendgrid_key != "optional_for_now":
            # SendGrid integration yahan aayega
            pass

        return {
            "data": {
                "message": f"Nudge sent successfully for {partner.name}",
                "partner_name": partner.name
            },
            "error": None
        }

    except Exception as e:
        print(f"Send nudge error: {e}")
        return {"data": None, "error": str(e)}


# ── APSCHEDULER — Daily cron job ─────────────────────────
# Yeh automatically roz subah 9 baje chalega
# Naye stalled partners dhundhega aur queue mein add karega
scheduler = AsyncIOScheduler()

def start_scheduler():
    scheduler.add_job(
        refresh_nudge_queue,
        trigger="cron",
        hour=9,
        minute=0,
        id="daily_nudge_refresh",
        replace_existing=True
    )
    scheduler.start()
    print("-> APScheduler started — daily nudge refresh at 9:00 AM")