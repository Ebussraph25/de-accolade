import Link from "next/link";
import { site } from "@/lib/site";
import { sections, type LangCode } from "@/lib/taxonomy";
import { t } from "@/lib/i18n";
import { todayLong } from "@/lib/format";
import { Wordmark } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSelect } from "./LanguageSelect";
import { SearchDialog } from "./SearchDialog";
import { MobileNav, type NavGroup } from "./MobileNav";
import { ChevronDown } from "./Icons";
import { SocialLinks } from "./SocialLinks";

export function buildNav(lang: LangCode): NavGroup[] {
  const d = t(lang);
  const sec = (slug: string) => sections.find((s) => s.slug === slug)!;
  const withKids = (slug: string, label: string): NavGroup => ({
    href: `/${slug}`,
    label,
    children: sec(slug).categories.map((c) => ({ href: `/${slug}/${c.slug}`, label: c.name })),
  });
  return [
    { href: "/", label: d.home },
    withKids("news", d.news),
    withKids("culture", d.culture),
    withKids("entertainment", d.entertainment),
    { href: "/sports", label: d.sports },
    { href: "/video", label: d.video },
    { href: "/interviews", label: d.interviews },
    { href: "/event-coverage", label: d.events },
    { href: "/about", label: d.about },
    { href: "/contact", label: d.contact },
  ];
}

export function Header({ lang }: { lang: LangCode }) {
  const nav = buildNav(lang);
  return (
    <header>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-gold-500 focus:p-3 focus:text-navy-950">Skip to content</a>
      {/* Utility bar */}
      <div className="bg-navy-900 text-[0.8125rem] text-white/85 dark:bg-navy-950">
        <div className="container-page flex h-10 items-center justify-between gap-4">
          <p className="truncate"><time suppressHydrationWarning>{todayLong()}</time></p>
          <div className="flex items-center gap-4">
            <SocialLinks className="hidden items-center gap-3 md:flex" />
            <span className="hidden h-4 w-px bg-white/25 md:block" />
            <LanguageSelect current={lang} />
            <ThemeToggle className="hover:text-gold-400" />
          </div>
        </div>
      </div>

      {/* Masthead */}
      <div className="border-b border-rule">
        <div className="container-page flex items-center justify-between py-4 md:justify-center md:py-7">
          <Link href="/" aria-label={`${site.fullName} home`} className="text-navy-900 dark:text-white">
            <Wordmark />
          </Link>
          <div className="flex items-center md:hidden">
            <SearchDialog label={t(lang).search} />
            <MobileNav groups={nav} />
          </div>
        </div>
      </div>

      {/* Primary navigation */}
      <nav aria-label="Primary" className="sticky top-0 z-40 hidden border-b border-rule bg-bg/95 backdrop-blur md:block">
        <div className="container-page flex h-12 items-center justify-between">
          <ul className="no-scrollbar flex items-center gap-0.5 overflow-x-auto text-[0.9rem] font-semibold lg:overflow-visible">
            {nav.map((g) => (
              <li key={g.href} className="group relative">
                <Link href={g.href} className="flex items-center gap-1 whitespace-nowrap px-2.5 py-3 hover:text-accent">
                  {g.label}
                  {g.children && <ChevronDown className="hidden h-3.5 w-3.5 opacity-60 lg:block" />}
                </Link>
                {g.children && (
                  <div className="invisible absolute left-0 top-full z-50 hidden min-w-56 border-t-2 border-gold-500 bg-bg py-2 opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100 lg:block">
                    <ul>
                      {g.children.map((c) => (
                        <li key={c.href}><Link href={c.href} className="block px-4 py-2 font-medium hover:bg-surface hover:text-accent">{c.label}</Link></li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className="flex items-center">
            <SearchDialog label={t(lang).search} />
          </div>
        </div>
      </nav>
    </header>
  );
}
