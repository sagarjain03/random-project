import {
  MOCK_LEADS,
  MOCK_NUDGE_QUEUE,
  MOCK_COMPLIANCE,
} from "./mock-data"

export function getStats() {
  const totalLeads = MOCK_LEADS.length
  const highIntent = MOCK_LEADS.filter((l) => l.score >= 80).length
  const avgScore = Math.round(
    MOCK_LEADS.reduce((sum, l) => sum + l.score, 0) / MOCK_LEADS.length
  )

  const nudgeQueue = MOCK_NUDGE_QUEUE.length
  const criticalPartners = MOCK_NUDGE_QUEUE.filter(
    (p) => p.days_inactive >= 30
  ).length

  const totalFlags = Object.values(MOCK_COMPLIANCE).reduce(
    (sum, r) => sum + (r?.flags.length ?? 0),
    0
  )

  return {
    totalLeads,
    highIntent,
    avgScore,
    nudgeQueue,
    criticalPartners,
    totalFlags,
  }
}