export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="relative my-6" role="separator" aria-label={label}>
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border/55 dark:border-white/[0.08]" />
      </div>
      <div className="relative flex justify-center text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <span className="rounded-full bg-card px-3 py-0.5">{label}</span>
      </div>
    </div>
  );
}
