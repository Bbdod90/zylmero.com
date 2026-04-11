import { Suspense } from "react";
import { ResetPasswordClient } from "@/app/reset-password/reset-password-client";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center text-muted-foreground">
          Laden…
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
