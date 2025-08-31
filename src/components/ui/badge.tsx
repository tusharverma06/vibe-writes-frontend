import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/90 backdrop-blur-sm text-primary-foreground hover:bg-primary shadow-soft hover:shadow-medium",
        secondary:
          "border-transparent bg-secondary/90 backdrop-blur-sm text-secondary-foreground hover:bg-secondary shadow-soft hover:shadow-medium",
        destructive:
          "border-transparent bg-destructive/90 backdrop-blur-sm text-destructive-foreground hover:bg-destructive shadow-soft hover:shadow-medium",
        outline: "text-foreground border-border/50 bg-background/50 backdrop-blur-sm shadow-soft hover:shadow-medium hover:bg-accent",
      },
    },
    defaultVariants: {
      variant: "default",
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
