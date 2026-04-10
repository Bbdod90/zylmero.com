"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ClipboardCopy } from "lucide-react";

export function CopyButton({
  text,
  label = "Kopiëren",
}: {
  text: string;
  label?: string;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="rounded-lg"
      onClick={() => {
        void navigator.clipboard.writeText(text);
        toast.success("Gekopieerd naar klembord");
      }}
    >
      <ClipboardCopy className="mr-1.5 size-3.5" />
      {label}
    </Button>
  );
}
