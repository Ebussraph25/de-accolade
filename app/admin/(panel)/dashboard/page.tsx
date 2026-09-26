import Link from "next/link";
import { requirePage } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";
import { categoryName, languages } from "@/lib/taxonomy";
import { compact, daysAgoIso, timeAgo } from "@/lib/format";
import { Notice, PageHeader, Panel, StatusPill } from "@/components/admin/ui";

export const metadata = { title: "Dashboard" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const staff = await requirePage();
  const sp = await searchParams;
  const db = await serverClient();
  const isEditor = staff.role !== "reporter";
  const weekAgo = daysAgoIso(7);
  const scoped = <T,>(q: T) => (isEditor ? q : (q as unknown as { eq: (c: string, v: string) => T }).eq("author_id", staff.id));

  const count = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0;
  const [published, pending, drafts, thisWeek, subscribers, pendingComments, topRes, recentRes, catRes] = await Promise.all([
    count(scoped(db.from("articles").select("id", { count: "exact", head: true })).eq("status", "published")),
    count(scoped(db.from("articles").select("id", { count: "exact", head: true })).eq("status", "pending")),
    count(scoped(db.from("articles").select("id", { count: "exact", head: true })).eq("status", "draft")),
    count(scoped(db.from("articles").select("id", { count: "exact", head: true })).eq("status", "published").gte("published_at", weekAgo)),
    isEditor ? count(db.from("subscribers").select("id", { count: "exact", head: true })) : Promise.resolve(0),
    isEditor ? count(db.from("comments").select("id", { count: "exact", head: true }).eq("status", "pending")) : Promise.resolve(0),
    scoped(db.from("articles").select("id,title,slug,views,category,language")).eq("status", "published").order("views", { ascending: false }).limit(8),
    scoped(db.from("articles").select("id,title,status,updated_at")).order("updated_at", { ascending: false }).limit(6),
    db.from("articles").select("category,language,views").eq("status", "published").limit(5000),
  ]);

  const top = (topRes.data ?? []) as { id: string; title: string; slug: string; views: number; category: string }[];
  const recent = (recentRes.data ?? []) as { id: string; title: string; status: string; updated_at: string }[];
  const rows = (catRes.data ?? []) as { category: string; language: string; views: number }[];
  const byCat = Object.entries(rows.reduce<Record<string, number>>((m, r) => ((m[r.category] = (m[r.category] ?? 0) + r.views), m), {})).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const byLang = languages.map((l) => ({ ...l, n: rows.filter((r) => r.language === l.code).length }));
  const maxCat = Math.max(1, ...byCat.map(([, v]) => v));

  const stats = [
    { label: "Published stories", value: published },
    { label: "Published this week", value: thisWeek },
    { label: "Awaiting review", value: pending, href: "/admin/articles?status=pending" },
    { label: "Drafts", value: drafts, href: "/admin/articles?status=draft" },
    ...(isEditor ? [
      { label: "Newsletter subscribers", value: subscribers, href: "/admin/inbox?tab=subscribers" },
      { label: "Comments to moderate", value: pendingComments, href: "/admin/comments" },
    ] : []),
  ];

  return (
    <div className="max-w-6xl">
      {sp.error === "permission" && <Notice tone="error">You don&apos;t have permission to open that page.</Notice>}
      {published === 0 && isEditor && (
        <Notice>
          The public site is showing sample stories until the first real story is published. They disappear automatically the moment you publish one, and they are never shown to Google.
        </Notice>
      )}
      <PageHeader title={`Welcome, ${staff.full_name.split(" ")[0] || "editor"}`} description={isEditor ? "Here's what's happening in the newsroom." : "Your stories and their progress."}
        action={<Link href="/admin/articles/new" className="btn btn-primary">Write a story</Link>} />

      <dl className="grid grid-cols-2 gap-px border border-rule bg-rule md:grid-cols-3">
        {stats.map((s) => {
          const inner = (<><dt className="text-sm text-muted">{s.label}</dt><dd className="mt-1 font-serif text-3xl font-semibold">{compact(s.value)}</dd></>);
          return s.href ? <Link key={s.label} href={s.href} className="bg-bg p-5 hover:bg-surface">{inner}</Link> : <div key={s.label} className="bg-bg p-5">{inner}</div>;
        })}
      </dl>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Most read stories">
          {top.length === 0 ? <p className="text-sm text-muted">Views appear once stories are published and read.</p> : (
            <ol className="space-y-3">
              {top.map((a, i) => (
                <li key={a.id} className="grid grid-cols-[1.5rem_1fr_auto] items-baseline gap-2">
                  <span className="font-serif font-semibold text-gold-600">{i + 1}</span>
                  <Link href={`/admin/articles/${a.id}`} className="truncate hover:underline">{a.title}</Link>
                  <span className="text-sm tabular-nums text-muted">{compact(a.views)}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <Panel title="Recently edited" action={<Link href="/admin/articles" className="text-sm text-accent hover:underline">All stories</Link>}>
          {recent.length === 0 ? <p className="text-sm text-muted">Nothing yet. Write your first story.</p> : (
            <ul className="divide-y divide-rule">
              {recent.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={`/admin/articles/${a.id}`} className="truncate hover:underline">{a.title}</Link>
                  <span className="flex shrink-0 items-center gap-2 text-xs text-muted"><StatusPill status={a.status} />{timeAgo(a.updated_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Views by category">
          {byCat.length === 0 ? <p className="text-sm text-muted">No data yet.</p> : (
            <ul className="space-y-2.5">
              {byCat.map(([cat, v]) => (
                <li key={cat}>
                  <div className="flex justify-between text-sm"><span>{categoryName(cat)}</span><span className="tabular-nums text-muted">{compact(v)}</span></div>
                  <div className="mt-1 h-2 bg-surface"><div className="h-2 bg-navy-700 dark:bg-gold-400" style={{ width: `${(v / maxCat) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Stories by language">
          <ul className="grid grid-cols-2 gap-4">
            {byLang.map((l) => (<li key={l.code}><p className="text-sm text-muted">{l.native}</p><p className="font-serif text-2xl font-semibold">{l.n}</p></li>))}
          </ul>
          <p className="mt-4 text-xs text-muted">Visitor numbers, locations and returning readers are in Vercel Analytics and Google Analytics 4.</p>
        </Panel>
      </div>
    </div>
  );
}
