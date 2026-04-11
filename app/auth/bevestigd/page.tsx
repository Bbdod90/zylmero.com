import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getAuth } from "@/lib/auth";
import { BRAND_DEFAULT_SITE_URL, BRAND_NAME } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

function safeNextPath(raw: string | null | undefined): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/dashboard";
}

export default async function AuthBevestigdPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const auth = await getAuth();
  if (!auth.user) {
    redirect("/login?reason=verify");
  }

  const nextPath = safeNextPath(
    typeof searchParams?.next === "string" ? searchParams.next : null,
  );

  const dashboardHref =
    process.env.NODE_ENV === "development"
      ? nextPath
      : `${BRAND_DEFAULT_SITE_URL.replace(/\/$/, "")}${nextPath}`;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16 [background-image:radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/15 text-primary ring-4 ring-primary/10">
          <CheckCircle2 className="size-10 stroke-[2.5]" aria-hidden />
        </div>
        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Account succesvol geactiveerd
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Je e-mail is bevestigd en je bent ingelogd bij {BRAND_NAME}. Ga verder om je bedrijf in te
            stellen — het duurt maar een paar minuten.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="h-12 rounded-xl px-8 text-base font-semibold">
            <Link href={dashboardHref}>Verder naar het dashboard</Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Werkt de knop niet?{" "}
          <Link
            href={dashboardHref}
            className="font-medium text-primary underline underline-offset-2"
          >
            Directe link
          </Link>
        </p>
      </div>
    </div>
  );
}
