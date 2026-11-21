import Link from "next/link";
import { getLiveAdverts, type LiveAdvert } from "@/lib/data";
import type { AdPlacement } from "@/lib/ads";

function pick(list: LiveAdvert[]) {
  return list.length ? list[Math.floor(Math.random() * list.length)] : undefined;
}

/**
 * Advertisement placement (PRD §15). Shows a live advert from the newsroom's advert manager for this
 * placement (rotating at random when there are several), or a house ad inviting advertisers.
 */
export async function AdSlot({ format = "leaderboard", className = "" }: { format?: AdPlacement; className?: string }) {
  const ads = await getLiveAdverts().catch(() => [] as LiveAdvert[]);
  const ad = pick(ads.filter((a) => a.placement === format));
  const size =
    format === "rectangle" ? "min-h-[250px]" : format === "inline" ? "min-h-[120px]" : "min-h-[100px] md:min-h-[110px]";

  if (ad) {
    const img = (
      // Advertiser artwork is shown as supplied, at its own proportions.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={ad.image_url} alt={ad.alt_text || `Advertisement: ${ad.advertiser}`} loading="lazy" decoding="async" className="mx-auto block h-auto w-full max-w-full" />
    );
    const external = ad.link && /^https?:\/\//.test(ad.link);
    return (
      <aside aria-label="Advertisement" className={`no-print ${className}`}>
        <p className="mb-1 text-center text-[0.7rem] text-muted">Advertisement</p>
        {ad.link ? (
          external ? (
            <a href={ad.link} target="_blank" rel="sponsored noopener noreferrer" className="block">{img}</a>
          ) : (
            <Link href={ad.link} className="block">{img}</Link>
          )
        ) : img}
      </aside>
    );
  }

  return (
    <aside aria-label="Advertisement" className={`no-print ${className}`}>
      <p className="mb-1 text-center text-[0.7rem] text-muted">Advertisement</p>
      <Link
        href="/advertise"
        className={`flex ${size} flex-col items-center justify-center gap-1 border border-dashed border-gold-500/60 bg-gold-100/40 px-4 text-center dark:bg-navy-900/40`}
      >
        <span className="font-serif text-lg font-semibold text-navy-900 dark:text-gold-400">Reach the De Accolade Magazine Hub community</span>
        <span className="text-sm text-muted">Banner, sponsored story and event packages. See advertising options.</span>
      </Link>
    </aside>
  );
}
