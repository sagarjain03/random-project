"use client"

import { ComplianceFlag, ComplianceResult } from "@/types"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import ComplianceBadge from "./ComplianceBadge"
import FlagCard from "./FlagCard"

interface CompliancePanelProps {
  result: ComplianceResult | null
  checking: boolean
  acceptedFlags: Set<number>
  rejectedFlags: Set<number>
  onAccept: (flag: ComplianceFlag, index: number) => void
  onReject: (flag: ComplianceFlag, index: number) => void
  onRerun: () => void
}

export default function CompliancePanel({
  result,
  checking,
  acceptedFlags,
  rejectedFlags,
  onAccept,
  onReject,
  onRerun,
}: CompliancePanelProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Compliance check
          </p>
          <ComplianceBadge result={result} checking={checking} />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-7 px-2"
          onClick={onRerun}
          disabled={checking}
        >
          {checking ? "Running…" : "Re-run"}
        </Button>
      </div>

      <Separator />

      {/* Checking skeleton */}
      {checking && (
        <div className="flex flex-col gap-2 animate-pulse">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border h-24 bg-muted/40" />
          ))}
        </div>
      )}

      {/* Clear state */}
      {!checking && result?.status === "clear" && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-6 text-center">
          <p className="text-sm font-medium text-emerald-800">No issues found</p>
          <p className="text-xs text-emerald-600 mt-1">
            This draft is compliant with all brand and legal guidelines
          </p>
        </div>
      )}

      {/* Flagged state */}
      {!checking && result?.status === "flagged" && (
        <div className="flex flex-col gap-3">
          {result.flags.map((flag, i) => (
            <FlagCard
              key={i}
              flag={flag}
              index={i}
              accepted={acceptedFlags.has(i)}
              rejected={rejectedFlags.has(i)}
              onAccept={(f) => onAccept(f, i)}
              onReject={(f) => onReject(f, i)}
            />
          ))}

          {/* Summary footer */}
          {result.flags.length > 0 && (
            <p className="text-xs text-muted-foreground text-center pt-1">
              {acceptedFlags.size} of {result.flags.length} fixes applied
            </p>
          )}
        </div>
      )}

      {/* No result yet */}
      {!checking && !result && (
        <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center">
          <p className="text-xs text-muted-foreground">
            Compliance check will run automatically
          </p>
        </div>
      )}
    </div>
  )
}