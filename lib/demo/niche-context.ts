import { cookies } from "next/headers";
import {
  DEMO_NICHE_DEFAULT,
  isNicheId,
  NICHE_COOKIE,
  type NicheId,
} from "@/lib/niches";

/** Actieve demo-branche (cookie, server-only). */
export function getDemoNicheId(): NicheId {
  try {
    const v = cookies().get(NICHE_COOKIE)?.value;
    if (v && isNicheId(v)) return v;
  } catch {
    /* build / static */
  }
  return DEMO_NICHE_DEFAULT;
}
