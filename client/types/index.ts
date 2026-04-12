// Base wrapper — every API response from FastAPI follows this shape
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

// M1 — Lead scoring
export interface BuyingSignal {
  label: string
  detail: string
}

export interface Lead {
  id: string
  name: string
  industry: string
  score: number          // 0–100
  signals: BuyingSignal[]
}

// M2 — Outreach drafts
export interface OutreachDrafts {
  cto_draft: string
  cfo_draft: string
  user_draft: string
}

// M3 — Compliance
export interface ComplianceFlag {
  sentence: string       // the original risky sentence
  rule: string           // which rule it violates
  rewrite: string        // safe replacement
}

export interface ComplianceResult {
  status: "clear" | "flagged"
  flags: ComplianceFlag[]
}

// M4 — Nudge queue
export interface NudgeItem {
  partner_id: string
  name: string
  days_inactive: number
  stage: string
  draft_email: string
}