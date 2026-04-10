"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { acceptInvitation } from "@/actions/team";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function AcceptInviteClient({
  token,
  userEmail,
}: {
  token: string;
  userEmail: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Ingelogd als <span className="font-medium text-foreground">{userEmail}</span>
      </p>
      <Button
        type="button"
        className="rounded-xl"
        disabled={pending}
        onClick={() => {
          start(async () => {
            const r = await acceptInvitation(token);
            if (r.error) {
              toast.error(r.error);
              return;
            }
            toast.success("Welkom bij het team");
            router.push("/dashboard");
            router.refresh();
          });
        }}
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Accepteren en naar dashboard
      </Button>
    </div>
  );
}
