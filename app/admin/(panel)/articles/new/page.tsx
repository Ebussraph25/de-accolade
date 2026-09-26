import Link from "next/link";
import { requirePage } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";
import { site } from "@/lib/site";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Write a story" };

export default async function NewArticle() {
  const staff = await requirePage();
  const db = await serverClient();
  const { data } = await db.from("articles").select("id,title").is("translation_of", null).eq("status", "published").order("published_at", { ascending: false }).limit(200);
  return (
    <div className="max-w-7xl">
      <PageHeader title="Write a story" action={<Link href="/admin/articles" className="text-sm text-accent hover:underline">Back to stories</Link>} />
      <ArticleEditor role={staff.role} originals={data ?? []} siteUrl={site.url.replace(/^https?:\/\//, "")} />
    </div>
  );
}
