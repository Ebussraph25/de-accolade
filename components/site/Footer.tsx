import Link from "next/link";
import { site } from "@/lib/site";
import { sections } from "@/lib/taxonomy";
import { Wordmark } from "./Logo";
import { FollowUs } from "./SocialLinks";

export function Footer() {
  const year = new Date().getFullYear();
  const col = (title: string, links: { href: string; label: string }[]) => (
    <div>
      <h2 className="mb-3 font-serif text-lg font-semibold text-gold-400">{title}</h2>
      <ul className="space-y-2 text-[0.9rem]">
        {links.map((l) => (<li key={l.href}><Link href={l.href} className="text-white/80 hover:text-white hover:underline">{l.label}</Link></li>))}
      </ul>
    </div>
  );
  return (
    <footer className="mt-20 bg-navy-900 text-white dark:bg-navy-950">
      <div className="h-1 bg-gold-500" />
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" aria-label="De Accolade Magazine Hub home" className="text-white"><Wordmark size="sm" tone="onDark" /></Link>
          <p className="mt-4 max-w-sm font-serif text-lg italic text-white/90">{site.tagline}</p>
          <p className="mt-3 max-w-sm text-[0.9rem] leading-relaxed text-white/70">{site.parentLine}. Community journalism, culture and heritage from Nigeria and the diaspora.</p>
          {site.contactPhone && <p className="mt-3 text-[0.9rem] text-white/80">Call: <a href={`tel:${site.contactPhone.replace(/[^\d+]/g, "")}`} className="font-semibold text-white hover:text-gold-400">{site.contactPhone}</a></p>}
        </div>
        {col("Sections", [
          ...sections.map((s) => ({ href: s.slug === "events" ? "/events" : `/${s.slug}`, label: s.name })),
          { href: "/video", label: "Video" },
        ])}
        {col("Culture", [
          { href: "/culture/igbo-heritage", label: "Igbo Heritage" },
          { href: "/culture/yoruba-heritage", label: "Yoruba Heritage" },
          { href: "/culture/hausa-heritage", label: "Hausa Heritage" },
          { href: "/culture/traditional-events", label: "Traditional Events" },
        ])}
        {col("De Accolade Magazine Hub", [
          { href: "/about", label: "About us" },
          { href: "/contact", label: "Contact the newsroom" },
          { href: "/event-coverage", label: "Book event coverage" },
          { href: "/advertise", label: "Advertise with us" },
          { href: "/feed.xml", label: "RSS feed" },
          { href: "/privacy", label: "Privacy policy" },
          { href: "/terms", label: "Terms of use" },
        ])}
      </div>
      <FollowUs />
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-[0.8125rem] text-white/60 md:flex-row md:justify-between">
          <p>© {year} {site.fullName}. A subsidiary of {site.parent}. All rights reserved.</p>
          <p><Link href="/admin/login" className="hover:text-white">Newsroom login</Link></p>
        </div>
      </div>
    </footer>
  );
}
