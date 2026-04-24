"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { THEME_COLOR_DARK, THEME_COLOR_LIGHT } from "@/lib/theme-color";

export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const content = resolvedTheme === "dark" ? THEME_COLOR_DARK : THEME_COLOR_LIGHT;
    /** Inline achtergrond = zelfde kleur bij iOS rubber-band (theme-color + body). */
    document.documentElement.style.backgroundColor = content;
    document.body.style.backgroundColor = content;

    const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
    if (metas.length === 0) {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      meta.setAttribute("content", content);
      document.head.appendChild(meta);
      return;
    }
    metas.forEach((meta) => {
      meta.removeAttribute("media");
      meta.setAttribute("content", content);
    });
  }, [mounted, resolvedTheme]);

  return null;
}
