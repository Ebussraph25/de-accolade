import Link from "next/link";
import { getHomepage, getTrending, getYouTubeVideos } from "@/lib/data";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { heritage } from "@/lib/taxonomy";
import { site, absoluteUrl } from "@/lib/site";
import { ArticleImage } from "@/components/news/ArticleImage";
import { Byline, CategoryLink, TypeBadge } from "@/components/news/Meta";
import { StoryCard } from "@/components/news/StoryCard";
import { VideoDesk } from "@/components/news/VideoDesk";
import { AdSlot } from "@/components/site/AdSlot";
import { SectionHeading } from "@/components/site/SectionHeading";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { BrandMark } from "@/components/site/Logo";

export default async function HomePage() {
  const lang = await getLang();
  const d = t(lang);
  const [home, trending, channel] = await Promise.all([getHomepage(lang), getTrending(lang, 5), getYouTubeVideos(5)]);
  const { hero, latest, community, interviews, videos, culture } = home;
  const secondary = latest.slice(0, 3);
  const feed = latest.slice(3, 9);
  const more = latest.slice(9);

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: site.fullName,
    alternateName: site.name,
    url: site.url,
    logo: absoluteUrl("/icon-512.png"),
    slogan: site.tagline,
    parentOrganization: { "@type": "Organization", name: site.parent },
    sameAs: Object.values(site.social).filter(Boolean),
  };

  if (!hero) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="headline text-4xl">Stories are on their way</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">The newsroom hasn&apos;t published anything yet. Editors can sign in to publish the first story.</p>
        <Link href="/admin/login" className="btn btn-primary mt-6">Go to the newsroom</Link>
      </div>
    );
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <h1 className="sr-only">{site.fullName}: {site.tagline}</h1>

      {/* Lead story + trending */}
      <section className="container-page mt-6 grid gap-8 lg:mt-8 lg:grid-cols-12 lg:gap-10">
        <article className="lg:col-span-8">
          <Link href={`/article/${hero.slug}`} tabIndex={-1} aria-hidden>
            <ArticleImage src={hero.featured_image} alt={hero.featured_image_alt} category={hero.category} priority sizes="(min-width: 1024px) 60vw, 100vw" ratio="aspect-[16/9]" />
          </Link>
          <div className="mt-4 flex items-center gap-2"><CategoryLink slug={hero.category} /><TypeBadge type={hero.type} /></div>
          <h2 className="headline mt-1.5 text-[2rem] leading-[1.08] md:text-[2.85rem]">
            <Link href={`/article/${hero.slug}`} className="story-link">{hero.title}</Link>
          </h2>
          {hero.excerpt && <p className="mt-3 max-w-2xl font-serif text-[1.2rem] leading-relaxed text-muted">{hero.excerpt}</p>}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <Byline a={hero} minRead={d.minRead} />
            <Link href={`/article/${hero.slug}`} className="btn btn-primary">{d.readMore}</Link>
          </div>
        </article>

        <aside className="lg:col-span-4 lg:border-l lg:border-rule lg:pl-8" aria-labelledby="trending-heading">
          <h2 id="trending-heading" className="section-rule headline pt-3 text-[1.5rem]">{d.trending}</h2>
          <ol className="mt-2 divide-y divide-rule">
            {trending.map((a, i) => (
              <li key={a.id} className="grid grid-cols-[2.25rem_1fr] gap-2 py-4">
                <span className="font-serif text-[2rem] font-semibold leading-none text-gold-500" aria-hidden>{i + 1}</span>
                <div>
                  <CategoryLink slug={a.category} />
                  <h3 className="headline mt-0.5 text-[1.08rem]"><Link href={`/article/${a.slug}`} className="story-link">{a.title}</Link></h3>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </section>

      {/* Secondary row */}
      {secondary.length > 0 && (
        <section className="container-page mt-10 grid gap-8 border-t border-rule pt-8 sm:grid-cols-2 lg:grid-cols-3" aria-label="Top stories">
          {secondary.map((a) => <StoryCard key={a.id} a={a} minRead={d.minRead} />)}
        </section>
      )}

      <div className="container-page mt-12"><AdSlot /></div>

      {/* Latest news feed + sidebar */}
      <section className="container-page mt-12 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <SectionHeading title={d.latest} href="/news" />
          <div className="grid gap-8">
            {feed.map((a) => <StoryCard key={a.id} a={a} variant="row" minRead={d.minRead} />)}
          </div>
        </div>
        <aside className="grid content-start gap-10 lg:col-span-4">
          <div className="bg-navy-900 p-6 text-white dark:bg-surface">
            <NewsletterForm title={d.newsletterTitle} cta={d.subscribe} lang={lang} tone="dark" />
          </div>
          {interviews.length > 0 && (
            <div>
              <SectionHeading title={d.interviews} href="/interviews" />
              <div className="divide-y divide-rule">
                {interviews.map((a) => <StoryCard key={a.id} a={a} variant="text" />)}
              </div>
            </div>
          )}
          <AdSlot format="rectangle" />
        </aside>
      </section>

      <VideoDesk channel={channel} articles={videos} title={d.video} subtitle={d.videoDesk} />

      {/* Community spotlight */}
      {community.length > 0 && (
        <section className="container-page mt-16">
          <SectionHeading title={d.community} href="/news/community" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {community.map((a) => <StoryCard key={a.id} a={a} variant="compact" />)}
          </div>
        </section>
      )}

      {/* Cultural heritage */}
      <section className="container-page mt-16">
        <SectionHeading title={d.heritage} href="/culture" />
        <div className="grid gap-px overflow-hidden border border-rule bg-rule md:grid-cols-3">
          {heritage.map((h) => {
            const key = h.name.toLowerCase() as "igbo" | "yoruba" | "hausa";
            const stories = culture[key];
            return (
              <div key={h.slug} className="flex flex-col bg-bg">
                <div className="relative overflow-hidden bg-navy-900 px-6 py-7 text-white dark:bg-surface">
                  <BrandMark tone="onDark" className="pointer-events-none absolute -right-3 -top-2 h-28 w-auto opacity-15" />
                  <p className="font-serif text-[2.4rem] font-semibold leading-none" style={{ fontVariationSettings: '"opsz" 72' }}>{h.name}</p>
                  <p className="mt-2 max-w-[18rem] text-[0.92rem] text-white/75">{h.blurb}</p>
                </div>
                <div className="flex flex-1 flex-col px-6 pb-6">
                  <div className="flex-1 divide-y divide-rule">
                    {stories.length > 0 ? (
                      stories.map((a) => (
                        <h3 key={a.id} className="headline py-4 text-[1.1rem]"><Link href={`/article/${a.slug}`} className="story-link">{a.title}</Link></h3>
                      ))
                    ) : (
                      <p className="py-4 text-sm text-muted">New {h.name} heritage stories are coming soon.</p>
                    )}
                  </div>
                  <Link href={`/culture/${h.slug}`} className="mt-2 text-sm font-semibold text-accent hover:underline">Explore {h.name} heritage</Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* More stories */}
      {more.length > 0 && (
        <section className="container-page mt-16">
          <SectionHeading title="More stories" href="/search" linkLabel="Browse the archive" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((a) => <StoryCard key={a.id} a={a} minRead={d.minRead} />)}
          </div>
        </section>
      )}

      {/* Event coverage call-to-action */}
      <section className="container-page mt-16">
        <div className="grid items-center gap-6 border-y-2 border-gold-500 py-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="headline text-[1.6rem]">Planning a wedding, launch or festival?</p>
            <p className="mt-1 text-muted">Our events desk covers it with photography, video and a published story on De Accolade.</p>
          </div>
          <Link href="/event-coverage" className="btn btn-primary">Book event coverage</Link>
        </div>
      </section>
    </>
  );
}
