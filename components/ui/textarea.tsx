import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[100px] w-full rounded-xl border border-border/60 bg-background/60 px-4 py-3 text-sm shadow-inner-soft ring-offset-background transition-colors placeholder:text-muted-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.1]",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
