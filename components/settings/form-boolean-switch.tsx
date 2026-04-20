"use client";

import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Server actions lezen booleans als `formData.get(name) === "on"`.
 * Radix Switch stuurt dat niet native mee — daarom een hidden veld dat we client-side bijwerken.
 */
export function FormBooleanSwitch({
  name,
  defaultChecked,
  label,
  labelClassName,
  switchAriaLabel,
}: {
  name: string;
  defaultChecked: boolean;
  label?: string;
  labelClassName?: string;
  /** Zonder zichtbaar label: toegankelijke naam voor de switch */
  switchAriaLabel?: string;
}) {
  const [on, setOn] = React.useState(defaultChecked);
  const id = React.useId();
  const aria = switchAriaLabel ?? label ?? name;

  return (
    <div className="flex items-center gap-3">
      <input type="hidden" name={name} value={on ? "on" : ""} />
      <Switch
        id={id}
        checked={on}
        onCheckedChange={setOn}
        aria-label={aria}
      />
      {label ? (
        <Label
          htmlFor={id}
          className={cn(
            "cursor-pointer text-sm font-medium leading-none text-foreground",
            labelClassName,
          )}
        >
          {label}
        </Label>
      ) : null}
    </div>
  );
}
