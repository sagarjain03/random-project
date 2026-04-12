import { cn } from "@/lib/utils"

interface StageBadgeProps {
  stage: string
}

function getStageStyle(stage: string) {
  const map: Record<string, string> = {
    Onboarding:  "bg-blue-100 text-blue-800 border-blue-200",
    Integration: "bg-violet-100 text-violet-800 border-violet-200",
    Active:      "bg-emerald-100 text-emerald-800 border-emerald-200",
    Stalled:     "bg-red-100 text-red-800 border-red-200",
  }
  return map[stage] ?? "bg-muted text-muted-foreground border-border"
}

export default function StageBadge({ stage }: StageBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
      getStageStyle(stage)
    )}>
      {stage}
    </span>
  )
}