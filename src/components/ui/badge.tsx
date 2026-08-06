import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/shared/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-transparent text-text-1",
        secondary: "bg-transparent text-text-3",
        success: "bg-transparent text-success",
        warning: "bg-transparent text-warning",
        destructive: "bg-transparent text-error",
        outline: "border-border text-text-1",
        ghost: "text-text-3",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const statusDotClass: Record<
  NonNullable<VariantProps<typeof badgeVariants>["variant"]>,
  string
> = {
  default: "bg-text-1",
  secondary: "bg-text-3",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-error",
  outline: "bg-text-1",
  ghost: "bg-text-3",
  link: "bg-primary",
}

function Badge({
  className,
  variant = "default",
  asChild = false,
  showDot = false,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean
    /** Nightframe: texto + punto de color, sin fondo saturado */
    showDot?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "span"
  const resolved = variant ?? "default"

  return (
    <Comp
      data-slot="badge"
      data-variant={resolved}
      className={cn(badgeVariants({ variant: resolved }), className)}
      {...props}
    >
      {showDot && (
        <span
          aria-hidden
          className={cn("size-1.5 shrink-0 rounded-full", statusDotClass[resolved])}
        />
      )}
      {children}
    </Comp>
  )
}

export type StatusBadgeStatus =
  | "active"
  | "pending"
  | "overdue"
  | "completed"
  | "therapy"
  | "medical"

const STATUS_CONFIG: Record<
  StatusBadgeStatus,
  { variant: NonNullable<VariantProps<typeof badgeVariants>["variant"]>; label: string }
> = {
  active: { variant: "success", label: "Activo" },
  pending: { variant: "warning", label: "Pendiente" },
  overdue: { variant: "destructive", label: "Vencido" },
  completed: { variant: "secondary", label: "Completado" },
  therapy: { variant: "default", label: "Terapia" },
  medical: { variant: "destructive", label: "Médica" },
}

function StatusBadge({
  status,
  label,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Badge>, "variant" | "showDot" | "children"> & {
  status: StatusBadgeStatus
  label?: string
}) {
  const config = STATUS_CONFIG[status]
  return (
    <Badge
      variant={config.variant}
      showDot
      className={cn(
        status === "therapy" && "text-primary uppercase tracking-wider",
        status === "medical" && "uppercase tracking-wider",
        className
      )}
      {...props}
    >
      {label ?? config.label}
    </Badge>
  )
}

export { Badge, StatusBadge, badgeVariants }
