import { NextResponse } from "next/server";
import { resolveSiteUrl } from "@/lib/site-url";

export async function GET(request: Request) {
  const site = resolveSiteUrl().replace(/\/$/, "");
  const { searchParams } = new URL(request.url);
  const provider = (searchParams.get("oauth_provider") || "").trim().toLowerCase();

  if (provider === "microsoft") {
    return NextResponse.redirect(new URL("/api/oauth/microsoft-email", site));
  }

  return NextResponse.redirect(new URL("/api/oauth/google-email", site));
}
