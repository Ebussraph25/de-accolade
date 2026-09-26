import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/data";
import { absoluteUrl } from "@/lib/site";
import { sections } from "@/lib/taxonomy";

export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPaths = ["/", "/video", "/event-coverage", "/advertise", "/about", "/contact", "/privacy", "/terms"];
  const sectionPaths = sections.flatMap((s) => [`/${s.slug}`, ...(s.categories.length > 1 ? s.categories.map((c) => `/${s.slug}/${c.slug}`) : [])]);
  const articles = await getSitemapEntries().catch(() => []);
  return [
    ...staticPaths.map((p) => ({ url: absoluteUrl(p), lastModified: now, changeFrequency: p === "/" ? ("hourly" as const) : ("monthly" as const), priority: p === "/" ? 1 : 0.5 })),
    ...sectionPaths.map((p) => ({ url: absoluteUrl(p), lastModified: now, changeFrequency: "hourly" as const, priority: 0.7 })),
    ...articles.map((a) => ({ url: absoluteUrl(`/article/${a.slug}`), lastModified: new Date(a.updated_at), changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
