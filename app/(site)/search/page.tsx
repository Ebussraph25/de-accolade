import type { Metadata } from "next";
import Link from "next/link";
import { searchArticles, SEARCH_PAGE_SIZE } from "@/lib/data";
import { allCategories, articleTypes, languages, sections } from "@/lib/taxonomy";
import { StoryCard } from "@/components/news/StoryCard";
import { Pagination } from "@/components/news/Pagination";

export const metadata: Metadata = { title: "Search", robots: { index: false, follow: true } };

type SP = { q?: string; category?: string; language?: string; type?: string; from?: string; to?: string; page?: string };
const clean = (v: string | undefined, re: RegExp) => (v && re.test(v) ? v : undefined);

export default async function SearchPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const params = {
    q: sp.q?.slice(0, 120),
    category: allCategories.some((c) => c.slug === sp.category) ? sp.category : undefined,
    language: languages.some((l) => l.code === sp.language) ? sp.language : undefined,
    type: articleTypes.some((t) => t.value === sp.type) ? sp.type : undefined,
    from: clean(sp.from, /^\d{4}-\d{2}-\d{2}$/),
    to: clean(sp.to, /^\d{4}-\d{2}-\d{2}$/),
  };
  const page = Math.max(1, Number(sp.page) || 1);
  const hasQuery = Object.values(params).some(Boolean);
  const res = hasQuery ? await searchArticles({ ...params, page }) : null;

  return (
    <div className="container-page pt-8">
      <h1 className="section-rule headline pt-4 text-[2.4rem] md:text-[3rem]">Search</h1>
      <form role="search" action="/search" className="mt-6 grid gap-4 border border-rule bg-surface p-5">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="q" className="sr-only">Search terms</label>
          <input id="q" name="q" defaultValue={params.q} placeholder="Search articles, videos, authors, places…" className="field flex-1 font-serif text-lg" />
          <button className="btn btn-primary">Search</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="label" htmlFor="category">Category</label>
            <select id="category" name="category" defaultValue={params.category ?? ""} className="field">
              <option value="">All categories</option>
              {sections.map((s) => (<optgroup key={s.slug} label={s.name}>{s.categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</optgroup>))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="language">Language</label>
            <select id="language" name="language" defaultValue={params.language ?? ""} className="field">
              <option value="">Any language</option>
              {languages.map((l) => <option key={l.code} value={l.code}>{l.native}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="type">Media type</label>
            <select id="type" name="type" defaultValue={params.type ?? ""} className="field">
              <option value="">All types</option>
              {articleTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div><label className="label" htmlFor="from">From</label><input id="from" name="from" type="date" defaultValue={params.from} className="field" /></div>
          <div><label className="label" htmlFor="to">To</label><input id="to" name="to" type="date" defaultValue={params.to} className="field" /></div>
        </div>
      </form>

      {!res ? (
        <p className="py-16 text-center text-muted">Enter a search term or choose a filter to find stories.</p>
      ) : (
        <div className="mt-8">
          <p className="text-sm text-muted" role="status">{res.total === 0 ? "No stories match your search." : `${res.total} ${res.total === 1 ? "story" : "stories"} found`}{params.q && <> for <strong className="text-fg">“{params.q}”</strong></>}</p>
          {res.authors.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold">Authors:</span>
              {res.authors.map((a) => <Link key={a.slug} href={`/author/${a.slug}`} className="border border-rule px-2.5 py-1 hover:border-fg">{a.full_name}</Link>)}
            </div>
          )}
          {res.total === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted">Try fewer words, check the spelling, or remove a filter.</p>
              <Link href="/search" className="btn btn-ghost mt-4">Clear filters</Link>
            </div>
          ) : (
            <div className="mt-6 grid max-w-4xl gap-8">{res.items.map((a) => <StoryCard key={a.id} a={a} variant="row" />)}</div>
          )}
          <Pagination page={page} total={res.total} pageSize={SEARCH_PAGE_SIZE} basePath="/search" query={{ ...params }} />
        </div>
      )}
    </div>
  );
}
