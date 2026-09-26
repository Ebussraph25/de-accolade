import Link from "next/link";

export function SectionHeading({ title, href, linkLabel = "See all", as: Tag = "h2", className = "" }: { title: string; href?: string; linkLabel?: string; as?: "h1" | "h2"; className?: string }) {
  return (
    <div className={`section-rule mb-6 flex items-baseline justify-between gap-4 pt-3 ${className}`}>
      <Tag className="headline text-[1.6rem] md:text-[1.85rem]">{title}</Tag>
      {href && <Link href={href} className="shrink-0 text-sm font-semibold text-accent hover:underline">{linkLabel}</Link>}
    </div>
  );
}
