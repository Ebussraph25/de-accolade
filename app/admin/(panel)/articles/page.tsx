import Link from "next/link";
import { requirePage } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";
import { categoryName, languages } from "@/lib/taxonomy";
import { formatDate, compact } from "@/lib/format";
import { Empty, Notice, PageHeader, StatusPill } from "@/components/admin/ui";

export const metadata = { title: "Stories" };
const PAGE = 25;

export default async function ArticlesList({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string; deleted?: string }> }) {
  const staff = await requirePage();
  const sp = await searchParams;
  const db = await serverClient();
  const page = Math.max(1, Number(sp.page) || 1);
  const status = ["draft", "pending", "published", "archived"].includes(sp.status ?? "") ? sp.status : undefined;
  let q = db.from("articles").select("id,title,slug,status,category,language,views,published_at,updated_at,type,featured,author:profiles(full_name)", { count: "exact" });
  if (staff.role === "reporter") q = q.eq("author_id", staff.id);
  if (status) q = q.eq("status", status);
  if (sp.q) q = q.ilike("title", `%${sp.q.replace(/[%_,()]/g, "").slice(0, 80)}%`);
  const { data, count } = await q.order("updated_at", { ascending: false }).range((page - 1) * PAGE, page * PAGE - 1);
  const rows = (data ?? []) as unknown as { id: string; title: string; slug: string; status: string; category: string; language: string; views: number; published_at: string | null; updated_at: string; type: string; featured: boolean; author: { full_name: string } | null }[];
  const pages = Math.ceil((count ?? 0) / PAGE);
  const tabs = [{ v: undefined, l: "All" }, { v: "published", l: "Published" }, { v: "pending", l: "In review" }, { v: "draft", l: "Drafts" }, { v: "archived", l: "Archived" }];
  const qs = (o: Record<string, string | undefined>) => "?" + new URLSearchParams(Object.entries({ status, q: sp.q, ...o }).filter(([, v]) => v) as [string, string][]).toString();

  return (
    <div className="max-w-6xl">
      {sp.deleted && <Notice>Story deleted.</Notice>}
      <PageHeader title={staff.role === "reporter" ? "My stories" : "Stories"} action={<Link href="/admin/articles/new" className="btn btn-primary">Write a story</Link>} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-1" aria-label="Filter by status">
          {tabs.map((t) => (
            <Link key={t.l} href={`/admin/articles${qs({ status: t.v, page: undefined })}`} aria-current={status === t.v ? "page" : undefined}
              className={`px-3 py-1.5 text-sm font-semibold ${status === t.v ? "bg-navy-900 text-white dark:bg-gold-400 dark:text-navy-950" : "hover:bg-bg"}`}>{t.l}</Link>
          ))}
        </nav>
        <form className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <label htmlFor="aq" className="sr-only">Search headlines</label>
          <input id="aq" name="q" defaultValue={sp.q} placeholder="Search headlines" className="field w-56 py-1.5" />
          <button className="btn btn-ghost py-1.5">Search</button>
        </form>
      </div>
      <div className="overflow-x-auto border border-rule bg-bg">
        {rows.length === 0 ? <Empty title="No stories found" body={sp.q || status ? "Try another filter." : "Start with your first story."} href="/admin/articles/new" cta="Write a story" /> : (
          <table className="w-full min-w-[46rem] text-sm">
            <thead className="border-b border-rule text-left text-muted">
              <tr><th className="px-4 py-2.5 font-medium">Headline</th><th className="px-3 font-medium">Status</th><th className="px-3 font-medium">Category</th><th className="px-3 font-medium">Author</th><th className="px-3 font-medium">Date</th><th className="px-3 text-right font-medium">Views</th></tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {rows.map((a) => (
                <tr key={a.id} className="hover:bg-surface">
                  <td className="max-w-md px-4 py-3">
                    <Link href={`/admin/articles/${a.id}`} className="font-semibold hover:underline">{a.title}</Link>
                    <p className="mt-0.5 text-xs text-muted">{a.type !== "article" && <span className="mr-2 capitalize">{a.type}</span>}{a.language !== "en" && <span className="mr-2">{languages.find((l) => l.code === a.language)?.native}</span>}{a.featured && <span className="text-accent">Front-page lead</span>}</p>
                  </td>
                  <td className="px-3"><StatusPill status={a.status} /></td>
                  <td className="px-3">{categoryName(a.category)}</td>
                  <td className="px-3 text-muted">{a.author?.full_name ?? "—"}</td>
                  <td className="whitespace-nowrap px-3 text-muted">{formatDate(a.published_at ?? a.updated_at, { month: "short" })}</td>
                  <td className="px-3 text-right tabular-nums">{compact(a.views)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          {page > 1 ? <Link className="btn btn-ghost py-1.5" href={`/admin/articles${qs({ page: String(page - 1) })}`}>Previous</Link> : <span />}
          <span className="text-muted">Page {page} of {pages}</span>
          {page < pages ? <Link className="btn btn-ghost py-1.5" href={`/admin/articles${qs({ page: String(page + 1) })}`}>Next</Link> : <span />}
        </div>
      )}
    </div>
  );
}
