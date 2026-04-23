import Link from "next/link";
import { LoginForm } from "@/app/login/login-form";
import { AuthDivider } from "@/components/auth/auth-divider";
import { LocalhostMobileHint } from "@/components/auth/localhost-mobile-hint";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BRAND_LOGO_MONOGRAM } from "@/lib/brand";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { reason?: string; notice?: string; detail?: string };
}) {
  const reason = typeof searchParams?.reason === "string" ? searchParams.reason : undefined;
  const notice = typeof searchParams?.notice === "string" ? searchParams.notice : undefined;
  const detail = typeof searchParams?.detail === "string" ? searchParams.detail : undefined;

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden zm-landing-atmosphere px-safe py-8 sm:p-6">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute inset-0 zm-landing-spotlight opacity-85 dark:opacity-95" />
        <div className="absolute inset-0 zm-landing-dots opacity-[0.38] dark:opacity-[0.32]" />
      </div>
      <div className="zm-landing-grain-fixed" aria-hidden />
      <div className="absolute right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-20">
        <ThemeToggle />
      </div>
      <div className="relative z-10 w-full max-w-md space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/12 text-sm font-semibold text-primary ring-1 ring-primary/15">
            {BRAND_LOGO_MONOGRAM}
          </div>
          <h1 className="mt-5 text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Inloggen
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Log in om je aanvragen te beheren</p>
        </div>
        <LocalhostMobileHint />
        <Card className="cf-landing-pro-card rounded-[1.15rem] border-border/55 shadow-[0_24px_70px_-40px_rgb(0_0_0/0.2)] dark:shadow-[0_28px_80px_-40px_rgb(0_0_0/0.55)]">
          <CardContent className="p-6 pt-6">
            <SocialAuthButtons nextPath="/dashboard" />
            <AuthDivider label="Of met e-mail en wachtwoord" />
            <LoginForm reason={reason} notice={notice} detail={detail} />
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground">
          Nog geen account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Account aanmaken
          </Link>
        </p>
      </div>
    </div>
  );
}
