"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`size-10 shrink-0 rounded-xl ${className ?? ""}`}
        aria-label="Thema"
        disabled
      >
        <span className="size-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={`size-10 shrink-0 rounded-xl border border-border/50 bg-background/40 text-muted-foreground shadow-sm backdrop-blur-md transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-foreground ${className ?? ""}`}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Schakel naar licht thema" : "Schakel naar donker thema"}
      title={isDark ? "Licht thema" : "Donker thema"}
    >
      {isDark ? <Sun className="size-[1.125rem]" /> : <Moon className="size-[1.125rem]" />}
    </Button>
  );
}
