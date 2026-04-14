import { Suspense } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { SignupForm } from "@/app/signup/signup-form";
import { LocalhostMobileHint } from "@/components/auth/localhost-mobile-hint";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BRAND_LOGO_MONOGRAM } from "@/lib/brand";

export default function SignupPage() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-background px-safe py-8 sm:p-6">
      <div className="absolute left-[max(1rem,env(safe-area-inset-left))] top-[max(1rem,env(safe-area-inset-top))] z-10">
        <Link
          href="/"
          className="inline-flex size-10 items-center justify-center rounded-xl border border-border/60 bg-background/90 text-muted-foreground shadow-sm backdrop-blur-sm transition hover:bg-muted hover:text-foreground"
          aria-label="Terug naar home"
        >
          <X className="size-5" strokeWidth={2} />
        </Link>
      </div>
      <div className="absolute right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-10">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md space-y-5 sm:space-y-6">
        <div className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/26 to-accent/16 text-lg font-bold text-primary shadow-sm ring-1 ring-primary/15">
            {BRAND_LOGO_MONOGRAM}
          </div>
          <h1 className="mt-4 text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Account aanmaken
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Binnen 5 minuten live · Geen creditcard · Annuleer wanneer je wilt
          </p>
        </div>
        <LocalhostMobileHint />
        <Card className="rounded-2xl border-border/70 bg-card/70">
          <CardHeader>
            <CardTitle className="text-base">Jouw gegevens</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="h-32 animate-pulse rounded-xl bg-muted/40" />
              }
            >
              <SignupForm />
            </Suspense>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground">
          Al een account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Inloggen
          </Link>
        </p>
      </div>
    </div>
  );
}
