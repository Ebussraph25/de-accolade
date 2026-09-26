import { renderOg } from "@/lib/og";
import { getArticle } from "@/lib/data";
import { categoryName } from "@/lib/taxonomy";

/** Generated share card for stories without a featured photo. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const a = await getArticle((await params).slug);
  const res = await renderOg({ kicker: a ? categoryName(a.category) : "Magazine", title: a?.title ?? "De Accolade Magazine" });
  res.headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
  return res;
}
