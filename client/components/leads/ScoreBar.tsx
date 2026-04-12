import { cn } from "@/lib/utils"

interface ScoreBarProps {
  score: number
  showLabel?: boolean
}

function getScoreColor(score: number) {
  if (score >= 80) return "bg-emerald-500"
  if (score >= 60) return "bg-amber-400"
  return "bg-red-400"
}

function getScoreTextColor(score: number) {
  if (score >= 80) return "text-emerald-700"
  if (score >= 60) return "text-amber-700"
  return "text-red-600"
}

export default function ScoreBar({ score, showLabel = true }: ScoreBarProps) {
  return (
    <div className="flex items-center gap-3 min-w-[120px]">
      {showLabel && (
        <span className={cn("text-sm font-semibold w-7 text-right", getScoreTextColor(score))}>
          {score}
        </span>
      )}
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", getScoreColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}