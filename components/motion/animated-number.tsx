"use client";

import { useEffect, useRef, useState } from "react";

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

export function useAnimatedScalar(target: number, durationMs = 1400) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    cancelAnimationFrame(frameRef.current);

    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = easeOutCubic(t);
      const v = from + (target - from) * eased;
      setValue(v);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
        setValue(target);
      }
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, durationMs]);

  return value;
}

export function AnimatedInteger({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const v = useAnimatedScalar(value, 1200);
  return <span className={className}>{Math.round(v)}</span>;
}

export function AnimatedCurrency({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const v = useAnimatedScalar(value, 1450);
  const formatted = new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(v));
  return <span className={className}>{formatted}</span>;
}

export function AnimatedDecimal({
  value,
  decimals,
  suffix,
  className,
}: {
  value: number;
  decimals: number;
  suffix?: string;
  className?: string;
}) {
  const v = useAnimatedScalar(value, 1200);
  const s = v.toFixed(decimals);
  return (
    <span className={className}>
      {s}
      {suffix ?? ""}
    </span>
  );
}
