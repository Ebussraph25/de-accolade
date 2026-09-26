import Link from "next/link";
import type { BreakingItem } from "@/lib/types";

export function BreakingTicker({ items, label }: { items: BreakingItem[]; label: string }) {
  if (!items.length) return null;
  const loop = [...items, ...items];
  return (
    <div className="ticker border-b border-rule bg-surface" role="region" aria-label={label}>
      <div className="container-page flex h-11 items-center gap-4">
        <span className="flex shrink-0 items-center gap-2 bg-live px-2.5 py-1 text-[0.8rem] font-bold text-white">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden />
          {label}
        </span>
        <div className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_2rem,#000_calc(100%-2rem),transparent)]">
          <ul className="ticker-track">
            {loop.map((b, i) => (
              <li key={`${b.id}-${i}`} className="flex items-center whitespace-nowrap pr-10 text-[0.95rem] font-medium" aria-hidden={i >= items.length || undefined}>
                <span className="mr-10 h-1 w-1 rotate-45 bg-gold-500" aria-hidden />
                {b.link ? (
                  <Link href={b.link} className="hover:underline" tabIndex={i >= items.length ? -1 : undefined}>{b.headline}</Link>
                ) : (
                  b.headline
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
