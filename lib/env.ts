import { cookies } from "next/headers";

/** Demo dataset + UI — env, sidebar toggle, anonymous preview, or logged-in demo. */
export function isDemoMode(): boolean {
  if (process.env.NEXT_PUBLIC_CLOSERFLOW_DEMO === "true") return true;
  try {
    const c = cookies();
    return (
      c.get("closerflow_demo")?.value === "1" ||
      c.get("cf_anon_demo")?.value === "1"
    );
  } catch {
    return false;
  }
}

export function isAnonymousPreviewSession(): boolean {
  try {
    return cookies().get("cf_anon_demo")?.value === "1";
  } catch {
    return false;
  }
}

/** Founder "sales mode" — stronger value/urgency cues in product UI. */
export function isSalesMode(): boolean {
  try {
    return cookies().get("cf_sales_mode")?.value === "1";
  } catch {
    return false;
  }
}
