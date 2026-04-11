import Link from "next/link";
import { ForgotPasswordForm } from "@/app/login/forgot-password-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BRAND_LOGO_MONOGRAM } from "@/lib/brand";

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-6">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 text-lg font-bold text-primary">
            {BRAND_LOGO_MONOGRAM}
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Wachtwoord vergeten</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Vul je e-mail in — je ontvangt een link om een nieuw wachtwoord te kiezen.
          </p>
        </div>
        <Card className="rounded-2xl border-border/70 bg-card/70">
          <CardHeader>
            <CardTitle className="text-base">Herstel toegang</CardTitle>
          </CardHeader>
          <CardContent>
            <ForgotPasswordForm />
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Terug naar inloggen
          </Link>
        </p>
      </div>
    </div>
  );
}
