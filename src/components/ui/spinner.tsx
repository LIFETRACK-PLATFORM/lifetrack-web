import { cn } from "@/shared/lib/utils"

function Spinner({
  size = 32,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className={cn(
        "animate-spin rounded-full border-[3px] border-surface-3 border-t-primary",
        className
      )}
      style={{ width: size, height: size }}
    />
  )
}

export { Spinner }
