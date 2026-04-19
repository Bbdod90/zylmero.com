"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { createEmbeddedChatbot } from "@/actions/embedded-chatbots";
import { Button } from "@/components/ui/button";

export function NewEmbeddedChatbotButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        className="rounded-xl"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const r = await createEmbeddedChatbot();
            if (r.ok) {
              router.push(`/dashboard/chatbots/${r.id}`);
              router.refresh();
            } else {
              setError(r.error);
            }
          });
        }}
      >
        {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Plus className="mr-2 size-4" />}
        Nieuwe website-chat
      </Button>
      {error ? <p className="max-w-xs text-right text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
