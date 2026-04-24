"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useHomeDemo } from "@/components/home/home-demo-context";
import { cn } from "@/lib/utils";

const SHOW_AFTER_PX = 480;

export function HomeStickyCta() {
  const [visible, setVisible] = useState(false);
  const { openDemo } = useHomeDemo();

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
          "pointer-events-none fixed bottom-0 left-0 right-0 z-[55] h-20 transition-opacity duration-300 md:h-[4.5rem]",
          "bg-gradient-to-t from-[#e6ecf6] via-[#eef2f9]/92 to-transparent",
          "dark:from-[#05070D] dark:via-[#05070D]/92 dark:to-transparent",
          visible ? "opacity-100" : "opacity-0",
        )}
      />
      <motion.div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[60] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 md:px-8 md:pb-5",
          visible ? "pointer-events-auto" : "pointer-events-none",
        )}
        initial={false}
        animate={visible ? { y: 0, opacity: 1 } : { y: 24, opacity: 0 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className={cn(
            "mx-auto flex max-w-[1200px] flex-col gap-3 rounded-2xl border px-4 py-3.5 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4",
            "border-slate-200/90 bg-white/85 ring-1 ring-slate-900/[0.04]",
            "dark:border-white/10 dark:bg-white/[0.07] dark:ring-white/[0.06]",
          )}
        >
          <p
            className={cn(
              "text-center text-sm font-medium sm:text-left sm:text-base",
              "text-slate-600",
              "dark:text-white/70",
            )}
          >
            Elke gemiste aanvraag kost omzet.
          </p>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="demo"
              onClick={openDemo}
              className="h-11 min-h-0 w-full rounded-full text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 sm:w-auto sm:min-w-[132px]"
            >
              Bekijk demo
            </Button>
            <Button
              asChild
              className={cn(
                "h-11 w-full rounded-full text-sm font-semibold shadow-lg transition-all duration-300 hover:-translate-y-0.5 sm:min-w-[168px]",
                "bg-slate-900 text-white hover:bg-slate-800",
                "dark:bg-white dark:text-[#05070D] dark:hover:bg-white/95",
              )}
            >
              <Link href="/signup">Start gratis</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
