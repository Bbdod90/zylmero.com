"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DASHBOARD_NAV_FLAT,
  DASHBOARD_NAV_GROUPS,
} from "@/lib/navigation/dashboard-nav";

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return DASHBOARD_NAV_FLAT;
    return DASHBOARD_NAV_FLAT.filter((item) =>
      item.label.toLowerCase().includes(needle),
    );
  }, [q]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setQ("");
      router.push(href);
    },
    [router],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-lg gap-0 overflow-hidden p-0 sm:max-w-lg"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Snel naar pagina</DialogTitle>
        <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2 dark:border-white/[0.08]">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Zoek pagina…"
            className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
          <kbd className="hidden shrink-0 rounded border border-border/60 bg-muted/50 px-1.5 py-0.5 font-mono text-2xs text-muted-foreground sm:inline">
            esc
          </kbd>
        </div>
        <div className="max-h-[min(60vh,22rem)] overflow-y-auto overscroll-contain p-1">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Geen resultaat.
            </p>
          ) : !q.trim() ? (
            DASHBOARD_NAV_GROUPS.map((group) => (
              <div key={group.id} className="mb-2 last:mb-0">
                <p className="px-2.5 py-1.5 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <button
                          type="button"
                          onClick={() => go(item.href)}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm",
                            "text-foreground transition-colors hover:bg-muted/70 dark:hover:bg-white/[0.06]",
                          )}
                        >
                          <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                          {item.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          ) : (
            <ul className="space-y-0.5">
              {filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <button
                      type="button"
                      onClick={() => go(item.href)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm",
                        "text-foreground transition-colors hover:bg-muted/70 dark:hover:bg-white/[0.06]",
                      )}
                    >
                      <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <p className="border-t border-border/50 px-3 py-2 text-2xs text-muted-foreground dark:border-white/[0.06]">
          <kbd className="rounded border border-border/50 bg-muted/40 px-1 font-mono">⌘K</kbd>{" "}
          of <kbd className="rounded border border-border/50 bg-muted/40 px-1 font-mono">Ctrl+K</kbd>{" "}
          om dit menu te openen.
        </p>
      </DialogContent>
    </Dialog>
  );
}
