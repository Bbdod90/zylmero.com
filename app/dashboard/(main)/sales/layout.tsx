import { getAuth } from "@/lib/auth";
import { ensureFounderAccess } from "@/lib/founder/bootstrap";

export default async function FounderSalesRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuth();
  if (auth.user) {
    await ensureFounderAccess(auth.user.id);
  }
  return <>{children}</>;
}
