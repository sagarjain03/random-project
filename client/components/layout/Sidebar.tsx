"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { getStats } from "@/lib/stats"

export default function Sidebar() {
  const pathname = usePathname()
  const stats = getStats()

  const navItems = [
    {
      href: "/leads",
      label: "Pipeline",
      description: "Lead scoring",
      count: stats.totalLeads,
    },
    {
      href: "/outreach",
      label: "Outreach",
      description: "Draft generator",
      count: null,
    },
    {
      href: "/compliance",
      label: "Compliance",
      description: "RAG guardian",
      count: stats.totalFlags > 0 ? stats.totalFlags : null,
      countUrgent: true,
    },
    {
      href: "/nudge",
      label: "Nudge queue",
      description: "Activation",
      count: stats.nudgeQueue,
      countUrgent: stats.criticalPartners > 0,
    },
  ]

  return (
    <aside className="w-56 shrink-0 border-r border-border min-h-screen p-4 flex flex-col gap-1">
      {/* Logo */}
      <Link href="/" className="px-2 py-3 mb-4 block group">
        <p className="text-base font-semibold tracking-tight group-hover:text-muted-foreground transition-colors">
          Blostem
        </p>
        <p className="text-xs text-muted-foreground">AI Marketing Engine</p>
      </Link>

      {navItems.map((item) => {
        const active = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <div className="flex flex-col">
              <span className="font-medium">{item.label}</span>
              <span
                className={cn(
                  "text-xs",
                  active
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                )}
              >
                {item.description}
              </span>
            </div>
            {item.count !== null && item.count !== undefined && (
              <span
                className={cn(
                  "text-xs font-medium rounded-full px-2 py-0.5 min-w-[22px] text-center",
                  active
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : item.countUrgent
                    ? "bg-red-100 text-red-700"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {item.count}
              </span>
            )}
          </Link>
        )
      })}

      {/* Bottom — API status */}
      <div className="mt-auto pt-4 border-t border-border">
        <div className="px-3 py-2 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <p className="text-xs text-muted-foreground">Mock data mode</p>
        </div>
        <p className="px-3 text-[10px] text-muted-foreground/60 leading-relaxed">
          Connect Shreya's FastAPI backend to go live
        </p>
      </div>
    </aside>
  )
}