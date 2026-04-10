import Link from "next/link";
import { LoginForm } from "@/app/login/login-form";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { reason?: string };
}) {
  const reason = typeof searchParams?.reason === "string" ? searchParams.reason : undefined;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-6">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/12 text-sm font-semibold text-primary ring-1 ring-primary/15">
            CF
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">Inloggen</h1>
          <p className="mt-2 text-sm text-muted-foreground">Log in om je aanvragen te beheren</p>
        </div>
        <Card className="rounded-2xl border-border/60 bg-card/80 shadow-sm">
          <CardContent className="p-6 pt-6">
            <LoginForm reason={reason} />
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
