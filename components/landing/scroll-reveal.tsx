"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ScrollReveal({
  children,
  className,
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Stagger siblings by passing 0, 80, 160, … */
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setVisible(true);
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
      className={cn(
        "transition-opacity duration-700 ease-out motion-reduce:transition-none",
        visible
          ? "opacity-100"
          : "opacity-0 motion-reduce:opacity-100",
        className,
      )}
    >
      {children}
    </div>
  );
}
