"use client"

import { useState } from "react"
import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { NudgeItem } from "@/types"
import UrgencyBadge from "./UrgencyBadge"
import StageBadge from "./StageBadge"
import { cn } from "@/lib/utils"

interface NudgeRowProps {
  item: NudgeItem
  onSend: (item: NudgeItem) => void
  onDismiss: (partnerId: string) => void
  sending: boolean
  dismissed: boolean
}

export default function NudgeRow({
  item,
  onSend,
  onDismiss,
  sending,
  dismissed,
}: NudgeRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [draft, setDraft] = useState(item.draft_email)

  if (dismissed) return null

  return (
    <>
      {/* Summary row */}
      <TableRow
        className={cn(
          "cursor-pointer transition-colors",
          expanded ? "bg-muted/60 hover:bg-muted/60" : "hover:bg-muted/40"
        )}
        onClick={() => setExpanded((e) => !e)}
      >
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-xs transition-transform duration-200 text-muted-foreground",
                expanded ? "rotate-90" : ""
              )}
            >
              ▶
            </span>
            {item.name}
          </div>
        </TableCell>
        <TableCell>
          <StageBadge stage={item.stage} />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {item.days_inactive}d
            </span>
            <UrgencyBadge daysInactive={item.days_inactive} />
          </div>
        </TableCell>
        <TableCell className="text-right">
          <span className="text-xs text-muted-foreground">
            {expanded ? "Collapse" : "View draft"}
          </span>
        </TableCell>
      </TableRow>

      {/* Expanded draft row */}
      {expanded && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={4} className="pt-0 pb-4 px-6 bg-muted/30 border-b border-border">
            <div className="flex flex-col gap-3 pt-3">

              {/* Draft meta */}
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  AI-generated nudge draft
                </p>
                <p className="text-xs text-muted-foreground">
                  {draft.length} characters · edit before sending
                </p>
              </div>

              {/* Editable draft */}
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={12}
                className="w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm leading-relaxed font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                spellCheck
              />

              {/* Actions */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDismiss(item.partner_id)
                  }}
                >
                  Dismiss
                </Button>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    Sends via SendGrid in production
                  </p>
                  <Button
                    size="sm"
                    disabled={sending}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSend({ ...item, draft_email: draft })
                    }}
                  >
                    {sending ? "Sending…" : "Send nudge"}
                  </Button>
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}