from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from database import engine, Base
from modules.nurture import start_scheduler
# Sab modules import karenge — abhi stubs hain, baad mein fill honge
from modules import pipeline, outreach, compliance, nurture
import os

load_dotenv()

# Tables banao agar exist nahi karte
Base.metadata.create_all(bind=engine)

# FastAPI app banao
app = FastAPI(
    title="Blostem API",
    description="AI-powered B2B Marketing Engine — Backend",
    version="1.0.0"
)


# CORS setup — yeh Sagar ke frontend ko backend se baat karne deta hai
# Bina iske browser block kar deta hai requests ko
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],   # GET, POST, PUT, DELETE sab allow
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    start_scheduler()


# ── GLOBAL ERROR HANDLER ────────────────────────────────
# Koi bhi unhandled exception ko yeh catch karega
# Frontend ko consistent { data, error } shape milega
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"data": None, "error": str(exc)}
    )


# ── ROUTES ──────────────────────────────────────────────

# M0 — Health check
@app.get("/api/ping")
async def ping():
    return {"data": {"status": "ok"}, "error": None}

# M1 — Lead scoring routes
app.include_router(pipeline.router, prefix="/api")

# M2 — Outreach generation routes
app.include_router(outreach.router, prefix="/api")

# M3 — Compliance check routes
app.include_router(compliance.router, prefix="/api")

# M4 — Nudge queue routes
app.include_router(nurture.router, prefix="/api")