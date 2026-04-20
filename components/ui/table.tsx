import * as React from "react";
import { cn } from "@/lib/utils";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div
    className={cn(
      "relative w-full overflow-x-auto rounded-xl border border-border/65 bg-card",
      "shadow-[0_1px_0_0_hsl(220_13%_70%/0.45),0_12px_32px_-20px_rgb(15_23_42/0.08)]",
      "ring-1 ring-black/[0.03] dark:border-white/[0.09] dark:bg-card/70 dark:shadow-[0_1px_0_0_hsl(220_16%_22%/0.5),0_16px_40px_-24px_rgb(0_0_0/0.45)] dark:ring-white/[0.05]",
    )}
  >
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "border-b border-border/70 bg-gradient-to-b from-muted/55 to-muted/35 [&_tr]:border-b-0",
      "dark:border-white/[0.08] dark:from-white/[0.06] dark:to-white/[0.02]",
      className,
    )}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-border/55 transition-colors duration-200",
      "hover:bg-muted/40 data-[state=selected]:bg-muted/50",
      "dark:border-white/[0.06] dark:hover:bg-white/[0.045] dark:data-[state=selected]:bg-white/[0.07]",
      className,
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-11 px-4 text-left align-middle text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:px-5",
      "first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6",
      className,
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-4 py-3.5 align-middle text-sm leading-relaxed text-foreground first:pl-5 last:pr-5 sm:px-5 sm:first:pl-6 sm:last:pr-6",
      className,
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

export { Table, TableHeader, TableBody, TableHead, TableRow, TableCell };
