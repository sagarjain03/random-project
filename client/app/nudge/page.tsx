"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
// import { useToast } from "@/components/ui/use-toast"
import { NudgeItem } from "@/types"
import { MOCK_NUDGE_QUEUE } from "@/lib/mock-data"
import NudgeRow from "@/components/nudge/NudgeRow"
import { toast } from "sonner"
import { getNudgeQueue, sendNudge } from "@/lib/api"

type FilterStage = "All" | "Onboarding" | "Integration" | "Active" | "Stalled"
type SortKey = "days_inactive" | "name" | "stage"
type SortDir = "asc" | "desc"

const STAGE_FILTERS: FilterStage[] = ["All", "Stalled", "Onboarding", "Integration", "Active"]

export default function NudgePage() {
  // const { toast } = useToast()

  const [queue, setQueue] = useState<NudgeItem[]>(MOCK_NUDGE_QUEUE)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [sending, setSending] = useState<Set<string>>(new Set())
  const [sent, setSent] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<FilterStage>("All")
  const [sortKey, setSortKey] = useState<SortKey>("days_inactive")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  useEffect(() => {
    async function loadQueue() {
      const { data, error } = await getNudgeQueue()
      if (error || !data) {
        if (error) {
          toast.error(`Could not load nudge queue: ${error}`)
        }
        return
      }
      setQueue(data)
    }

    void loadQueue()
  }, [])

  const visible = useMemo(() => {
    const filtered = queue.filter((item) => {
      if (dismissed.has(item.partner_id)) return false
      if (sent.has(item.partner_id)) return false
      if (filter !== "All" && item.stage !== filter) return false
      return true
    })
    return [...filtered].sort((a, b) => {
      if (sortKey === "days_inactive") {
        return sortDir === "desc"
          ? b.days_inactive - a.days_inactive
          : a.days_inactive - b.days_inactive
      }
      const av = a[sortKey]
      const bv = b[sortKey]
      return sortDir === "desc"
        ? String(bv).localeCompare(String(av))
        : String(av).localeCompare(String(bv))
    })
  }, [queue, dismissed, sent, filter, sortKey, sortDir])

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "desc" ? "asc" : "desc"))
    else { setSortKey(key); setSortDir("desc") }
  }

  async function handleSend(item: NudgeItem) {
    setSending((prev) => new Set(prev).add(item.partner_id))

    const { data, error } = await sendNudge(item.partner_id)

    setSending((prev) => {
      const next = new Set(prev)
      next.delete(item.partner_id)
      return next
    })

    if (error || !data) {
      toast.error(error ?? `Could not send nudge to ${item.name}`)
      return
    }

    setSent((prev) => new Set(prev).add(item.partner_id))
    toast.success(data.message)
  }

  function handleDismiss(partnerId: string) {
    setDismissed((prev) => new Set(prev).add(partnerId))
    toast("Partner removed from nudge queue.")
  }

  function renderSortIcon(col: SortKey) {
    if (sortKey !== col)
      return <span className="text-muted-foreground/40 ml-1">↕</span>
    return (
      <span className="text-foreground ml-1">
        {sortDir === "desc" ? "↓" : "↑"}
      </span>
    )
  }

  const criticalCount = visible.filter((i) => i.days_inactive >= 30).length

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Nudge queue</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Partners who haven&apos;t activated since signing
          </p>
        </div>
        <div className="flex items-center gap-3">
          {criticalCount > 0 && (
            <Badge className="bg-red-100 text-red-800 border border-red-200 hover:bg-red-100">
              {criticalCount} critical
            </Badge>
          )}
          <Badge variant="secondary">
            {visible.length} in queue
          </Badge>
        </div>
      </div>

      {/* Stage filter pills */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {STAGE_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              filter === s
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Empty state — all clear */}
      {visible.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-16 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            {filter !== "All"
              ? `No ${filter} partners in the queue`
              : "All partners are active"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            The daily cron job will surface new stalled partners automatically
          </p>
        </div>
      )}

      {/* Queue table */}
      {visible.length > 0 && (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("name")}
                >
                  Partner {renderSortIcon("name")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none w-35"
                  onClick={() => handleSort("stage")}
                >
                  Stage {renderSortIcon("stage")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none w-45"
                  onClick={() => handleSort("days_inactive")}
                >
                  Inactive {renderSortIcon("days_inactive")}
                </TableHead>
                <TableHead className="w-25 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((item) => (
                <NudgeRow
                  key={item.partner_id}
                  item={item}
                  onSend={handleSend}
                  onDismiss={handleDismiss}
                  sending={sending.has(item.partner_id)}
                  dismissed={dismissed.has(item.partner_id)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Sent log */}
      {sent.size > 0 && (
        <div className="mt-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Sent this session
          </p>
          <div className="flex flex-col gap-1.5">
            {queue
              .filter((i) => sent.has(i.partner_id))
              .map((i) => (
                <div
                  key={i.partner_id}
                  className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5"
                >
                  <span className="text-sm font-medium text-emerald-800">
                    {i.name}
                  </span>
                  <span className="text-xs text-emerald-600">Nudge sent</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}