import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-16 text-foreground">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="mt-2 text-balance text-2xl font-bold tracking-tight md:text-3xl">
        Deze pagina bestaat niet
      </h1>
      <p className="mt-3 max-w-md text-center text-sm text-muted-foreground">
        Controleer de URL, of ga terug naar de homepage van {BRAND_NAME}.
      </p>
      <Button asChild className="mt-8 rounded-xl">
        <Link href="/">Naar homepage</Link>
      </Button>
    </div>
  );
}
