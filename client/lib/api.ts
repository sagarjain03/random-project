const BASE = process.env.NEXT_PUBLIC_API_URL

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { data: null, error: err?.error ?? `HTTP ${res.status}` }
    }
    const json = await res.json()
    return { data: json.data, error: null }
  } catch (e) {
    return { data: null, error: "Could not reach the server" }
  }
}

// ── M0 ──────────────────────────────────────────────
export const ping = () => request<{ status: string }>("/api/ping")

// ── M1 (add these when you start M1) ────────────────
// export const getLeads = () => request<Lead[]>("/api/leads")
// export const scoreLeads = () => request<null>("/api/leads/score", { method: "POST" })

// ── M2 ──────────────────────────────────────────────
// export const generateOutreach = (leadId: string) =>
//   request<OutreachDrafts>("/api/outreach/generate", {
//     method: "POST",
//     body: JSON.stringify({ lead_id: leadId }),
//   })

// ── M3 ──────────────────────────────────────────────
// export const checkCompliance = (draft: string) =>
//   request<ComplianceResult>("/api/compliance/check", {
//     method: "POST",
//     body: JSON.stringify({ draft }),
//   })

// ── M4 ──────────────────────────────────────────────
// export const getNudgeQueue = () => request<NudgeItem[]>("/api/nudge/queue")
// export const sendNudge = (partnerId: string) =>
//   request<null>("/api/nudge/send", {
//     method: "POST",
//     body: JSON.stringify({ partner_id: partnerId }),
//   })