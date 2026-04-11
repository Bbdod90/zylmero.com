import Link from "next/link";

export function DeferredSetupBanner({
  needsAiSetup,
  needsValueMoment,
}: {
  needsAiSetup: boolean;
  needsValueMoment: boolean;
}) {
  if (!needsAiSetup && !needsValueMoment) return null;
  return (
    <div className="border-b border-amber-500/35 bg-amber-500/10 px-safe py-2.5 text-center text-sm leading-snug text-amber-950 dark:text-amber-50 sm:text-[0.9375rem]">
      <span className="font-medium">Optioneel:</span>{" "}
      {needsAiSetup ? (
        <>
          <Link
            href="/dashboard/ai-setup"
            className="underline underline-offset-2"
          >
            AI-profiel afronden
          </Link>
          {needsValueMoment ? " · " : null}
        </>
      ) : null}
      {needsValueMoment ? (
        <Link
          href="/dashboard/value-moment"
          className="underline underline-offset-2"
        >
          Eerste succes-demo
        </Link>
      ) : null}
      {" — "}
      mag later, je dashboard werkt al.
    </div>
  );
}
