import { Suspense } from "react";
import Link from "next/link";
import { SignupForm } from "@/app/signup/signup-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-6">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/26 to-accent/16 text-lg font-bold text-primary shadow-sm ring-1 ring-primary/15">
            CF
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
            Start gratis proefperiode
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Binnen 5 minuten live · Geen creditcard · Annuleer wanneer je wilt
          </p>
        </div>
        <Card className="rounded-2xl border-border/70 bg-card/70">
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
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
