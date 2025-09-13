import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-[var(--primary)]/20 bg-[var(--primary)]/10 text-[var(--primary)]",
        secondary:
          "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]/80",
        destructive:
          "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200",
        outline: "border-[var(--border)] bg-transparent text-[var(--text)]/80",
        success:
          "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200",
        warning:
          "border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
