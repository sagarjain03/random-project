import { ComplianceResult } from "@/types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ComplianceBadgeProps {
  result: ComplianceResult | null
  checking: boolean
}

export default function ComplianceBadge({ result, checking }: ComplianceBadgeProps) {
  if (checking) {
    return (
      <Badge variant="secondary" className="animate-pulse text-xs">
        Checking…
      </Badge>
    )
  }
  if (!result) return null

  if (result.status === "clear") {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs">
        Compliant
      </Badge>
    )
  }

  return (
    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border border-amber-200 text-xs">
      {result.flags.length} {result.flags.length === 1 ? "issue" : "issues"} found
    </Badge>
  )
}