"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BRAND_LOGO_MONOGRAM } from "@/lib/brand";

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  disabled?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          className="rounded-xl pr-11"
          minLength={8}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 size-9 -translate-y-1/2 rounded-lg text-muted-foreground"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Verberg wachtwoord" : "Toon wachtwoord"}
          tabIndex={-1}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
      </div>
    </div>
  );
}

export function ResetPasswordClient() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phase, setPhase] = useState<"loading" | "ready" | "invalid">("loading");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      setPhase("invalid");
      return;
    }

    const supabase = createBrowserClient(url, key);

    const run = async () => {
      const href = typeof window !== "undefined" ? window.location.href : "";
      const { searchParams } = new URL(href);
      const tokenHash = searchParams.get("token_hash");
      const otpType = searchParams.get("type");

      if (tokenHash && otpType === "recovery") {
        const { error: otpErr } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });
        if (otpErr) {
          setPhase("invalid");
          return;
        }
        router.replace("/reset-password", { scroll: false });
        setPhase("ready");
        return;
      }

      const code = searchParams.get("code");

      if (code) {
        const { error: exErr } = await supabase.auth.exchangeCodeForSession(href);
        if (exErr) {
          setPhase("invalid");
          return;
        }
        router.replace("/reset-password", { scroll: false });
        setPhase("ready");
        return;
      }

      const hash = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
      if (hash) {
        const hp = new URLSearchParams(hash);
        const access = hp.get("access_token");
        const refresh = hp.get("refresh_token");
        if (access && refresh) {
          const { error: sErr } = await supabase.auth.setSession({
            access_token: access,
            refresh_token: refresh,
          });
          if (sErr) {
            setPhase("invalid");
            return;
          }
          router.replace("/reset-password", { scroll: false });
          setPhase("ready");
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setPhase("ready");
        return;
      }

      setPhase("invalid");
    };

    void run();
  }, [router]);

  const handleSave = async () => {
    setError(null);
    if (password.length < 8) {
      setError("Minimaal 8 tekens.");
      return;
    }
    if (password !== confirm) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;

    setSaving(true);
    const supabase = createBrowserClient(url, key);
    const { error: upErr } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (upErr) {
      setError(upErr.message);
      return;
    }

    await supabase.auth.signOut();
    window.location.href = "/login?notice=wachtwoord-gewijzigd";
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-background px-safe py-8 sm:p-6">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 text-lg font-bold text-primary">
            {BRAND_LOGO_MONOGRAM}
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Nieuw wachtwoord</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Kies een sterk wachtwoord en bevestig het hieronder.
          </p>
        </div>

        {phase === "loading" ? (
          <Card className="rounded-2xl border-border/70 bg-card/70">
            <CardContent className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              <span>Link wordt gecontroleerd…</span>
            </CardContent>
          </Card>
        ) : null}

        {phase === "invalid" ? (
          <Card className="rounded-2xl border-border/70 bg-card/70">
            <CardHeader>
              <CardTitle className="text-base">Link ongeldig of verlopen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Open de link opnieuw uit je e-mail, of vraag een nieuwe reset aan. Gebruik dezelfde
                site-URL als waar je normaal inlogt (moet overeenkomen met Supabase Site URL).
              </p>
              <Button asChild className="w-full rounded-xl">
                <Link href="/login/wachtwoord">Nieuwe reset aanvragen</Link>
              </Button>
              <Button asChild variant="outline" className="w-full rounded-xl">
                <Link href="/login">Naar inloggen</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {phase === "ready" ? (
          <Card className="rounded-2xl border-border/70 bg-card/70">
            <CardHeader>
              <CardTitle className="text-base">Wachtwoord instellen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PasswordField
                id="password"
                label="Nieuw wachtwoord"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
                disabled={saving}
              />
              <PasswordField
                id="confirm"
                label="Bevestig wachtwoord"
                value={confirm}
                onChange={setConfirm}
                autoComplete="new-password"
                disabled={saving}
              />
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button
                type="button"
                className="h-11 w-full rounded-xl font-semibold"
                disabled={saving}
                onClick={() => void handleSave()}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Opslaan…
                  </>
                ) : (
                  "Opslaan"
                )}
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Terug naar inloggen
          </Link>
        </p>
      </div>
    </div>
  );
}
