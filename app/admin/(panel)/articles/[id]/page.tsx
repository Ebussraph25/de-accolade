import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePage } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";
import { site } from "@/lib/site";
import type { Article, LiveUpdate } from "@/lib/types";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { LiveUpdatesPanel } from "@/components/admin/LiveUpdatesPanel";
import { Notice, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Edit story" };

export default async function EditArticle({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const staff = await requirePage();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = await serverClient();
  const { data: article } = await db.from("articles").select("*").eq("id", id).maybeSingle();
  if (!article) notFound();
  const a = article as Article;
  const readOnly = staff.role === "reporter" && (a.author_id !== staff.id || !["draft", "pending"].includes(a.status));
  const [{ data: originals }, { data: live }] = await Promise.all([
    db.from("articles").select("id,title").is("translation_of", null).eq("status", "published").order("published_at", { ascending: false }).limit(200),
    a.type === "live" ? db.from("live_updates").select("id,body,image_url,created_at").eq("article_id", id).order("created_at", { ascending: false }) : Promise.resolve({ data: [] }),
  ]);
  return (
    <div className="max-w-7xl">
      <PageHeader title="Edit story" action={<Link href="/admin/articles" className="text-sm text-accent hover:underline">Back to stories</Link>} />
      {readOnly ? (
        <Notice tone="error">This story has been {a.status === "published" ? "published" : "moved on"} and can now only be changed by an editor.</Notice>
      ) : (
        <ArticleEditor article={a} role={staff.role} originals={originals ?? []} siteUrl={site.url.replace(/^https?:\/\//, "")} saved={(await searchParams).saved === "1"} />
      )}
      {a.type === "live" && staff.role !== "reporter" && <LiveUpdatesPanel articleId={a.id} updates={(live ?? []) as LiveUpdate[]} />}
    </div>
  );
}
