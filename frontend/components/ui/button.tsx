import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "outline" | "ghost" | "secondary" | string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    let variantClasses = "bg-primary text-on-primary hover:shadow-[0_0_15px_rgba(240,180,41,0.3)]";
    if (variant === "outline") {
      variantClasses = "bg-transparent border border-primary text-primary hover:bg-primary/10";
    } else if (variant === "ghost") {
      variantClasses = "bg-transparent text-on-surface hover:bg-surface-high";
    } else if (variant === "secondary") {
      variantClasses = "bg-secondary text-on-secondary hover:bg-secondary/80";
    }

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2",
          variantClasses,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
