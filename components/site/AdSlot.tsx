import Link from "next/link";

/**
 * Advertisement placement (PRD §15). Shows a house ad until a paid campaign or ad network is wired in.
 * `format` controls the reserved size so ads never shift the layout when they load.
 */
export function AdSlot({ format = "leaderboard", className = "" }: { format?: "leaderboard" | "rectangle" | "inline"; className?: string }) {
  const size =
    format === "rectangle" ? "min-h-[250px]" : format === "inline" ? "min-h-[120px]" : "min-h-[100px] md:min-h-[110px]";
  return (
    <aside aria-label="Advertisement" className={`no-print ${className}`}>
      <p className="mb-1 text-center text-[0.7rem] text-muted">Advertisement</p>
      <Link
        href="/advertise"
        className={`flex ${size} flex-col items-center justify-center gap-1 border border-dashed border-gold-500/60 bg-gold-100/40 px-4 text-center dark:bg-navy-900/40`}
      >
        <span className="font-serif text-lg font-semibold text-navy-900 dark:text-gold-400">Reach the De Accolade community</span>
        <span className="text-sm text-muted">Banner, sponsored story and event packages. See advertising options.</span>
      </Link>
    </aside>
  );
}
