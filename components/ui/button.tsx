import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-tight transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_1px_0_0_hsl(0_0%_0%/0.12),0_2px_8px_-2px_hsl(var(--primary)/0.45)] hover:bg-primary/[0.94] hover:shadow-[0_1px_0_0_hsl(0_0%_0%/0.15),0_4px_14px_-3px_hsl(var(--primary)/0.4)] dark:shadow-[0_1px_0_0_hsl(220_16%_12%/0.6)]",
        secondary:
          "border border-border/70 bg-secondary text-secondary-foreground shadow-inner-soft hover:bg-secondary/88 dark:border-white/[0.09]",
        outline:
          "border border-border/70 bg-background/50 text-foreground shadow-sm hover:bg-muted/70 hover:border-border dark:border-white/[0.11] dark:bg-transparent dark:hover:bg-white/[0.05]",
        ghost:
          "hover:bg-muted/70 hover:text-foreground dark:hover:bg-white/[0.05]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/[0.93]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 min-h-[44px] px-5 py-2",
        sm: "h-9 min-h-[36px] rounded-lg px-3.5 text-xs",
        lg: "h-12 min-h-[48px] rounded-xl px-8 text-base",
        icon: "h-11 w-11 min-h-[44px] min-w-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
