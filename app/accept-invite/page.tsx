import Link from "next/link";
import { getAuth } from "@/lib/auth";
import { getTeamInvitePreview } from "@/actions/team";
import { AcceptInviteClient } from "./accept-invite-client";
import { Button } from "@/components/ui/button";
import { BRAND_NAME } from "@/lib/brand";

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;
  if (!token) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-sm text-muted-foreground">Geen uitnodiging gevonden.</p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/login">Inloggen</Link>
        </Button>
      </div>
    );
  }

  const preview = await getTeamInvitePreview(token);
  const auth = await getAuth();

  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="text-xl font-semibold tracking-tight">
        Teamuitnodiging {BRAND_NAME}
      </h1>
      {preview ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Je bent uitgenodigd als{" "}
          <span className="font-medium text-foreground">
            {preview.role === "admin" ? "admin" : "medewerker"}
          </span>{" "}
          voor <span className="font-medium">{preview.email}</span>.
        </p>
      ) : (
        <p className="mt-2 text-sm text-destructive">
          Deze link is ongeldig of verlopen.
        </p>
      )}
      {preview && auth.user ? (
        <div className="mt-8">
          <AcceptInviteClient token={token} userEmail={auth.user.email ?? ""} />
        </div>
      ) : preview ? (
        <div className="mt-8 space-y-4">
          <p className="text-sm text-muted-foreground">
            Log in met het e-mailadres van de uitnodiging om te accepteren.
          </p>
          <Button asChild className="rounded-xl">
            <Link
              href={`/login?next=${encodeURIComponent(`/accept-invite?token=${token}`)}`}
            >
              Inloggen
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
