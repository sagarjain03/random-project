"use client"

import { useEffect, useMemo, useState } from "react"
import { MOCK_LEADS, MOCK_NUDGE_QUEUE } from "@/lib/mock-data"
import StatCard from "@/components/dashboard/StatCard"
import PageShell from "@/components/layout/PageShell"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Lead, NudgeItem } from "@/types"
import { getLeads, getNudgeQueue } from "@/lib/api"
import { toast } from "sonner"

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS)
  const [queue, setQueue] = useState<NudgeItem[]>(MOCK_NUDGE_QUEUE)

  useEffect(() => {
    async function loadDashboardData() {
      const [leadsResult, queueResult] = await Promise.all([getLeads(), getNudgeQueue()])

      if (!leadsResult.error && leadsResult.data) {
        setLeads(leadsResult.data)
      } else if (leadsResult.error) {
        toast.error(`Leads API error: ${leadsResult.error}`)
      }

      if (!queueResult.error && queueResult.data) {
        setQueue(queueResult.data)
      } else if (queueResult.error) {
        toast.error(`Nudge API error: ${queueResult.error}`)
      }
    }

    void loadDashboardData()
  }, [])

  const stats = useMemo(() => {
    const totalLeads = leads.length
    const highIntent = leads.filter((l) => l.score >= 80).length
    const avgScore = totalLeads > 0
      ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / totalLeads)
      : 0

    const nudgeQueue = queue.length
    const criticalPartners = queue.filter((p) => p.days_inactive >= 30).length

    return {
      totalLeads,
      highIntent,
      avgScore,
      nudgeQueue,
      criticalPartners,
      totalFlags: 0,
    }
  }, [leads, queue])

  const topLeads = [...leads]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  const urgentPartners = queue
    .filter((p) => p.days_inactive >= 14)
    .sort((a, b) => b.days_inactive - a.days_inactive)
    .slice(0, 3)

  return (
    <PageShell
      title="Blostem"
      subtitle="AI-powered B2B marketing engine — overview"
    >
      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total leads"
          value={stats.totalLeads}
          sub={`${stats.highIntent} high intent`}
          href="/leads"
          accent="default"
        />
        <StatCard
          label="Avg lead score"
          value={stats.avgScore}
          sub="Out of 100"
          href="/leads"
          accent={stats.avgScore >= 70 ? "green" : "amber"}
        />
        <StatCard
          label="Nudge queue"
          value={stats.nudgeQueue}
          sub={
            stats.criticalPartners > 0
              ? `${stats.criticalPartners} critical`
              : "No critical partners"
          }
          href="/nudge"
          accent={stats.criticalPartners > 0 ? "red" : "default"}
        />
        <StatCard
          label="Compliance flags"
          value={stats.totalFlags}
          sub="Run checks in Outreach"
          href="/outreach"
          accent={stats.totalFlags > 0 ? "amber" : "green"}
        />
        <StatCard
          label="High-intent leads"
          value={stats.highIntent}
          sub="Score ≥ 80"
          href="/leads"
          accent="green"
        />
        <StatCard
          label="Personas supported"
          value={3}
          sub="CTO · CFO · End user"
          href="/outreach"
        />
      </div>

      {/* Two-column quick view */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top leads */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Top leads by score
            </p>
            <Link
              href="/leads"
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {topLeads.map((lead) => (
              <Link
                key={lead.id}
                href={`/outreach?lead=${lead.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.industry}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${lead.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-emerald-700 w-6 text-right">
                    {lead.score}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Urgent partners */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Partners needing attention
            </p>
            <Link
              href="/nudge"
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              View queue
            </Link>
          </div>
          <div className="divide-y divide-border">
            {urgentPartners.length === 0 && (
              <div className="px-4 py-6 text-center">
                <p className="text-xs text-muted-foreground">
                  All partners are active
                </p>
              </div>
            )}
            {urgentPartners.map((partner) => (
              <Link
                key={partner.partner_id}
                href="/nudge"
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{partner.name}</p>
                  <p className="text-xs text-muted-foreground">{partner.stage}</p>
                </div>
                <Badge
                  className={
                    partner.days_inactive >= 30
                      ? "bg-red-100 text-red-800 border-red-200 hover:bg-red-100"
                      : "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100"
                  }
                >
                  {partner.days_inactive}d inactive
                </Badge>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* End-to-end flow hint */}
      <div className="mt-6 rounded-lg border border-dashed border-border px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Ready to run the full flow?</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Score a lead → generate outreach → check compliance → send nudge
          </p>
        </div>
        <Link href="/leads">
          <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs px-3 py-1.5">
            Start with leads
          </Badge>
        </Link>
      </div>
    </PageShell>
  )
}