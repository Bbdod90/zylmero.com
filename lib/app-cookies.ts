/** Cookie-namen — niet wijzigen zonder migratie (gebruikers verliezen o.a. demo-state). */
export const COOKIE_DEMO = "zylmero_demo";
export const COOKIE_ANON_DEMO = "zm_anon_demo";
export const COOKIE_REFERRAL = "zm_referral_code";
export const COOKIE_SALES_MODE = "zm_sales_mode";
export const COOKIE_DEMO_ENTRY = "zm_demo_entry";

/** Uitloggen: wis huidige én legacy cookie-namen (oudere deploys). */
export const LEGACY_COOKIES_TO_CLEAR = [
  "closerflow_demo",
  "cf_anon_demo",
  "cf_sales_mode",
  "cf_demo_entry",
  "cf_demo_niche",
] as const;
