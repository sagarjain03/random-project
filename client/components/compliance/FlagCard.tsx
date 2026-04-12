"use client"

import { useState } from "react"
import { ComplianceFlag } from "@/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FlagCardProps {
  flag: ComplianceFlag
  index: number
  onAccept: (flag: ComplianceFlag) => void
  onReject: (flag: ComplianceFlag) => void
  accepted: boolean
  rejected: boolean
}

export default function FlagCard({
  flag,
  index,
  onAccept,
  onReject,
  accepted,
  rejected,
}: FlagCardProps) {
  const [expanded, setExpanded] = useState(true)

  if (accepted) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center justify-between">
        <p className="text-xs text-emerald-700 font-medium">
          Fix {index + 1} applied
        </p>
        <button
          className="text-xs text-emerald-600 underline underline-offset-2"
          onClick={() => onReject(flag)}
        >
          Undo
        </button>
      </div>
    )
  }

  if (rejected) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 flex items-center justify-between opacity-50">
        <p className="text-xs text-muted-foreground">Issue {index + 1} dismissed</p>
        <button
          className="text-xs text-muted-foreground underline underline-offset-2"
          onClick={() => setExpanded(true)}
        >
          Restore
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-start justify-between px-4 py-3 text-left"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-400 text-white text-[10px] font-bold">
            {index + 1}
          </span>
          <p className="text-xs font-medium text-amber-900 leading-relaxed line-clamp-2">
            "{flag.sentence}"
          </p>
        </div>
        <span className="ml-2 text-amber-500 text-xs mt-0.5 shrink-0">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3">
          {/* Rule */}
          <div className="rounded-md bg-amber-100 border border-amber-200 px-3 py-2">
            <p className="text-[11px] font-medium text-amber-800 mb-0.5 uppercase tracking-wide">
              Rule violated
            </p>
            <p className="text-xs text-amber-900 leading-relaxed">{flag.rule}</p>
          </div>

          {/* Rewrite diff */}
          <div className="rounded-md border border-border bg-background px-3 py-2 flex flex-col gap-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              Suggested rewrite
            </p>
            {/* Old */}
            <div className="rounded bg-red-50 border border-red-100 px-2.5 py-2">
              <p className="text-[10px] font-medium text-red-500 mb-1 uppercase tracking-wide">Before</p>
              <p className="text-xs text-red-800 leading-relaxed">{flag.sentence}</p>
            </div>
            {/* New */}
            <div className="rounded bg-emerald-50 border border-emerald-100 px-2.5 py-2">
              <p className="text-[10px] font-medium text-emerald-600 mb-1 uppercase tracking-wide">After</p>
              <p className="text-xs text-emerald-800 leading-relaxed">{flag.rewrite}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
              onClick={() => onAccept(flag)}
            >
              Accept fix
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs h-8"
              onClick={() => onReject(flag)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}