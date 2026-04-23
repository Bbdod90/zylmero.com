"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type HomeDemoContextValue = {
  demoOpen: boolean;
  setDemoOpen: (open: boolean) => void;
  openDemo: () => void;
};

const HomeDemoContext = createContext<HomeDemoContextValue | null>(null);

export function HomeDemoProvider({ children }: { children: ReactNode }) {
  const [demoOpen, setDemoOpen] = useState(false);
  const openDemo = useCallback(() => setDemoOpen(true), []);

  const value = useMemo(
    () => ({
      demoOpen,
      setDemoOpen,
      openDemo,
    }),
    [demoOpen, openDemo],
  );

  return <HomeDemoContext.Provider value={value}>{children}</HomeDemoContext.Provider>;
}

export function useHomeDemo() {
  const ctx = useContext(HomeDemoContext);
  if (!ctx) {
    throw new Error("useHomeDemo must be used within HomeDemoProvider");
  }
  return ctx;
}
