import { cn } from "@/lib/utils"

interface UrgencyBadgeProps {
  daysInactive: number
}

function getUrgency(days: number) {
  if (days >= 30) return { label: "Critical", classes: "bg-red-100 text-red-800 border-red-200" }
  if (days >= 14) return { label: "High", classes: "bg-amber-100 text-amber-800 border-amber-200" }
  if (days >= 7)  return { label: "Medium", classes: "bg-yellow-100 text-yellow-800 border-yellow-200" }
  return           { label: "Low", classes: "bg-slate-100 text-slate-600 border-slate-200" }
}

export default function UrgencyBadge({ daysInactive }: UrgencyBadgeProps) {
  const { label, classes } = getUrgency(daysInactive)
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
      classes
    )}>
      {label}
    </span>
  )
}