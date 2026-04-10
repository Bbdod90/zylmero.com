"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function Callback() {
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
          router.replace("/login?reason=auth");
          return;
        }
      }
      await supabase.auth.getSession();
      router.replace("/dashboard");
    };

    void run();
  }, [router]);

  return <p className="p-8 text-center text-muted-foreground">Bezig met inloggen…</p>;
}
