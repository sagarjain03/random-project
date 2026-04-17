from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Lead
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, SystemMessage
from dotenv import load_dotenv
import os
import asyncio
import warnings

# Suppress Pydantic V1 / Python 3.14 compatibility warnings
warnings.filterwarnings("ignore", category=UserWarning, module="langchain_core")

load_dotenv()

router = APIRouter()

# ── LangChain LLM setup ─────────────────────────────────────────────
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.7,
    convert_system_message_to_human=True
)

# ── BRAND VOICE ─────────────────────────────────────────────────────
BRAND_VOICE = """
You are a senior account executive at Blostem, an AI-powered B2B marketing engine.

Brand voice rules — follow these strictly:
- Tone: confident but not arrogant, warm but not casual
- Length: 150-200 words maximum — enterprise buyers are busy
- Structure: subject line first, then body
- No buzzwords: never use "synergy", "leverage", "paradigm", "holistic"
- Always personalise: use the company name and their specific signals
- End with ONE clear call to action — not multiple asks
- Never make unverified claims — qualify statistics with "typically" or "on average"
- Format: plain text email, no bullet points unless listing 3+ items
"""

# ── PERSONA PROMPTS ─────────────────────────────────────────────────

CTO_PROMPT = ChatPromptTemplate.from_messages([
    SystemMessage(content=BRAND_VOICE),
    HumanMessage(content="""
Write a cold outreach email for the CTO of {company_name}.

Company details:
- Industry: {industry}
- Buying signals: {signals}

CTO focus areas — cover 1-2 of these based on their signals:
- API integration simplicity and documentation quality
- Security certifications (SOC 2, GDPR, ISO 27001)
- Infrastructure flexibility (cloud, on-prem, hybrid)
- Developer experience and time-to-integrate
- Uptime SLA and support quality

Start with the subject line on the first line.
Then write the email body.
Do not add labels like "Subject:" — just write the subject line directly.
""")
])

CFO_PROMPT = ChatPromptTemplate.from_messages([
    SystemMessage(content=BRAND_VOICE),
    HumanMessage(content="""
Write a cold outreach email for the CFO of {company_name}.

Company details:
- Industry: {industry}
- Buying signals: {signals}

CFO focus areas — cover 1-2 of these based on their signals:
- Cost reduction and tooling consolidation
- Predictable pricing model (no usage surprises)
- ROI timeline and payback period
- Budget cycle alignment
- Risk reduction through compliance

Start with the subject line on the first line.
Then write the email body.
Do not add labels like "Subject:" — just write the subject line directly.
""")
])

USER_PROMPT = ChatPromptTemplate.from_messages([
    SystemMessage(content=BRAND_VOICE),
    HumanMessage(content="""
Write a cold outreach email for the end user / team lead at {company_name}.

Company details:
- Industry: {industry}
- Buying signals: {signals}

End user focus areas — cover 1-2 of these based on their signals:
- Ease of use and zero training required
- Time saved on repetitive daily tasks
- Clean UI and intuitive workflow
- Real examples of what their team will do differently
- Quick wins visible in the first week

Start with the subject line on the first line.
Then write the email body.
Do not add labels like "Subject:" — just write the subject line directly.
""")
])


# ── HELPER — Single draft generate karo ─────────────────────────────
async def generate_single_draft(
    prompt_template: ChatPromptTemplate,
    company_name: str,
    industry: str,
    signals: list
) -> str:
    try:
        # Signals ko readable string mein convert karo
        signals_text = "\n".join([
            f"- {s['label']}: {s['detail']}"
            for s in signals
        ]) if signals else "No specific signals available"

        # FIX: format_messages ki jagah direct string banao
        # LangChain ke newer versions mein placeholder filling
        # differently kaam karti hai
        system_content = BRAND_VOICE

        # Prompt template se human message extract karo
        # aur manually placeholders replace karo
        human_template = prompt_template.messages[1].content
        human_content = human_template.replace("{company_name}", company_name)
        human_content = human_content.replace("{industry}", industry)
        human_content = human_content.replace("{signals}", signals_text)

        # Direct Gemini call — LangChain chain bypass karo
        # Yeh zyada reliable hai newer SDK versions ke saath
        import google.generativeai as genai

        full_prompt = f"""
{system_content}

{human_content}
"""
        model_direct = genai.GenerativeModel("gemini-2.5-flash")
        response = await asyncio.to_thread(
            model_direct.generate_content,
            full_prompt
        )

        return response.text.strip()

    except Exception as e:
        print(f"Draft generation error: {e}")
        return f"Draft generation failed. Error: {str(e)}"


# ── ROUTE ────────────────────────────────────────────────────────────

@router.post("/outreach/generate")
async def generate_outreach(body: dict, db: Session = Depends(get_db)):
    try:
        lead_id = body.get("lead_id")
        if not lead_id:
            return {"data": None, "error": "lead_id is required"}

        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            return {"data": None, "error": f"Lead with id '{lead_id}' not found"}

        print(f"Generating outreach for: {lead.name} ({lead.industry})")

        cto_draft, cfo_draft, user_draft = await asyncio.gather(
            generate_single_draft(CTO_PROMPT, lead.name, lead.industry, lead.signals or []),
            generate_single_draft(CFO_PROMPT, lead.name, lead.industry, lead.signals or []),
            generate_single_draft(USER_PROMPT, lead.name, lead.industry, lead.signals or []),
        )

        return {
            "data": {
                "cto_draft": cto_draft,
                "cfo_draft": cfo_draft,
                "user_draft": user_draft
            },
            "error": None
        }

    except Exception as e:
        print(f"Outreach generation error: {e}")
        return {"data": None, "error": str(e)}