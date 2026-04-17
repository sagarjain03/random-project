"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MOCK_LEADS } from "@/lib/mock-data"
import { OutreachDrafts, Lead, ComplianceResult } from "@/types"
import PersonaTab from "@/components/outreach/PersonaTab"
import { checkCompliance, generateOutreach, getLeads } from "@/lib/api"
import { toast } from "sonner"

const PERSONAS = [
  {
    key: "cto_draft" as keyof OutreachDrafts,
    draftKey: "cto_draft",
    tab: "CTO",
    label: "Chief Technology Officer",
    description: "Focus: security, API integration, and technical stability",
  },
  {
    key: "cfo_draft" as keyof OutreachDrafts,
    draftKey: "cfo_draft",
    tab: "CFO",
    label: "Chief Financial Officer",
    description: "Focus: ROI, cost reduction, and predictable pricing",
  },
  {
    key: "user_draft" as keyof OutreachDrafts,
    draftKey: "user_draft",
    tab: "End user",
    label: "End user / Team lead",
    description: "Focus: UX, daily productivity, and ease of adoption",
  },
]

type ComplianceState = Record<string, ComplianceResult | null>
type CheckingState = Record<string, boolean>
const GENERATING_SKELETON_WIDTHS = ["71%", "86%", "69%", "93%", "80%", "74%", "88%", "67%"]

