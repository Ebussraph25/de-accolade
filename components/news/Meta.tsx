import Link from "next/link";
import { categoryHref, categoryName } from "@/lib/taxonomy";
import { timeAgo } from "@/lib/format";
import type { ArticleCard } from "@/lib/types";

export function CategoryLink({ slug, className = "" }: { slug: string; className?: string }) {
  return (
    <Link href={categoryHref(slug)} className={`text-[0.8125rem] font-semibold text-accent hover:underline ${className}`}>
      {categoryName(slug)}
    </Link>
  );
}

export function TypeBadge({ type }: { type: ArticleCard["type"] }) {
  if (type === "live")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-sm bg-live px-1.5 py-0.5 text-[0.7rem] font-bold text-white">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Live
      </span>
    );
  if (type === "video")
    return <span className="rounded-sm bg-navy-900 px-1.5 py-0.5 text-[0.7rem] font-semibold text-white dark:bg-gold-400 dark:text-navy-950">Video</span>;
  if (type === "gallery")
    return <span className="rounded-sm border border-rule px-1.5 py-0.5 text-[0.7rem] font-semibold text-muted">Photos</span>;
  return null;
}

export function Byline({ a, minRead = "min read" }: { a: ArticleCard; minRead?: string }) {
  const name = a.author?.full_name || a.byline || "De Accolade Newsroom";
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-muted">
      <span className="font-medium text-fg/80">{name}</span>
      <time dateTime={a.published_at ?? undefined}>{timeAgo(a.published_at)}</time>
      <span>{a.reading_minutes} {minRead}</span>
    </p>
  );
}
