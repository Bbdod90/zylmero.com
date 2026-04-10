"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const run = async () => {
      const href = window.location.href;
      if (href.includes("code=")) {
        const { error } = await supabase.auth.exchangeCodeForSession(href);
        if (error) {
          router.replace("/login/wachtwoord?reason=invalid");
          return;
        }
      }
      setReady(true);
    };

    void run();
  }, [router]);

  const handleReset = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Wachtwoord aangepast!");
      window.location.href = "/login";
    }
  };

  if (!ready) {
    return <p className="p-8 text-center text-muted-foreground">Even geduld…</p>;
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-8">
      <h1 className="text-xl font-semibold">Nieuw wachtwoord</h1>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        placeholder="Minimaal 8 tekens"
        autoComplete="new-password"
      />
      <button
        type="button"
        onClick={() => void handleReset()}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Opslaan
      </button>
    </div>
  );
}