export default function OutreachPage() {
  const params = useSearchParams()
  const initialLeadId = params.get("lead") ?? ""

  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLeadId, setSelectedLeadId] = useState<string>(initialLeadId)
  const [drafts, setDrafts] = useState<OutreachDrafts | null>(null)
  const [generating, setGenerating] = useState(false)
  const [regeneratingKey, setRegeneratingKey] = useState<keyof OutreachDrafts | null>(null)
  const [activeTab, setActiveTab] = useState("CTO")
  const [compliance, setCompliance] = useState<ComplianceState>({})
  const [checking, setChecking] = useState<CheckingState>({})

  const selectedLead: Lead | undefined = leads.find((l) => l.id === selectedLeadId)

  useEffect(() => {
    async function loadLeadOptions() {
      const { data, error } = await getLeads()
      if (error || !data) {
        setLeads(MOCK_LEADS)
        if (error) {
          toast.error(`Could not load leads from API: ${error}`)
        }
        return
      }
      setLeads(data)
    }

    void loadLeadOptions()
  }, [])

  // Run compliance check for a single draft key
  async function runComplianceFor(draftKey: string, draftText: string) {
    setChecking((prev) => ({ ...prev, [draftKey]: true }))
    setCompliance((prev) => ({ ...prev, [draftKey]: null }))

    const { data, error } = await checkCompliance(draftText)
    if (error || !data) {
      setChecking((prev) => ({ ...prev, [draftKey]: false }))
      toast.error(error ?? "Compliance check failed")
      return
    }

    setCompliance((prev) => ({
      ...prev,
      [draftKey]: data,
    }))
    setChecking((prev) => ({ ...prev, [draftKey]: false }))
  }

  // Run compliance for all drafts in parallel.
  async function runAllCompliance(nextDrafts: OutreachDrafts) {
    await Promise.all(
      PERSONAS.map((p) => runComplianceFor(p.draftKey, nextDrafts[p.key]))
    )
  }

  async function handleGenerate() {
    if (!selectedLeadId) return

    setGenerating(true)
    setDrafts(null)
    setCompliance({})
    setChecking({})

    const { data, error } = await generateOutreach(selectedLeadId)
    if (error || !data) {
      setGenerating(false)
      toast.error(error ?? "Failed to generate outreach")
      return
    }

    setDrafts(data)
    setGenerating(false)
    await runAllCompliance(data)
  }

  async function handleRegenerate(key: keyof OutreachDrafts) {
    if (!selectedLeadId) return

    setRegeneratingKey(key)

    const { data, error } = await generateOutreach(selectedLeadId)
    if (error || !data) {
      setRegeneratingKey(null)
      toast.error(error ?? "Failed to regenerate draft")
      return
    }

    const nextDrafts = drafts ? { ...drafts, [key]: data[key] } : data
    setDrafts(nextDrafts)
    setRegeneratingKey(null)
    await runComplianceFor(String(key), nextDrafts[key])
  }

  // Badge shown on each tab trigger
  function TabComplianceDot({ draftKey }: { draftKey: string }) {
    const isChecking = checking[draftKey]
    const result = compliance[draftKey]
    if (isChecking) {
      return <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
    }
    if (result?.status === "flagged") {
      return <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
    }
    if (result?.status === "clear") {
      return <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
    }
    return null
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Outreach generator</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a lead and generate persona-tailored, compliance-checked email drafts
        </p>
      </div>

      {/* Lead selector */}
      <div className="flex items-end gap-3 mb-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Select lead
          </label>
          <select
            value={selectedLeadId}
            onChange={(e) => {
              setSelectedLeadId(e.target.value)
              setDrafts(null)
              setCompliance({})
              setChecking({})
            }}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-w-55"
          >
            <option value="">Choose a company…</option>
            {leads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.name} — {lead.industry}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={handleGenerate} disabled={!selectedLeadId || generating}>
          {generating ? "Generating…" : "Generate outreach"}
        </Button>
      </div>

      {/* Selected lead chip */}
      {selectedLead && (
        <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-muted/50 border border-border w-fit">
          <span className="text-sm font-medium">{selectedLead.name}</span>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-xs text-muted-foreground">{selectedLead.industry}</span>
          <Separator orientation="vertical" className="h-4" />
          <Badge variant="secondary" className="text-xs">Score {selectedLead.score}</Badge>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-xs text-muted-foreground">
            {selectedLead.signals.length} buying signals
          </span>
        </div>
      )}

      {/* Empty state */}
      {!selectedLeadId && !generating && (
        <div className="rounded-lg border border-dashed border-border p-16 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Select a lead above to generate outreach drafts
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            All three drafts are automatically compliance-checked after generation
          </p>
        </div>
      )}

      {/* Generating skeleton */}
      {generating && (
        <div className="rounded-lg border border-border p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <p className="text-sm text-muted-foreground">
              Generating 3 persona drafts for{" "}
              <span className="font-medium text-foreground">{selectedLead?.name}</span>…
            </p>
          </div>
          <div className="flex gap-2 mb-6">
            {PERSONAS.map((p) => (
              <div key={p.key} className="h-8 w-24 rounded-md bg-muted animate-pulse" />
            ))}
          </div>
          <div className="flex flex-col gap-2 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded" style={{ width: GENERATING_SKELETON_WIDTHS[i % GENERATING_SKELETON_WIDTHS.length] }} />
            ))}
          </div>
        </div>
      )}

      {/* Drafts panel */}
      {drafts && !generating && (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-4 pt-4 bg-muted/20">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Drafts for {selectedLead?.name}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => drafts && runAllCompliance(drafts)}
                disabled={Object.values(checking).some(Boolean)}
              >
                Re-check all
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-transparent p-0 gap-1">
                {PERSONAS.map((p) => (
                  <TabsTrigger
                    key={p.key}
                    value={p.tab}
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-t-md rounded-b-none border-b-0 text-sm"
                  >
                    {p.tab}
                    <TabComplianceDot draftKey={p.draftKey} />
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="bg-background border-t border-border -mx-4 px-4 pt-5 pb-4 mt-0">
                {PERSONAS.map((p) => (
                  <TabsContent key={p.key} value={p.tab} className="mt-0">
                    <PersonaTab
                      key={`${p.key}-${selectedLeadId}-${drafts[p.key].length}`}
                      draftKey={p.draftKey}
                      draft={drafts[p.key]}
                      personaLabel={p.label}
                      personaDescription={p.description}
                      isRegenerating={regeneratingKey === p.key}
                      onRegenerate={() => handleRegenerate(p.key)}
                      complianceResult={compliance[p.draftKey] ?? null}
                      complianceChecking={checking[p.draftKey] ?? false}
                      onRerunCompliance={() => runComplianceFor(p.draftKey, drafts[p.key])}
                    />
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  )
}