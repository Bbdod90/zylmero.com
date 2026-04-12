"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  COOKIE_ANON_DEMO,
  COOKIE_DEMO,
  COOKIE_DEMO_ENTRY,
} from "@/lib/app-cookies";
import { DEMO_NICHE_DEFAULT, isNicheId, NICHE_COOKIE } from "@/lib/niches";

export async function setDemoModeCookie(enabled: boolean) {
  cookies().set(COOKIE_DEMO, enabled ? "1" : "0", {
    path: "/",
    maxAge: enabled ? 60 * 60 * 24 * 30 : 0,
    sameSite: "lax",
  });
  redirect("/dashboard");
}

export async function setDemoNicheAction(formData: FormData) {
  const niche = String(formData.get("niche") || "").trim();
  if (!isNicheId(niche)) {
    redirect("/dashboard");
  }
  cookies().set(NICHE_COOKIE, niche, {
    path: "/",
    maxAge: 60 * 60 * 4,
    sameSite: "lax",
  });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/** Public “View demo” — no login; loads sample data in the real app shell. */
export async function enterAnonymousDemo() {
  cookies().set(COOKIE_ANON_DEMO, "1", {
    path: "/",
    maxAge: 60 * 60 * 4,
    sameSite: "lax",
  });
  cookies().set(COOKIE_DEMO, "1", {
    path: "/",
    maxAge: 60 * 60 * 4,
    sameSite: "lax",
  });
  cookies().set(NICHE_COOKIE, DEMO_NICHE_DEFAULT, {
    path: "/",
    maxAge: 60 * 60 * 4,
    sameSite: "lax",
  });
  redirect("/dashboard");
}

/** Zelfde als enterAnonymousDemo, maar niche vanuit homepage-demo (verborgen formulier). */
export async function enterAnonymousDemoWithNiche(formData: FormData) {
  const raw = String(formData.get("niche") || "").trim();
  const niche = isNicheId(raw) ? raw : DEMO_NICHE_DEFAULT;
  cookies().set(COOKIE_ANON_DEMO, "1", {
    path: "/",
    maxAge: 60 * 60 * 4,
    sameSite: "lax",
  });
  cookies().set(COOKIE_DEMO, "1", {
    path: "/",
    maxAge: 60 * 60 * 4,
    sameSite: "lax",
  });
  cookies().set(NICHE_COOKIE, niche, {
    path: "/",
    maxAge: 60 * 60 * 4,
    sameSite: "lax",
  });
  redirect("/dashboard");
}

export async function exitAnonymousDemo() {
  cookies().set(COOKIE_ANON_DEMO, "", { path: "/", maxAge: 0 });
  cookies().set(COOKIE_DEMO, "", { path: "/", maxAge: 0 });
  cookies().set(COOKIE_DEMO_ENTRY, "", { path: "/", maxAge: 0 });
  cookies().set("cf_anon_demo", "", { path: "/", maxAge: 0 });
  cookies().set("closerflow_demo", "", { path: "/", maxAge: 0 }); /* legacy cookie-naam */
  cookies().set("cf_demo_entry", "", { path: "/", maxAge: 0 });
  cookies().set(NICHE_COOKIE, "", { path: "/", maxAge: 0 });
  cookies().set("cf_demo_niche", "", { path: "/", maxAge: 0 });
  redirect("/");
}

/** Shared demo link — sets preview session and opens app. */
export async function openSharedDemo(slug: string) {
  cookies().set(COOKIE_ANON_DEMO, "1", {
    path: "/",
    maxAge: 60 * 60 * 4,
    sameSite: "lax",
  });
  cookies().set(COOKIE_DEMO, "1", {
    path: "/",
    maxAge: 60 * 60 * 4,
    sameSite: "lax",
  });
  cookies().set(NICHE_COOKIE, DEMO_NICHE_DEFAULT, {
    path: "/",
    maxAge: 60 * 60 * 4,
    sameSite: "lax",
  });
  cookies().set(COOKIE_DEMO_ENTRY, slug.slice(0, 64), {
    path: "/",
    maxAge: 60 * 60 * 4,
    sameSite: "lax",
  });
  redirect("/dashboard");
}
