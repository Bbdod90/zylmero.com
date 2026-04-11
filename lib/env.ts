import { cookies } from "next/headers";
import {
  COOKIE_ANON_DEMO,
  COOKIE_DEMO,
  COOKIE_SALES_MODE,
} from "@/lib/app-cookies";

/** Gedwongen demo-modus via deploy-env (geen cookie). Leest ook oude env-naam voor bestaande deploys. */
export function isForcedDemoEnv(): boolean {
  return (
    process.env.NEXT_PUBLIC_ZYLMERO_DEMO === "true" ||
    process.env.NEXT_PUBLIC_CLOSERFLOW_DEMO === "true"
  );
}

/** Demo dataset + UI — env, sidebar toggle, anonymous preview, or logged-in demo. */
export function isDemoMode(): boolean {
  if (isForcedDemoEnv()) {
    return true;
  }
  try {
    const c = cookies();
    return (
      c.get(COOKIE_DEMO)?.value === "1" ||
      c.get("closerflow_demo")?.value === "1" ||
      c.get(COOKIE_ANON_DEMO)?.value === "1" ||
      c.get("cf_anon_demo")?.value === "1"
    );
  } catch {
    return false;
  }
}

export function isAnonymousPreviewSession(): boolean {
  try {
    const c = cookies();
    return (
      c.get(COOKIE_ANON_DEMO)?.value === "1" ||
      c.get("cf_anon_demo")?.value === "1"
    );
  } catch {
    return false;
  }
}

/** Founder "sales mode" — stronger value/urgency cues in product UI. */
export function isSalesMode(): boolean {
  try {
    const c = cookies();
    return (
      c.get(COOKIE_SALES_MODE)?.value === "1" ||
      c.get("cf_sales_mode")?.value === "1"
    );
  } catch {
    return false;
  }
}
