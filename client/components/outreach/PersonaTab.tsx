"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ComplianceFlag, ComplianceResult } from "@/types"
import CompliancePanel from "@/components/compliance/CompliancePanel"

interface PersonaTabProps {
  draftKey: string
  draft: string
  personaLabel: string
  personaDescription: string
  isRegenerating: boolean
  onRegenerate: () => void
  complianceResult: ComplianceResult | null
  complianceChecking: boolean
  onRerunCompliance: () => void
}

export default function PersonaTab({
  draft,
  personaLabel,
  personaDescription,
  isRegenerating,
  onRegenerate,
  complianceResult,
  complianceChecking,
  onRerunCompliance,
}: PersonaTabProps) {
  const [text, setText] = useState(draft)
  const [copied, setCopied] = useState(false)
  const [acceptedFlags, setAcceptedFlags] = useState<Set<number>>(new Set())
  const [rejectedFlags, setRejectedFlags] = useState<Set<number>>(new Set())
  

  function handleCopy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    // toast({ description: `${personaLabel} draft copied to clipboard.` })
    setTimeout(() => setCopied(false), 2000)
  }

  function handleAccept(flag: ComplianceFlag, index: number) {
    // Replace the flagged sentence with the rewrite in the textarea
    setText((prev) => prev.replace(flag.sentence, flag.rewrite))
    setAcceptedFlags((prev) => new Set(prev).add(index))
    setRejectedFlags((prev) => {
      const next = new Set(prev)
      next.delete(index)
      return next
    })
    toast("Fix applied to draft.")
  }

  function handleReject(flag: ComplianceFlag, index: number) {
    // Undo an accepted fix
    if (acceptedFlags.has(index)) {
      setText((prev) => prev.replace(flag.rewrite, flag.sentence))
      setAcceptedFlags((prev) => {
        const next = new Set(prev)
        next.delete(index)
        return next
      })
    }
    setRejectedFlags((prev) => new Set(prev).add(index))
  }

  const skeletonWidths = ["72%", "84%", "68%", "90%", "77%", "66%", "88%", "74%"]

  return (
    <div className="flex flex-col gap-4">
      {/* Persona info + actions */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">{personaLabel}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{personaDescription}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={isRegenerating}
          >
            {isRegenerating ? "Regenerating…" : "Regenerate"}
          </Button>
          <Button size="sm" onClick={handleCopy} disabled={isRegenerating}>
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>

      {/* Two-column layout: textarea left, compliance right */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
        {/* Left — draft editor */}
        <div className="flex flex-col gap-2">
          {isRegenerating ? (
            <div className="flex flex-col gap-2 animate-pulse">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-muted rounded"
                  style={{ width: skeletonWidths[i % skeletonWidths.length] }}
                />
              ))}
            </div>
          ) : (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={16}
              className="w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm leading-relaxed text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono"
              spellCheck
            />
          )}
          {!isRegenerating && (
            <p className="text-xs text-muted-foreground text-right">
              {text.length} characters
            </p>
          )}
        </div>

        {/* Right — compliance panel */}
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <CompliancePanel
            result={complianceResult}
            checking={complianceChecking}
            acceptedFlags={acceptedFlags}
            rejectedFlags={rejectedFlags}
            onAccept={handleAccept}
            onReject={handleReject}
            onRerun={onRerunCompliance}
          />
        </div>
      </div>
    </div>
  )
}