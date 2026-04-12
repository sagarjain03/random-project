import { BuyingSignal } from "@/types"

export default function SignalBadge({ signal }: { signal: BuyingSignal }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
      {signal.label}
    </span>
  )
}