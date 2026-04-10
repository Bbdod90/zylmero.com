import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";

export default async function DashboardRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const auth = await getAuth();
  if (!auth.user) {
    redirect("/login");
  }
  return children;
}
