"use client"

import { useRouter } from "next/navigation"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Lead } from "@/types"
import ScoreBar from "./ScoreBar"

interface LeadDrawerProps {
  lead: Lead | null
  open: boolean
  onClose: () => void
}

function getIntentLabel(score: number) {
  if (score >= 80) return { label: "High intent", variant: "default" as const }
  if (score >= 60) return { label: "Medium intent", variant: "secondary" as const }
  return { label: "Low intent", variant: "outline" as const }
}

export default function LeadDrawer({ lead, open, onClose }: LeadDrawerProps) {
  const router = useRouter()

  if (!lead) return null
  const intent = getIntentLabel(lead.score)

  function handleGenerateOutreach() {
    router.push(`/outreach?lead=${lead!.id}`)
    onClose()
  }

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} direction="right">
      <DrawerContent className="h-full w-full max-w-md ml-auto rounded-none">
        <DrawerHeader className="pb-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DrawerTitle className="text-lg">{lead.name}</DrawerTitle>
              <DrawerDescription className="mt-0.5">{lead.industry}</DrawerDescription>
            </div>
            <Badge variant={intent.variant}>{intent.label}</Badge>
          </div>

          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-1.5">Buying-signal score</p>
            <ScoreBar score={lead.score} />
          </div>
        </DrawerHeader>

        <Separator className="my-4" />

        <div className="px-4 pb-8 flex flex-col gap-4 overflow-y-auto">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Buying signals
            </p>
            <div className="flex flex-col gap-3">
              {lead.signals.map((signal, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-muted/40 p-3"
                >
                  <p className="text-sm font-medium text-foreground mb-1">
                    {signal.label}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {signal.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
              Next step
            </p>
            <Button
              className="w-full"
              onClick={handleGenerateOutreach}
            >
              Generate outreach
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}