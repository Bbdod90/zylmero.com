export function TrustLogosRow() {
  const brands = [
    { id: "hl", label: "Het Loket", highlight: true },
    { id: "st", label: "Studio Twintig", highlight: false },
    { id: "mp", label: "Mondzorg Park", highlight: false },
    { id: "vk", label: "Van Kessel Montage", highlight: false },
    { id: "rh", label: "Roos Huidtherapie", highlight: false },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
      {brands.map((b) => (
        <div
          key={b.id}
          className={`flex h-11 items-center justify-center rounded-xl border px-5 md:h-12 md:px-6 ${
            b.highlight
              ? "border-primary/25 bg-primary/[0.06] shadow-[0_0_0_1px_hsl(var(--primary)/0.12)]"
              : "border-white/10 bg-white/[0.03]"
          }`}
        >
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider md:text-xs ${
              b.highlight ? "text-primary" : "text-zinc-500"
            }`}
          >
            {b.label}
          </span>
        </div>
      ))}
    </div>
  );
}
