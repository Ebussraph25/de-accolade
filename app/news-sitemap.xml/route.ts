import { getSitemapEntries } from "@/lib/data";
import { absoluteUrl, site } from "@/lib/site";
import { xmlEscape } from "@/lib/xml";

export const revalidate = 600;

/** Google News sitemap: only stories from the last 48 hours, per Google's guidelines. */
export async function GET() {
  const cutoff = Date.now() - 48 * 3600_000;
  const recent = (await getSitemapEntries().catch(() => [])).filter((a) => new Date(a.published_at).getTime() >= cutoff).slice(0, 1000);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recent
  .map(
    (a) => `  <url>
    <loc>${absoluteUrl(`/article/${a.slug}`)}</loc>
    <news:news>
      <news:publication><news:name>${xmlEscape(site.fullName)}</news:name><news:language>${a.language}</news:language></news:publication>
      <news:publication_date>${new Date(a.published_at).toISOString()}</news:publication_date>
      <news:title>${xmlEscape(a.title)}</news:title>
    </news:news>
  </url>`,
  )
  .join("\n")}
</urlset>`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=600" } });
}
