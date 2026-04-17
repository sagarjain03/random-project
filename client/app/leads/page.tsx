"use client"

import { useState, useMemo, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Lead } from "@/types"
import { MOCK_LEADS } from "@/lib/mock-data"
import { getLeads, ping, scoreLeads } from "@/lib/api"
import ScoreBar from "@/components/leads/ScoreBar"
import SignalBadge from "@/components/leads/SignalBadge"
import LeadDrawer from "@/components/leads/LeadDrawer"
import { toast } from "sonner"

type SortKey = "score" | "name" | "industry"
type SortDir = "asc" | "desc"
type ConnectionStatus = "checking" | "connected" | "offline"

function getIndustryColor(industry: string) {
  const map: Record<string, string> = {
    FinTech:       "bg-violet-100 text-violet-800 border-violet-200",
    HealthTech:    "bg-teal-100 text-teal-800 border-teal-200",
    "Supply Chain":"bg-amber-100 text-amber-800 border-amber-200",
    CleanTech:     "bg-green-100 text-green-800 border-green-200",
    Retail:        "bg-pink-100 text-pink-800 border-pink-200",
    Industrial:    "bg-slate-100 text-slate-700 border-slate-200",
    "Media & Ad Tech": "bg-orange-100 text-orange-800 border-orange-200",
  }
  return map[industry] ?? "bg-muted text-muted-foreground border-border"
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS)
  const [loading, setLoading] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>("score")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [search, setSearch] = useState("")
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("checking")

  async function loadLeads() {
    const { data, error } = await getLeads()
    if (error || !data) {
      setConnectionStatus("offline")
      setLeads(MOCK_LEADS)
      if (error) {
        toast.error(`Could not load leads: ${error}`)
      }
      return
    }

    setLeads(data)
    setConnectionStatus("connected")
  }

  // On mount, verify API and load lead data.
  useEffect(() => {
    let mounted = true

    async function bootstrap() {
      const { data, error } = await ping()
      if (!mounted) return

      if (error || !data) {
        setConnectionStatus("offline")
        setLeads(MOCK_LEADS)
        return
      }

      setConnectionStatus("connected")
      await loadLeads()
    }

    void bootstrap()
    return () => {
      mounted = false
    }
  }, [])

  const sorted = useMemo(() => {
    const filtered = leads.filter(
      (l) =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.industry.toLowerCase().includes(search.toLowerCase())
    )
    return [...filtered].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === "number" && typeof bv === "number")
        return sortDir === "desc" ? bv - av : av - bv
      return sortDir === "desc"
        ? String(bv).localeCompare(String(av))
        : String(av).localeCompare(String(bv))
    })
  }, [leads, sortKey, sortDir, search])

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "desc" ? "asc" : "desc"))
    else { setSortKey(key); setSortDir("desc") }
  }

  function handleRowClick(lead: Lead) {
    setSelectedLead(lead)
    setDrawerOpen(true)
  }

  async function handleRescore() {
    setLoading(true)
    const { data, error } = await scoreLeads()
    if (error || !data) {
      toast.error(error ?? "Failed to score leads")
      setLoading(false)
      return
    }

    toast.success(`Scored ${data.leads_scored} leads`)
    await loadLeads()
    setLoading(false)
  }

  function renderSortIcon(col: SortKey) {
    if (sortKey !== col) return <span className="text-muted-foreground/40 ml-1">↕</span>
    return <span className="text-foreground ml-1">{sortDir === "desc" ? "↓" : "↑"}</span>
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Pipeline intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {sorted.length} leads · sorted by {sortKey}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* M0 connection status badge */}
          {connectionStatus === "checking" && (
            <Badge variant="outline" className="text-xs gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse inline-block" />
              Checking API…
            </Badge>
          )}
          {connectionStatus === "connected" && (
            <Badge variant="outline" className="text-xs gap-1.5 border-emerald-300 text-emerald-700 bg-emerald-50">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
              API connected
            </Badge>
          )}
          {connectionStatus === "offline" && (
            <Badge variant="outline" className="text-xs gap-1.5 border-red-300 text-red-700 bg-red-50">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block" />
              API offline · using mock data
            </Badge>
          )}
          <Button onClick={handleRescore} disabled={loading} size="sm">
            {loading ? "Scoring…" : "Re-score all"}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by company or industry…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead
                className="cursor-pointer select-none w-50"
                onClick={() => handleSort("name")}
              >
                Company {renderSortIcon("name")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none w-35"
                onClick={() => handleSort("industry")}
              >
                Industry {renderSortIcon("industry")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none w-45"
                onClick={() => handleSort("score")}
              >
                Score {renderSortIcon("score")}
              </TableHead>
              <TableHead>Buying signals</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-6" />
                        <Skeleton className="h-1.5 flex-1 rounded-full" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1.5">
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              : sorted.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(lead)}
                  >
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getIndustryColor(lead.industry)}`}>
                        {lead.industry}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ScoreBar score={lead.score} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {lead.signals.slice(0, 2).map((s, i) => (
                          <SignalBadge key={i} signal={s} />
                        ))}
                        {lead.signals.length > 2 && (
                          <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                            +{lead.signals.length - 2} more
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

            {!loading && sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground text-sm">
                  No leads match your search
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Drawer */}
      <LeadDrawer
        lead={selectedLead}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  )
}