import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSection, sections } from "@/lib/taxonomy";
import { CategoryListing } from "@/components/news/CategoryListing";

type Props = { params: Promise<{ section: string }>; searchParams: Promise<{ page?: string }> };

export function generateStaticParams() {
  return sections.map((s) => ({ section: s.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = getSection((await params).section);
  if (!s) return {};
  return { title: s.name, description: s.description, alternates: { canonical: `/${s.slug}` } };
}

export default async function SectionPage({ params, searchParams }: Props) {
  const s = getSection((await params).section);
  if (!s) notFound();
  const page = Math.max(1, Number((await searchParams).page) || 1);
  return <CategoryListing title={s.name} description={s.description} section={s} categories={s.categories.map((c) => c.slug)} basePath={`/${s.slug}`} page={page} />;
}
