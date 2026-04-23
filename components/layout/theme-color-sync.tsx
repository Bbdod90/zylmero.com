"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

/** Sluit aan bij marketing / dashboard: voorkomt witte flits bij iOS-overscroll en stemt theme-color af. */
const THEME_COLOR_LIGHT = "#f0f4f9";
const THEME_COLOR_DARK = "#05070D";

export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const content = resolvedTheme === "dark" ? THEME_COLOR_DARK : THEME_COLOR_LIGHT;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  }, [mounted, resolvedTheme]);

  return null;
}
