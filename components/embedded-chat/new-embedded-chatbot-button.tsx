"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { createEmbeddedChatbot } from "@/actions/embedded-chatbots";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NewEmbeddedChatbotButton({
  variant = "default",
}: {
  variant?: "default" | "outline";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className={cn("flex flex-col gap-2", variant === "outline" ? "items-center" : "items-end")}>
      <Button
        type="button"
        variant={variant === "outline" ? "outline" : "default"}
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
        {variant === "outline" ? "Snel aanmaken" : "Nieuwe website-chat"}
      </Button>
      {error ? (
        <p className={cn("max-w-xs text-xs text-destructive", variant === "outline" ? "text-center" : "text-right")}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
