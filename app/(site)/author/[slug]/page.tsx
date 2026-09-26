import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAuthor } from "@/lib/data";
import { StoryCard } from "@/components/news/StoryCard";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await getAuthor((await params).slug);
  if (!r) return { title: "Author not found" };
  return { title: r.author.full_name, description: r.author.bio ?? `Stories by ${r.author.full_name} on De Accolade.`, alternates: { canonical: `/author/${r.author.slug}` } };
}

export default async function AuthorPage({ params }: Props) {
  const r = await getAuthor((await params).slug);
  if (!r) notFound();
  const { author, articles } = r;
  return (
    <div className="container-page max-w-5xl pt-10">
      <header className="section-rule flex items-center gap-5 pt-5">
        {author.avatar_url ? (
          <Image src={author.avatar_url} alt="" width={88} height={88} className="h-22 w-22 rounded-full object-cover" />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-navy-900 font-serif text-3xl text-gold-400">{author.full_name.charAt(0)}</span>
        )}
        <div>
          <h1 className="headline text-[2.2rem]">{author.full_name}</h1>
          {author.bio && <p className="mt-1 max-w-2xl text-muted">{author.bio}</p>}
        </div>
      </header>
      <div className="mt-10 grid gap-8">
        {articles.length ? articles.map((a) => <StoryCard key={a.id} a={a} variant="row" />) : <p className="text-muted">No published stories yet.</p>}
      </div>
    </div>
  );
}
