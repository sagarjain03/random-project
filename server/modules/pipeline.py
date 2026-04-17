from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Lead
import google.genai as genai
from google.genai import types as genai_types
from dotenv import load_dotenv
import os
import json
import asyncio
import time

load_dotenv()

# Gemini client — new google.genai SDK
_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

router = APIRouter()

# ── IN-MEMORY CACHE (60s TTL) ────────────────────────────────────────
# External library ki zaroorat nahi — sirf dict + time
_leads_cache: dict = {"data": None, "ts": 0.0}
_CACHE_TTL = 60  # seconds

# ── HELPER FUNCTION ─────────────────────────────────────────────────
async def score_single_lead(lead: Lead) -> dict:
    prompt = f"""
You are a B2B sales intelligence expert. Analyze this company and determine
how likely they are to purchase a new enterprise SaaS product right now.

Company: {lead.name}
Industry: {lead.industry}
Existing signals: {json.dumps(lead.signals or [])}

Return ONLY a valid JSON object with this exact structure — no extra text, no markdown:
{{
    "score": <integer between 0 and 100>,
    "signals": [
        {{
            "label": "<short signal name, max 4 words>",
            "detail": "<one sentence explanation of why this is a buying signal>"
        }}
    ]
}}

Scoring guide:
- 80-100: Strong buying signals — expansion, new funding, leadership change, compliance pressure
- 60-79:  Moderate signals — some growth indicators but timing unclear
- 40-59:  Weak signals — stable company but no clear trigger
- 0-39:   Low intent — no signals of active buying

Return 2-4 signals maximum. Be specific and realistic.
"""

    try:
        # Gemini ko prompt bhejo — asyncio.to_thread kyunki SDK sync hai
        response = await asyncio.to_thread(
            _client.models.generate_content,
            model="gemini-2.5-flash",
            contents=prompt
        )

        # Response text saaf karo — strip markdown fences
        raw = response.text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        # JSON parse karo
        result = json.loads(raw)

        return {
            "score": max(0, min(100, int(result["score"]))),
            "signals": result.get("signals", [])
        }

    except Exception as e:
        print(f"Gemini error for {lead.name}: {e}")
        return {
            "score": 50,
            "signals": []
        }


# ── ROUTES ──────────────────────────────────────────────────────────

@router.get("/leads")
async def get_leads(db: Session = Depends(get_db)):
    try:
        # Cache check karo — agar fresh hai toh DB hit mat karo
        now = time.time()
        if _leads_cache["data"] is not None and (now - _leads_cache["ts"]) < _CACHE_TTL:
            print("[Cache HIT] /api/leads")
            return {"data": _leads_cache["data"], "error": None}

        print("[Cache MISS] /api/leads — DB se fetch kar rahe hain")
        leads = db.query(Lead).order_by(Lead.score.desc()).all()
        payload = [
            {
                "id": lead.id,
                "name": lead.name,
                "industry": lead.industry,
                "score": lead.score,
                "signals": lead.signals or []
            }
            for lead in leads
        ]

        # Cache update karo
        _leads_cache["data"] = payload
        _leads_cache["ts"] = now

        return {"data": payload, "error": None}
    except Exception as e:
        return {"data": None, "error": str(e)}


@router.post("/leads/score")
async def score_leads(db: Session = Depends(get_db)):
    try:
        leads = db.query(Lead).all()

        if not leads:
            return {"data": None, "error": "No leads found in database"}

        print(f"Scoring {len(leads)} leads with Gemini...")

        tasks = [score_single_lead(lead) for lead in leads]
        results = await asyncio.gather(*tasks)

        for lead, result in zip(leads, results):
            lead.score = result["score"]
            lead.signals = result["signals"]
            print(f"  -> {lead.name}: {result['score']}/100")

        db.commit()

        # Scoring ke baad cache bust karo — next GET fresh data lega
        _leads_cache["data"] = None
        _leads_cache["ts"] = 0.0
        print("[Cache BUSTED] /api/leads — scoring complete")

        return {
            "data": {
                "leads_scored": len(leads)
            },
            "error": None
        }

    except Exception as e:
        db.rollback()
        return {"data": None, "error": str(e)}