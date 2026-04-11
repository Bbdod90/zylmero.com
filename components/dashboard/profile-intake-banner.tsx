import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

export function ProfileIntakeBanner() {
  return (
    <div className="border-b border-primary/35 bg-primary/10 px-safe py-2.5 text-center text-sm leading-snug text-foreground sm:text-[0.9375rem]">
      <span className="font-medium">Rond je bedrijfsprofiel af</span>
      {" — "}
      Vul je gegevens in onder Instellingen zodat het tabblad{" "}
      <Link href="/dashboard/settings?tab=business" className="underline underline-offset-2">
        Bedrijf
      </Link>{" "}
      klopt voor {BRAND_NAME} (AI en automatisering).
    </div>
  );
}
