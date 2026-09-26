import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSection, sections } from "@/lib/taxonomy";
import { CategoryListing } from "@/components/news/CategoryListing";

type Props = { params: Promise<{ section: string; category: string }>; searchParams: Promise<{ page?: string }> };

export function generateStaticParams() {
  return sections.filter((s) => s.categories.length > 1).flatMap((s) => s.categories.map((c) => ({ section: s.slug, category: c.slug })));
}
export const dynamicParams = false;

function resolve(sectionSlug: string, categorySlug: string) {
  const s = getSection(sectionSlug);
  const c = s?.categories.find((x) => x.slug === categorySlug);
  return s && c && s.categories.length > 1 ? { s, c } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const r = resolve(p.section, p.category);
  if (!r) return {};
  return { title: `${r.c.name} | ${r.s.name}`, description: `${r.c.name} stories from De Accolade Magazine.`, alternates: { canonical: `/${r.s.slug}/${r.c.slug}` } };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const p = await params;
  const r = resolve(p.section, p.category);
  if (!r) notFound();
  const page = Math.max(1, Number((await searchParams).page) || 1);
  return <CategoryListing title={r.c.name} section={r.s} activeCategory={r.c.slug} categories={[r.c.slug]} basePath={`/${r.s.slug}/${r.c.slug}`} page={page} />;
}
