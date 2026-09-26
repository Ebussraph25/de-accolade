import Link from "next/link";
import type { ArticleCard } from "@/lib/types";
import { ArticleImage } from "./ArticleImage";
import { Byline, CategoryLink, TypeBadge } from "./Meta";

type Variant = "standard" | "compact" | "row" | "text";

export function StoryCard({
  a,
  variant = "standard",
  minRead,
  priority,
}: {
  a: ArticleCard;
  variant?: Variant;
  minRead?: string;
  priority?: boolean;
}) {
  const href = `/article/${a.slug}`;
  if (variant === "text") {
    return (
      <article className="py-3">
        <div className="mb-1 flex items-center gap-2"><CategoryLink slug={a.category} /><TypeBadge type={a.type} /></div>
        <h3 className="headline text-[1.08rem]"><Link href={href} className="story-link">{a.title}</Link></h3>
      </article>
    );
  }
  if (variant === "row") {
    return (
      <article className="grid grid-cols-[7.5rem_1fr] gap-4 sm:grid-cols-[12rem_1fr] md:gap-5">
        <Link href={href} tabIndex={-1} aria-hidden><ArticleImage src={a.featured_image} alt={a.featured_image_alt} category={a.category} sizes="200px" /></Link>
        <div>
          <div className="mb-1 flex items-center gap-2"><CategoryLink slug={a.category} /><TypeBadge type={a.type} /></div>
          <h3 className="headline text-[1.12rem] md:text-[1.3rem]"><Link href={href} className="story-link">{a.title}</Link></h3>
          {a.excerpt && <p className="mt-1.5 hidden text-[0.95rem] leading-relaxed text-muted sm:block">{a.excerpt}</p>}
          <div className="mt-2"><Byline a={a} minRead={minRead} /></div>
        </div>
      </article>
    );
  }
  if (variant === "compact") {
    return (
      <article>
        <Link href={href} tabIndex={-1} aria-hidden><ArticleImage src={a.featured_image} alt={a.featured_image_alt} category={a.category} sizes="(min-width: 1024px) 20vw, 50vw" /></Link>
        <div className="mt-2.5 mb-1 flex items-center gap-2"><CategoryLink slug={a.category} /><TypeBadge type={a.type} /></div>
        <h3 className="headline text-[1.05rem]"><Link href={href} className="story-link">{a.title}</Link></h3>
      </article>
    );
  }
  return (
    <article className="flex flex-col">
      <Link href={href} tabIndex={-1} aria-hidden><ArticleImage src={a.featured_image} alt={a.featured_image_alt} category={a.category} priority={priority} /></Link>
      <div className="mt-3 mb-1.5 flex items-center gap-2"><CategoryLink slug={a.category} /><TypeBadge type={a.type} /></div>
      <h3 className="headline text-[1.3rem]"><Link href={href} className="story-link">{a.title}</Link></h3>
      {a.excerpt && <p className="mt-2 line-clamp-3 text-[0.95rem] leading-relaxed text-muted">{a.excerpt}</p>}
      <div className="mt-3"><Byline a={a} minRead={minRead} /></div>
    </article>
  );
}
