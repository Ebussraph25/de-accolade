import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getArticle, getComments, getLiveUpdates, getRelated, getTranslations, youTubeId } from "@/lib/data";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { renderMarkdown, splitForAd } from "@/lib/markdown";
import { formatDate, formatTime, timeAgo, compact } from "@/lib/format";
import { absoluteUrl, site } from "@/lib/site";
import { categoryHref, categoryName, getCategory, getSection, languages } from "@/lib/taxonomy";
import { hasSupabase } from "@/lib/supabase/env";
import { ArticleImage } from "@/components/news/ArticleImage";
import { CategoryLink, TypeBadge } from "@/components/news/Meta";
import { StoryCard } from "@/components/news/StoryCard";
import { ShareButtons } from "@/components/news/ShareButtons";
import { ViewTracker } from "@/components/news/ViewTracker";
import { LiveRefresher } from "@/components/news/LiveRefresher";
import { YouTubeEmbed } from "@/components/news/YouTubeEmbed";
import { CommentForm } from "@/components/forms/CommentForm";
import { AdSlot } from "@/components/site/AdSlot";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await getArticle((await params).slug);
  if (!a) return { title: "Story not found" };
  const title = a.seo_title || a.title;
  const description = a.seo_description || a.excerpt || a.subtitle || site.description;
  const image = a.featured_image || `/og/${a.slug}`;
  const translations = await getTranslations(a.translation_of ?? a.id);
  return {
    title,
    description,
    keywords: a.keywords || a.tags.join(", ") || undefined,
    alternates: {
      canonical: `/article/${a.slug}`,
      languages: translations.length > 1 ? Object.fromEntries(translations.map((x) => [x.language, `/article/${x.slug}`])) : undefined,
    },
    authors: [{ name: a.author?.full_name || a.byline || "De Accolade Newsroom" }],
    openGraph: {
      type: "article",
      title,
      description,
      url: `/article/${a.slug}`,
      publishedTime: a.published_at ?? undefined,
      modifiedTime: a.updated_at,
      section: categoryName(a.category),
      tags: a.tags,
      images: [{ url: image, width: 1200, height: 630, alt: a.featured_image_alt || a.title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function ArticlePage({ params }: Props) {
  const slug = (await params).slug;
  const a = await getArticle(slug);
  if (!a) notFound();
  const lang = await getLang();
  const d = t(lang);
  const [related, comments, live, translations] = await Promise.all([
    getRelated(a, lang),
    hasSupabase ? getComments(a.id) : Promise.resolve([]),
    a.type === "live" ? getLiveUpdates(a) : Promise.resolve([]),
    getTranslations(a.translation_of ?? a.id),
  ]);
  const html = renderMarkdown(a.body);
  const [bodyA, bodyB] = splitForAd(html);
  const yt = youTubeId(a.youtube_url);
  const url = absoluteUrl(`/article/${a.slug}`);
  const authorName = a.author?.full_name || a.byline || "De Accolade Newsroom";
  const cat = getCategory(a.category);
  const section = cat ? getSection(cat.section) : undefined;
  const others = translations.filter((x) => x.slug !== a.slug);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": a.type === "live" ? "LiveBlogPosting" : "NewsArticle",
      headline: a.title.slice(0, 110),
      description: a.excerpt ?? undefined,
      image: [a.featured_image || absoluteUrl(`/og/${a.slug}`)],
      datePublished: a.published_at,
      dateModified: a.updated_at,
      inLanguage: a.language,
      articleSection: categoryName(a.category),
      keywords: a.tags.join(", ") || undefined,
      mainEntityOfPage: url,
      author: a.author?.slug
        ? { "@type": "Person", name: authorName, url: absoluteUrl(`/author/${a.author.slug}`) }
        : { "@type": "Organization", name: authorName },
      publisher: { "@type": "NewsMediaOrganization", name: site.fullName, logo: { "@type": "ImageObject", url: absoluteUrl("/icon-512.png") } },
      ...(a.type === "live" && {
        coverageStartTime: a.published_at,
        liveBlogUpdate: live.slice(0, 20).map((u) => ({ "@type": "BlogPosting", headline: u.body.slice(0, 100), datePublished: u.created_at })),
      }),
      ...(yt && { video: { "@type": "VideoObject", name: a.title, thumbnailUrl: `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`, uploadDate: a.published_at, embedUrl: `https://www.youtube.com/embed/${yt}` } }),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        ...(section ? [{ "@type": "ListItem", position: 2, name: section.name, item: absoluteUrl(`/${section.slug}`) }] : []),
        { "@type": "ListItem", position: section ? 3 : 2, name: categoryName(a.category), item: absoluteUrl(categoryHref(a.category)) },
      ],
    },
  ];

  return (
    <article className="pb-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ViewTracker slug={a.slug} />

      <header className="container-page max-w-6xl pt-8 md:pt-12">
        <div className="max-w-4xl">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
          {section && section.categories.length > 1 && (<><Link href={`/${section.slug}`} className="text-muted hover:text-fg">{section.name}</Link><span className="text-rule">/</span></>)}
          <CategoryLink slug={a.category} />
          <TypeBadge type={a.type} />
        </nav>
        <h1 className="headline mt-3 text-[2.1rem] leading-[1.08] md:text-[3.1rem]">{a.title}</h1>
        {(a.subtitle || a.excerpt) && <p className="mt-4 font-serif text-[1.25rem] leading-relaxed text-muted md:text-[1.4rem]">{a.subtitle || a.excerpt}</p>}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-rule py-4">
          <div className="text-sm">
            <p className="font-semibold">
              By {a.author?.slug ? <Link href={`/author/${a.author.slug}`} className="hover:underline">{authorName}</Link> : authorName}
            </p>
            <p className="mt-0.5 flex flex-wrap gap-x-3 text-muted">
              <time dateTime={a.published_at ?? undefined}>{formatDate(a.published_at)}, {formatTime(a.published_at!)}</time>
              {a.updated_at && a.published_at && new Date(a.updated_at).getTime() - new Date(a.published_at).getTime() > 3600_000 && <span>Updated {timeAgo(a.updated_at)}</span>}
              <span>{a.reading_minutes} {d.minRead}</span>
              {a.views > 0 && <span>{compact(a.views)} views</span>}
            </p>
          </div>
          <ShareButtons url={url} title={a.title} label={d.share} />
        </div>
        {others.length > 0 && (
          <p className="mt-3 text-sm text-muted">
            Also available in{" "}
            {others.map((o, i) => (
              <span key={o.slug}>{i > 0 && ", "}<Link href={`/article/${o.slug}`} hrefLang={o.language} className="font-semibold text-accent hover:underline">{languages.find((l) => l.code === o.language)?.native}</Link></span>
            ))}
          </p>
        )}
        </div>
      </header>

      <div className="container-page mt-8 max-w-6xl">
        {yt && a.type === "video" ? (
          <YouTubeEmbed id={yt} title={a.title} priority />
        ) : a.video_url && a.type === "video" ? (
          <video src={a.video_url} controls preload="metadata" poster={a.featured_image ?? undefined} className="aspect-video w-full bg-black" />
        ) : (
          <figure>
            <ArticleImage src={a.featured_image} alt={a.featured_image_alt || a.title} category={a.category} priority sizes="(min-width: 1024px) 1000px, 100vw" ratio="aspect-[16/9]" />
            {(a.featured_image_alt || a.image_credit) && a.featured_image && (
              <figcaption className="mt-2 text-sm text-muted">{a.featured_image_alt}{a.image_credit && <span className="ml-2 text-xs">Photo: {a.image_credit}</span>}</figcaption>
            )}
          </figure>
        )}
      </div>

      <div className="container-page mt-10 grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="w-full max-w-[42rem]">
          {a.type === "live" && (
            <section aria-label="Live updates" className="mb-10">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b-2 border-live pb-2">
                <p className="flex items-center gap-2 font-bold text-live"><span className="h-2 w-2 animate-pulse rounded-full bg-live" /> Live updates</p>
                <LiveRefresher />
              </div>
              {live.length === 0 ? <p className="text-muted">Updates will appear here as the story develops.</p> : (
                <ol className="relative border-l-2 border-rule pl-6">
                  {live.map((u) => (
                    <li key={u.id} className="relative pb-8 last:pb-0">
                      <span className="absolute -left-[1.95rem] top-1.5 h-3 w-3 rounded-full border-2 border-bg bg-live" aria-hidden />
                      <time dateTime={u.created_at} className="text-sm font-bold">{formatTime(u.created_at)} <span className="font-normal text-muted">{timeAgo(u.created_at)}</span></time>
                      <p className="mt-1 font-serif text-[1.1rem] leading-relaxed">{u.body}</p>
                      {u.image_url && <Image src={u.image_url} alt="" width={800} height={500} className="mt-3 h-auto w-full" />}
                    </li>
                  ))}
                </ol>
              )}
            </section>
          )}

          <div className={`article-body ${a.type === "live" ? "" : "dropcap"}`} dangerouslySetInnerHTML={{ __html: bodyA }} />
          {bodyB && (<><AdSlot format="inline" className="my-10" /><div className="article-body" dangerouslySetInnerHTML={{ __html: bodyB }} /></>)}

          {yt && a.type !== "video" && <div className="mt-10"><YouTubeEmbed id={yt} title={a.title} /></div>}

          {a.gallery.length > 0 && (
            <section aria-label="Photo gallery" className="mt-12">
              <h2 className="headline mb-4 text-2xl">Photo gallery</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {a.gallery.map((g, i) => (
                  <figure key={i} className={i === 0 ? "sm:col-span-2" : ""}>
                    <div className="relative aspect-[3/2] bg-surface"><Image src={g.url} alt={g.caption ?? ""} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" /></div>
                    {(g.caption || g.credit) && <figcaption className="mt-2 text-sm text-muted">{g.caption}{g.credit && <span className="ml-2 text-xs">Photo: {g.credit}</span>}</figcaption>}
                  </figure>
                ))}
              </div>
            </section>
          )}

          {a.attachments.length > 0 && (
            <section aria-label="Documents" className="mt-10 border border-rule p-5">
              <h2 className="font-semibold">Documents</h2>
              <ul className="mt-2 space-y-1.5">
                {a.attachments.map((f) => <li key={f.url}><a href={f.url} target="_blank" rel="noopener noreferrer" className="text-link underline decoration-gold-500 underline-offset-2">{f.name}</a></li>)}
              </ul>
            </section>
          )}

          {a.tags.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-2" aria-label="Tags">
              {a.tags.map((tag) => <li key={tag}><Link href={`/search?q=${encodeURIComponent(tag)}`} className="inline-block border border-rule px-2.5 py-1 text-sm hover:border-fg">{tag}</Link></li>)}
            </ul>
          )}

          <div className="mt-8 border-t border-rule pt-6"><ShareButtons url={url} title={a.title} label={d.share} /></div>

          {/* Comments */}
          <section id="comments" aria-labelledby="comments-heading" className="mt-14">
            <h2 id="comments-heading" className="section-rule headline pt-3 text-[1.6rem]">{d.comments}{comments.length > 0 && <span className="ml-2 font-sans text-base font-normal text-muted">({comments.length})</span>}</h2>
            {comments.length > 0 && (
              <ul className="mt-4 divide-y divide-rule">
                {comments.map((c) => (
                  <li key={c.id} className="py-5">
                    <p className="text-sm"><span className="font-semibold">{c.name}</span> <time className="ml-2 text-muted" dateTime={c.created_at}>{timeAgo(c.created_at)}</time></p>
                    <p className="mt-1.5 whitespace-pre-line leading-relaxed">{c.body}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6">
              {hasSupabase ? <CommentForm articleId={a.id} /> : <p className="text-muted">Comments open once the site is connected to the newsroom database.</p>}
              <p className="mt-3 text-xs text-muted">Comments are moderated. Be respectful. We remove abuse, spam and personal attacks.</p>
            </div>
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-20 grid gap-10">
            <AdSlot format="rectangle" />
            <div className="border-t-2 border-gold-500 pt-4"><NewsletterForm title={d.newsletterTitle} cta={d.subscribe} lang={lang} /></div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="container-page mt-16 max-w-6xl" aria-labelledby="related-heading">
          <h2 id="related-heading" className="section-rule headline mb-6 pt-3 text-[1.6rem]">{d.related}</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{related.map((r) => <StoryCard key={r.id} a={r} minRead={d.minRead} />)}</div>
        </section>
      )}
    </article>
  );
}
