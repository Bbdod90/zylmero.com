import Link from "next/link";
import { ArrowRight, FileText, MessageCircle } from "lucide-react";
import { PageFrame } from "@/components/layout/page-frame";
import { cn } from "@/lib/utils";

function HubCard({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: typeof MessageCircle;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden rounded-2xl border p-6 sm:p-8",
        "border-slate-200/85 bg-white/55 shadow-sm backdrop-blur-md",
        "transition-all duration-300 hover:-translate-y-1 hover:border-slate-300/95 hover:shadow-lg",
        "dark:border-white/[0.09] dark:bg-white/[0.035] dark:hover:border-white/[0.14] dark:hover:bg-white/[0.045]",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          "bg-[radial-gradient(ellipse_85%_70%_at_50%_-20%,rgba(59,130,246,0.12),transparent_65%)]",
          "dark:bg-[radial-gradient(ellipse_85%_70%_at_50%_-15%,rgba(59,130,246,0.22),transparent_60%)]",
        )}
      />
      <div className="relative flex items-start justify-between gap-4">
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-2xl border text-slate-700 shadow-sm ring-1 ring-black/[0.04]",
            "border-slate-200/90 bg-gradient-to-br from-white to-slate-50",
            "dark:border-white/[0.1] dark:from-white/[0.09] dark:to-white/[0.03] dark:text-white",
          )}
        >
          <Icon className="size-6" strokeWidth={1.75} aria-hidden />
        </span>
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-500 shadow-sm transition-all",
            "group-hover:border-slate-300 group-hover:text-slate-900 group-hover:shadow-md",
            "dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-white/55 dark:group-hover:border-white/[0.14] dark:group-hover:text-white",
          )}
          aria-hidden
        >
          <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>
      <div className="relative space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h2>
        <p className="max-w-md text-pretty text-sm leading-relaxed text-slate-600 dark:text-white/65">
          {description}
        </p>
      </div>
    </Link>
  );
}

export function WorkspaceHome({ companyName }: { companyName: string }) {
  return (
    <PageFrame
      title={companyName}
      subtitle="Berichten en offertes — rustig overzicht, zonder ruis."
    >
      <div className="mx-auto w-full max-w-[880px] space-y-8 sm:space-y-10">
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
          <HubCard
            href="/dashboard/inbox"
            title="Chat"
            description="Alle gesprekken met leads en klanten — WhatsApp, e-mail en widget."
            icon={MessageCircle}
          />
          <HubCard
            href="/dashboard/quotes"
            title="Offertes"
            description="Concepten en verzonden offertes bekijken en opvolgen."
            icon={FileText}
          />
        </div>
      </div>
    </PageFrame>
  );
}
