import Link from "next/link";
import { listArticles } from "@/lib/data";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import type { Section } from "@/lib/taxonomy";
import { StoryCard } from "./StoryCard";
import { Pagination } from "./Pagination";
import { AdSlot } from "../site/AdSlot";

const PAGE_SIZE = 13;

export async function CategoryListing({ title, description, categories, section, activeCategory, basePath, page }: {
  title: string; description?: string; categories: string[]; section: Section; activeCategory?: string; basePath: string; page: number;
}) {
  const lang = await getLang();
  const d = t(lang);
  const { items, total } = await listArticles({ categories, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE, lang });
  const [lead, ...rest] = items;
  return (
    <div className="container-page pt-8">
      <header className="section-rule pt-4">
        <h1 className="headline text-[2.4rem] md:text-[3.2rem]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl font-serif text-lg text-muted">{description}</p>}
        {section.categories.length > 1 && (
          <nav aria-label={`${section.name} categories`} className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
            <Link href={`/${section.slug}`} aria-current={!activeCategory ? "page" : undefined} className={`whitespace-nowrap border px-3 py-1.5 text-sm font-semibold ${!activeCategory ? "border-navy-900 bg-navy-900 text-white dark:border-gold-400 dark:bg-gold-400 dark:text-navy-950" : "border-rule hover:border-fg"}`}>All {section.name}</Link>
            {section.categories.map((c) => (
              <Link key={c.slug} href={`/${section.slug}/${c.slug}`} aria-current={activeCategory === c.slug ? "page" : undefined}
                className={`whitespace-nowrap border px-3 py-1.5 text-sm font-semibold ${activeCategory === c.slug ? "border-navy-900 bg-navy-900 text-white dark:border-gold-400 dark:bg-gold-400 dark:text-navy-950" : "border-rule hover:border-fg"}`}>{c.name}</Link>
            ))}
          </nav>
        )}
      </header>

      {!lead ? (
        <div className="py-20 text-center">
          <p className="headline text-2xl">No stories here yet</p>
          <p className="mt-2 text-muted">Our reporters are working on it. In the meantime, catch up on the latest news.</p>
          <Link href="/" className="btn btn-primary mt-6">Back to the front page</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {page === 1 ? <StoryCard a={lead} minRead={d.minRead} priority /> : <StoryCard a={lead} variant="row" minRead={d.minRead} />}
            <div className="mt-10 grid gap-8 border-t border-rule pt-8">
              {rest.map((a) => <StoryCard key={a.id} a={a} variant="row" minRead={d.minRead} />)}
            </div>
            <Pagination page={page} total={total} pageSize={PAGE_SIZE} basePath={basePath} />
          </div>
          <aside className="lg:col-span-4"><div className="lg:sticky lg:top-20"><AdSlot format="rectangle" /></div></aside>
        </div>
      )}
    </div>
  );
}
