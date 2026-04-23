"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useHomeDemo } from "@/components/home/home-demo-context";
import { ProductMockup } from "@/components/home/ProductMockup";
import { BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function HomeProductDemo() {
  const { demoOpen, setDemoOpen } = useHomeDemo();

  return (
    <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
      <DialogContent
        className={cn(
          "max-h-[90dvh] max-w-[min(100vw-1.5rem,520px)] gap-0 overflow-y-auto border p-0 sm:max-w-lg",
          "border-slate-200/90 bg-white/95 text-slate-900 shadow-2xl backdrop-blur-xl",
          "dark:border-white/12 dark:bg-[#0c1018]/95 dark:text-white",
        )}
      >
        <DialogHeader className="border-b border-slate-100 px-6 pb-4 pt-6 text-left dark:border-white/[0.08]">
          <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Bekijk het voorbeeld
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-slate-600 dark:text-white/65">
            Van binnenkomende aanvraag tot bevestigde afspraak — zo ervaart een klant het.
          </DialogDescription>
        </DialogHeader>
        <div className="px-5 pb-6 pt-4 sm:px-6">
          <ProductMockup floating={false} />
          <ol className="mt-6 space-y-3 text-sm font-medium text-slate-700 dark:text-white/75">
            <li className="flex gap-2">
              <span className="font-mono text-xs text-blue-600 dark:text-blue-400">1</span>
              Aanvraag komt binnen op één plek
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-xs text-blue-600 dark:text-blue-400">2</span>
              {`${BRAND_NAME} antwoordt direct met context`}
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-xs text-blue-600 dark:text-blue-400">3</span>
              Afspraak staat vast — jij ziet het in je overzicht
            </li>
          </ol>
        </div>
      </DialogContent>
    </Dialog>
  );
}
