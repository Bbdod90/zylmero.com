"use client";

import type { ReactNode } from "react";
import { enterAnonymousDemoWithNiche } from "@/actions/demo";
import { DEMO_NICHE_DEFAULT } from "@/lib/niches";

/**
 * Server action-form voor anonieme demo-entry (default niche).
 */
export function AnonymousDemoForm({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <form action={enterAnonymousDemoWithNiche} className={className}>
      <input type="hidden" name="niche" value={DEMO_NICHE_DEFAULT} />
      {children}
    </form>
  );
}
