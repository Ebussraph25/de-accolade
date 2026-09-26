import Link from "next/link";
import { requirePage } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/format";
import { moderateComment } from "../../actions";
import { ActionButton } from "@/components/admin/ActionButton";
import { Empty, PageHeader, StatusPill } from "@/components/admin/ui";

export const metadata = { title: "Comments" };

export default async function CommentsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requirePage("editor");
  const sp = await searchParams;
  const status = ["pending", "approved", "rejected", "spam"].includes(sp.status ?? "") ? sp.status! : "pending";
  const db = await serverClient();
  const { data } = await db.from("comments").select("id,name,email,body,status,created_at,article:articles(title,slug)").eq("status", status).order("created_at", { ascending: status !== "pending" ? false : true }).limit(100);
  const rows = (data ?? []) as unknown as { id: string; name: string; email: string; body: string; status: string; created_at: string; article: { title: string; slug: string } | null }[];
  return (
    <div className="max-w-4xl">
      <PageHeader title="Comments" description="Nothing appears on the site until it is approved." />
      <nav className="mb-4 flex gap-1" aria-label="Filter comments">
        {["pending", "approved", "rejected", "spam"].map((s) => (
          <Link key={s} href={`/admin/comments?status=${s}`} aria-current={s === status ? "page" : undefined} className={`px-3 py-1.5 text-sm font-semibold capitalize ${s === status ? "bg-navy-900 text-white dark:bg-gold-400 dark:text-navy-950" : "hover:bg-bg"}`}>{s === "pending" ? "To review" : s}</Link>
        ))}
      </nav>
      <div className="border border-rule bg-bg">
        {rows.length === 0 ? <Empty title={status === "pending" ? "All caught up" : "Nothing here"} body={status === "pending" ? "New comments will appear here for review." : undefined} /> : (
          <ul className="divide-y divide-rule">
            {rows.map((c) => (
              <li key={c.id} className="p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <p><span className="font-semibold">{c.name}</span> <span className="text-muted">{c.email}</span></p>
                  <p className="text-muted">{timeAgo(c.created_at)} <StatusPill status={c.status} /></p>
                </div>
                {c.article && <p className="mt-1 text-xs text-muted">On <Link href={`/article/${c.article.slug}#comments`} target="_blank" className="underline">{c.article.title}</Link></p>}
                <p className="mt-2 whitespace-pre-line">{c.body}</p>
                <div className="mt-3 flex flex-wrap gap-4">
                  {c.status !== "approved" && <ActionButton className="text-emerald-700 dark:text-emerald-400" run={moderateComment.bind(null, c.id, "approved")}>Approve</ActionButton>}
                  {c.status !== "rejected" && <ActionButton className="text-muted" run={moderateComment.bind(null, c.id, "rejected")}>Reject</ActionButton>}
                  {c.status !== "spam" && <ActionButton className="text-muted" run={moderateComment.bind(null, c.id, "spam")}>Mark as spam</ActionButton>}
                  <ActionButton className="text-live" confirmText="Delete this comment permanently?" run={moderateComment.bind(null, c.id, "delete")}>Delete</ActionButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
