from database import SessionLocal, engine, Base
from models import Lead, Partner
from datetime import datetime, timedelta
import json

# Sab tables banao (agar exist nahi karte)
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Pehle purana data delete karo (clean slate)
db.query(Lead).delete()
db.query(Partner).delete()
db.commit()

# ── 10 MOCK LEADS ──────────────────────────────────────
leads_data = [
    {
        "name": "Nexora Systems",
        "industry": "FinTech",
        "score": 91,
        "signals": [
            {"label": "Series B raised", "detail": "$40M raised last month — active budget for new tools"},
            {"label": "CTO hire", "detail": "New CTO appointed 3 weeks ago"},
            {"label": "Headcount growth", "detail": "Engineering team grew 60% in 6 months"},
        ]
    },
    {
        "name": "Orbis Health",
        "industry": "HealthTech",
        "score": 78,
        "signals": [
            {"label": "Expansion signal", "detail": "Opened 3 new regional offices in Q3"},
            {"label": "Tech stack change", "detail": "Migrating from legacy CRM to Salesforce"},
        ]
    },
    {
        "name": "Stratford Logistics",
        "industry": "Supply Chain",
        "score": 65,
        "signals": [
            {"label": "Leadership change", "detail": "New VP of Operations joined from a Blostem partner"},
            {"label": "RFP activity", "detail": "Posted 2 vendor RFPs in the last 60 days"},
        ]
    },
    {
        "name": "Velorum Energy",
        "industry": "CleanTech",
        "score": 82,
        "signals": [
            {"label": "Government contract", "detail": "Won $120M federal contract"},
            {"label": "Compliance pressure", "detail": "New ESG reporting mandate requires new software"},
            {"label": "Board change", "detail": "3 new board members with SaaS backgrounds"},
        ]
    },
    {
        "name": "Pinnacle Retail",
        "industry": "Retail",
        "score": 44,
        "signals": [
            {"label": "Slow growth", "detail": "Revenue growth at 4% YoY, below industry average"},
        ]
    },
    {
        "name": "Arctis Manufacturing",
        "industry": "Industrial",
        "score": 57,
        "signals": [
            {"label": "Digital push", "detail": "CEO committed to digital-first strategy for 2025"},
            {"label": "Budget cycle", "detail": "Annual procurement window opens next quarter"},
        ]
    },
    {
        "name": "Luminary Media",
        "industry": "Media & Ad Tech",
        "score": 73,
        "signals": [
            {"label": "Acquisition", "detail": "Acquired smaller competitor — integration spend expected"},
            {"label": "New product launch", "detail": "Launching B2B arm, needs enterprise tooling"},
        ]
    },
    {
        "name": "Caspian Technologies",
        "industry": "SaaS",
        "score": 88,
        "signals": [
            {"label": "IPO prep", "detail": "Filing for IPO next year — vendor consolidation underway"},
            {"label": "Enterprise push", "detail": "Shifting from SMB to enterprise segment"},
        ]
    },
    {
        "name": "Delphi Insurance",
        "industry": "InsurTech",
        "score": 61,
        "signals": [
            {"label": "Regulation change", "detail": "New IRDAI guidelines require updated compliance stack"},
        ]
    },
    {
        "name": "Solaris Biotech",
        "industry": "BioTech",
        "score": 69,
        "signals": [
            {"label": "Series A raised", "detail": "$18M raised — scaling operations"},
            {"label": "Hiring spree", "detail": "50+ open roles posted in the last month"},
        ]
    },
]

for data in leads_data:
    lead = Lead(
        name=data["name"],
        industry=data["industry"],
        score=data["score"],
        signals=data["signals"]
    )
    db.add(lead)

# ── 5 MOCK PARTNERS ─────────────────────────────────────
now = datetime.utcnow()

partners_data = [
    {"name": "Meridian Consulting Group", "stage": "Onboarding",  "days_inactive": 23},
    {"name": "Altus Financial Partners",  "stage": "Integration", "days_inactive": 31},
    {"name": "Crestwood Ventures",        "stage": "Active",      "days_inactive": 9},
    {"name": "Ironclad Systems",          "stage": "Stalled",     "days_inactive": 47},
    {"name": "Beacon Growth Partners",    "stage": "Onboarding",  "days_inactive": 14},
]

for data in partners_data:
    partner = Partner(
        name=data["name"],
        stage=data["stage"],
        signed_date=now - timedelta(days=data["days_inactive"] + 10),
        last_active=now - timedelta(days=data["days_inactive"])
    )
    db.add(partner)

db.commit()
db.close()

print("✓ Database seeded successfully!")
print(f"  → {len(leads_data)} leads added")
print(f"  → {len(partners_data)} partners added")