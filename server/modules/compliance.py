from fastapi import APIRouter
from pydantic import BaseModel
import google.genai as genai
from dotenv import load_dotenv
import os
import json
import asyncio

load_dotenv()

router = APIRouter()

# ── Gemini client (new SDK) ──────────────────────────────────────────
_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# ── Paths from .env ──────────────────────────────────────────────────
CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_db")
COMPLIANCE_PDF_PATH = os.getenv("COMPLIANCE_PDF_PATH", "./docs/compliance_handbook.pdf")

_chroma_collection = None


def _get_chroma_collection():
    """Lazily initialise and return the ChromaDB collection."""
    global _chroma_collection
    if _chroma_collection is not None:
        return _chroma_collection

    import chromadb
    client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
    _chroma_collection = client.get_or_create_collection(
        name="compliance_rules",
        metadata={"hnsw:space": "cosine"}
    )
    return _chroma_collection


def ingest_compliance_pdf():
    """
    Read the compliance PDF, chunk it, embed with Gemini embeddings,
    and store in ChromaDB. Idempotent — safe to call multiple times.
    """
    try:
        if not os.path.exists(COMPLIANCE_PDF_PATH):
            print(f"Warning: Compliance PDF not found at {COMPLIANCE_PDF_PATH} -- skipping ingest")
            return

        collection = _get_chroma_collection()

        # If the collection already has documents, skip re-ingestion
        existing = collection.count()
        if existing > 0:
            print(f"Compliance collection already has {existing} chunks -- skipping ingest")
            return

        # Use LlamaIndex to load and chunk the PDF
        from llama_index.core import SimpleDirectoryReader
        from llama_index.core.node_parser import SentenceSplitter

        # Load PDF via LlamaIndex SimpleDirectoryReader
        reader = SimpleDirectoryReader(input_files=[COMPLIANCE_PDF_PATH])
        documents = reader.load_data()

        # Chunk into ~500 token pieces
        splitter = SentenceSplitter(chunk_size=500, chunk_overlap=50)
        nodes = splitter.get_nodes_from_documents(documents)

        print(f"Ingesting {len(nodes)} compliance chunks into ChromaDB...")

        # Embed each chunk with Gemini embedding model and store in ChromaDB
        for i, node in enumerate(nodes):
            text = node.get_content()
            # Use new google.genai SDK for embedding
            embedding_response = _client.models.embed_content(
                model="models/gemini-embedding-001",
                contents=text
            )
            # The new SDK returns embeddings differently
            embedding = embedding_response.embeddings[0].values

            collection.add(
                ids=[f"chunk_{i}"],
                embeddings=[embedding],
                documents=[text],
                metadatas=[{"source": "compliance_handbook.pdf", "chunk_index": i}]
            )

        print(f"Ingested {len(nodes)} compliance chunks into ChromaDB")

    except Exception as e:
        print(f"Warning: Compliance PDF ingest failed: {e}")


def _query_compliance_rules(draft: str, top_k: int = 3) -> list:
    """Embed the draft text and retrieve the top_k most relevant compliance chunks."""
    try:
        collection = _get_chroma_collection()

        if collection.count() == 0:
            raise ValueError("ChromaDB collection is empty")

        # Embed the query using new SDK
        embedding_response = _client.models.embed_content(
            model="models/gemini-embedding-001",
            contents=draft
        )
        query_embedding = embedding_response.embeddings[0].values

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=min(top_k, collection.count())
        )

        docs = results.get("documents", [[]])[0]
        return docs

    except Exception as e:
        print(f"ChromaDB query error: {e}")
        # Fallback: return hardcoded compliance rules if ChromaDB fails
        return [
            "Rule 1: Specific ROI statistics (percentages, dollar amounts, timeframes) require attribution "
            "to named customers or must be qualified with 'typically' or 'on average'. Unverified figures "
            "violate GDPR Article 6 marketing guidelines.",
            "Rule 3: Capability claims ('fully integrated', 'works with everything', 'zero downtime') "
            "require documented evidence or must use qualified language like 'designed to' or 'built for'.",
            "Rule 5: Customer success metrics must be anonymised or have explicit customer consent for attribution."
        ]


# ── Ingest on module load ────────────────────────────────────────────
try:
    ingest_compliance_pdf()
except Exception as _e:
    print(f"Warning: Module-level compliance ingest skipped: {_e}")


# ── ROUTE ────────────────────────────────────────────────────────────

class ComplianceRequest(BaseModel):
    draft: str


@router.post("/compliance/check")
async def check_compliance(request: ComplianceRequest):
    try:
        draft = request.draft.strip()
        if not draft:
            return {"data": None, "error": "draft is required"}

        # Retrieve top 3 relevant compliance rules from ChromaDB
        relevant_rules = await asyncio.to_thread(_query_compliance_rules, draft)
        rules_text = "\n\n".join(relevant_rules) if relevant_rules else "No specific rules retrieved."

        prompt = f"""You are a compliance officer reviewing marketing email drafts.

Here are the compliance rules to check against:
{rules_text}

Review the following email draft against the compliance rules provided.
Return ONLY valid JSON — no markdown, no extra text, no code fences:
{{
  "status": "clear" or "flagged",
  "flags": [
    {{
      "sentence": "exact sentence from draft that violates a rule",
      "rule": "which rule it violates and why",
      "rewrite": "a compliant replacement sentence"
    }}
  ]
}}
If no violations found, return {{ "status": "clear", "flags": [] }}

Email draft to review:
{draft}"""

        # Call Gemini via asyncio.to_thread
        raw_response = await asyncio.to_thread(
            _client.models.generate_content,
            model="gemini-2.5-flash",
            contents=prompt
        )

        raw = raw_response.text.strip()

        # Strip markdown fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        # Parse JSON
        try:
            result = json.loads(raw)
        except json.JSONDecodeError:
            return {"data": None, "error": "AI parsing failed"}

        status = result.get("status", "clear")
        flags = result.get("flags", [])

        clean_flags = []
        for flag in flags:
            clean_flags.append({
                "sentence": flag.get("sentence", ""),
                "rule": flag.get("rule", ""),
                "rewrite": flag.get("rewrite", "")
            })

        return {
            "data": {
                "status": status,
                "flags": clean_flags
            },
            "error": None
        }

    except Exception as e:
        print(f"Compliance check error: {e}")
        return {"data": None, "error": str(e)}