"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SHOW_AFTER_PX = 520;

export function HomeStickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div
        className={cn(
          "pointer-events-none fixed bottom-0 left-0 right-0 z-[55] h-20 bg-gradient-to-t from-[#05070D] via-[#05070D]/90 to-transparent transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0",
        )}
      />
      <motion.div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[60] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 md:px-8 md:pb-5",
          visible ? "pointer-events-auto" : "pointer-events-none",
        )}
        initial={false}
        animate={visible ? { y: 0, opacity: 1 } : { y: 28, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
          <p className="text-center text-sm font-medium text-white/70 sm:text-left sm:text-base">
            Elke gemiste aanvraag kost je omzet.
          </p>
          <Button
            asChild
            className="h-11 w-full rounded-full bg-white text-sm font-semibold text-[#05070D] shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/95 sm:w-auto sm:min-w-[160px]"
          >
            <Link href="/signup">Start gratis</Link>
          </Button>
        </div>
      </motion.div>
    </>
  );
}
