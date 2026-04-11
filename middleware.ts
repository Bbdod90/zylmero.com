import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { rewriteRequestToForwardedPublicUrl } from "@/lib/proxy-public-request";

export async function middleware(request: NextRequest) {
  const req = rewriteRequestToForwardedPublicUrl(request);
  return updateSession(req);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
