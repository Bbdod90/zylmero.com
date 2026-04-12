"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signUpMarketingHookAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COOKIE_REFERRAL } from "@/lib/app-cookies";
import { mapAuthError } from "@/lib/i18n/auth-errors";
import { getPublicSiteUrlForClient } from "@/lib/public-site-url";
import { createClient } from "@/lib/supabase/client";

function setReferralCookieClient(code: string) {
  const v = code.trim().toUpperCase().slice(0, 12);
  if (!v || !/^[A-Z0-9]{6,12}$/i.test(v)) return;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:";
  const maxAge = 60 * 60 * 24 * 90;
  document.cookie = `${COOKIE_REFERRAL}=${encodeURIComponent(v)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure ? "; Secure" : ""}`;
}

function SignupPasswordField({
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
          required
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

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referral = searchParams.get("ref")?.trim().toUpperCase().slice(0, 12) ?? "";
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const submitLock = useRef(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitLock.current || pending) return;
    submitLock.current = true;
    setError(null);
    setPending(true);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") || "").trim();

    try {
      if (!email || !password || password.length < 8) {
        setError("E-mail en wachtwoord (min. 8 tekens) zijn verplicht.");
        submitLock.current = false;
        return;
      }
      if (password !== passwordConfirm) {
        setError("De wachtwoorden komen niet overeen.");
        submitLock.current = false;
        return;
      }

      const base = getPublicSiteUrlForClient();
      if (!base) {
        setError(
          "Site-URL ontbreekt: zet NEXT_PUBLIC_SITE_URL (zelfde als Supabase Site URL, bijv. https://zylmero.com).",
        );
        submitLock.current = false;
        return;
      }

      const supabase = createClient();
      const { data, error: signErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${base}/auth/callback?next=/dashboard/onboarding`,
        },
      });

      if (signErr) {
        setError(mapAuthError(signErr.message));
        submitLock.current = false;
        return;
      }

      if (referral) {
        setReferralCookieClient(referral);
      }

      if (!data.session) {
        setSuccess(true);
        return;
      }

      await signUpMarketingHookAction(email);
      router.refresh();
      router.push("/dashboard/onboarding");
    } finally {
      setPending(false);
      submitLock.current = false;
    }
  }

  if (success) {
    return (
      <div className="space-y-3 rounded-xl border border-border/60 bg-muted/30 p-5 text-sm">
        <p className="font-medium leading-relaxed text-foreground">
          Check je e-mail en tik op <strong>Account activeren</strong> — op je telefoon, tablet of
          computer mag.
        </p>
        <p className="text-muted-foreground">
          Geen mail? Check spam. Gebruik je oude bevestigingsmail (vóór de template-update)? Log dan
          hier in met e-mail en wachtwoord na bevestigen, of vraag opnieuw een mail aan.
        </p>
        <p className="text-muted-foreground">
          Al een account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Inloggen
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending}
          className="rounded-xl"
        />
      </div>
      <SignupPasswordField
        id="password"
        label="Wachtwoord (min. 8 tekens)"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        disabled={pending}
      />
      <SignupPasswordField
        id="password-confirm"
        label="Herhaal wachtwoord"
        value={passwordConfirm}
        onChange={setPasswordConfirm}
        autoComplete="new-password"
        disabled={pending}
      />
      {error ? (
        <div className="space-y-2 pt-1">
          <p className="text-sm leading-relaxed text-red-600 dark:text-red-400/90">{error}</p>
          {/account met dit e-mailadres|inloggen/i.test(error) ? (
            <Link href="/login" className="text-sm font-medium text-primary hover:underline">
              Ga naar inloggen
            </Link>
          ) : null}
          {/registratiepogingen|wacht|te veel pogingen|rate limit/i.test(error) ? (
            <p className="text-xs text-muted-foreground">
              Tip: druk niet herhaald op de knop. Blijft dit terugkomen: verhoog limieten onder
              Supabase → Authentication → Rate limits.
            </p>
          ) : null}
        </div>
      ) : null}
      <Button type="submit" className="w-full rounded-xl" disabled={pending}>
        {pending ? "Account aanmaken…" : "Start gratis proefperiode"}
      </Button>
    </form>
  );
}
