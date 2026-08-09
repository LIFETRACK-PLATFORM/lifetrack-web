import type { ReactNode } from "react"
import { cn } from "@/shared/lib/utils"

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex w-full max-w-[270px] flex-col items-center gap-2.5 rounded-[14px] border border-border bg-surface-1 px-[22px] py-8 text-center",
        className
      )}
    >
      <div className="flex size-[52px] items-center justify-center rounded-full bg-accent-tint/15 text-primary">
        {icon}
      </div>
      <div className="font-heading text-[15px] font-semibold text-text-1">{title}</div>
      <div className="text-[13px] leading-relaxed text-text-3">{description}</div>
      {action}
    </div>
  )
}

export { EmptyState }
