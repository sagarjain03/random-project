import { cn } from "@/lib/utils"
import Link from "next/link"

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  href?: string
  accent?: "default" | "green" | "amber" | "red"
}

const accentMap = {
  default: "border-border",
  green:   "border-emerald-300 bg-emerald-50",
  amber:   "border-amber-300 bg-amber-50",
  red:     "border-red-300 bg-red-50",
}

const valueMap = {
  default: "text-foreground",
  green:   "text-emerald-800",
  amber:   "text-amber-800",
  red:     "text-red-800",
}

export default function StatCard({
  label,
  value,
  sub,
  href,
  accent = "default",
}: StatCardProps) {
  const inner = (
    <div
      className={cn(
        "rounded-lg border p-5 flex flex-col gap-1 transition-colors",
        accentMap[accent],
        href && "hover:border-foreground/20 cursor-pointer"
      )}
    >
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className={cn("text-3xl font-semibold tracking-tight", valueMap[accent])}>
        {value}
      </p>
      {sub && (
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      )}
    </div>
  )

  if (href) return <Link href={href}>{inner}</Link>
  return inner
}