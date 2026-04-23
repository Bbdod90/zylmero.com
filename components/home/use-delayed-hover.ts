"use client";

import { useCallback, useRef, useState } from "react";

/** Na `delayMs` hover wordt `active` true — voor subtiele premium-emphasis. */
export function useDelayedHover(delayMs = 600) {
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onPointerEnter = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setActive(true), delayMs);
  }, [delayMs]);

  const onPointerLeave = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setActive(false);
  }, []);

  return { active, onPointerEnter, onPointerLeave };
}
