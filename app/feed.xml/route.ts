import { getSitemapEntries } from "@/lib/data";
import { absoluteUrl, site } from "@/lib/site";
import { categoryName } from "@/lib/taxonomy";
import { xmlEscape } from "@/lib/xml";

export const revalidate = 600;

export async function GET() {
  const items = (await getSitemapEntries().catch(() => [])).slice(0, 50);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${xmlEscape(site.fullName)}</title>
  <link>${site.url}</link>
  <description>${xmlEscape(site.description)}</description>
  <language>en-ng</language>
  <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml" />
${items
  .map(
    (a) => `  <item>
    <title>${xmlEscape(a.title)}</title>
    <link>${absoluteUrl(`/article/${a.slug}`)}</link>
    <guid isPermaLink="true">${absoluteUrl(`/article/${a.slug}`)}</guid>
    <pubDate>${new Date(a.published_at).toUTCString()}</pubDate>
    <category>${xmlEscape(categoryName(a.category))}</category>
    ${a.excerpt ? `<description>${xmlEscape(a.excerpt)}</description>` : ""}
  </item>`,
  )
  .join("\n")}
</channel>
</rss>`;
  return new Response(body, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=600" } });
}
