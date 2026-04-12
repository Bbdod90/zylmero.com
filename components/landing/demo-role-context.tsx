"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { enterAnonymousDemoWithNiche } from "@/actions/demo";
import { DEMO_NICHE_DEFAULT, type NicheId } from "@/lib/niches";

type DemoRoleContextValue = {
  demoRole: NicheId;
  setDemoRole: (id: NicheId) => void;
};

const DemoRoleContext = createContext<DemoRoleContextValue | null>(null);

export function DemoRoleProvider({ children }: { children: ReactNode }) {
  const [demoRole, setDemoRole] = useState<NicheId>(DEMO_NICHE_DEFAULT);
  const value = useMemo(
    () => ({ demoRole, setDemoRole }),
    [demoRole],
  );
  return (
    <DemoRoleContext.Provider value={value}>{children}</DemoRoleContext.Provider>
  );
}

export function useDemoRole(): DemoRoleContextValue {
  const ctx = useContext(DemoRoleContext);
  if (!ctx) {
    throw new Error("useDemoRole must be used within DemoRoleProvider");
  }
  return ctx;
}

/** Zelfde niche als homepage-demo; buiten provider: default niche. */
export function useDemoRoleOptional(): DemoRoleContextValue | null {
  return useContext(DemoRoleContext);
}

/**
 * Server action-form met huidige demo-rol. Werkt ook buiten provider (valt terug op default niche).
 */
export function AnonymousDemoForm({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useDemoRoleOptional();
  const niche = ctx?.demoRole ?? DEMO_NICHE_DEFAULT;
  return (
    <form action={enterAnonymousDemoWithNiche} className={className}>
      <input type="hidden" name="niche" value={niche} />
      {children}
    </form>
  );
}
