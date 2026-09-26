import type { Metadata } from "next";
import { getYouTubeVideos, listArticles, youTubeId } from "@/lib/data";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { site } from "@/lib/site";
import { timeAgo } from "@/lib/format";
import { YouTubeEmbed } from "@/components/news/YouTubeEmbed";
import { StoryCard } from "@/components/news/StoryCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { YouTubeIcon } from "@/components/site/Icons";

export const metadata: Metadata = {
  title: "Video",
  description: "News reports, interviews and documentaries from Agunjiegbe Online Television.",
  alternates: { canonical: "/video" },
};

export default async function VideoPage() {
  const lang = await getLang();
  const d = t(lang);
  const [channel, { items: stories }] = await Promise.all([getYouTubeVideos(13), listArticles({ type: "video", limit: 12, lang })]);
  const [lead, ...rest] = channel;
  const embedded = stories.filter((s) => youTubeId(s.youtube_url));
  return (
    <div>
      <section className="bg-navy-900 pb-12 pt-10 text-white dark:bg-navy-950">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="headline text-[2.6rem] md:text-[3.2rem]">{d.video}</h1>
              <p className="mt-1 max-w-xl text-white/75">News reports, interviews, documentaries and live coverage from {site.parent}.</p>
            </div>
            <a href={site.youtube.handleUrl} target="_blank" rel="noopener noreferrer" className="btn btn-gold"><YouTubeIcon className="h-5 w-5" /> Subscribe on YouTube</a>
          </div>
          {lead ? (
            <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
              <div>
                <YouTubeEmbed id={lead.id} title={lead.title} priority />
                <h2 className="headline mt-4 text-2xl">{lead.title}</h2>
                <p className="mt-1 text-sm text-white/60">{timeAgo(lead.published)}</p>
              </div>
              <ul className="grid content-start gap-5">
                {rest.slice(0, 4).map((v) => (
                  <li key={v.id}>
                    <a href={v.url} target="_blank" rel="noopener noreferrer" className="group grid grid-cols-[9rem_1fr] gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={v.thumbnail} alt="" loading="lazy" className="aspect-video w-full object-cover" />
                      <span><span className="headline block text-[1.02rem] group-hover:underline">{v.title}</span><span className="mt-1 block text-xs text-white/60">{timeAgo(v.published)}</span></span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-8 border border-white/15 p-6 text-white/80">
              The latest uploads from the channel will appear here automatically. <a href={site.youtube.handleUrl} className="font-semibold text-gold-400 underline" target="_blank" rel="noopener noreferrer">Watch on YouTube</a>
            </p>
          )}
        </div>
      </section>

      {rest.length > 4 && (
        <section className="container-page mt-12">
          <SectionHeading title="More from the channel" />
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {rest.slice(4).map((v) => (
              <li key={v.id}><a href={v.url} target="_blank" rel="noopener noreferrer" className="group block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.thumbnail} alt="" loading="lazy" className="aspect-video w-full object-cover" />
                <span className="headline mt-2 block text-[1.05rem] group-hover:underline">{v.title}</span>
              </a></li>
            ))}
          </ul>
        </section>
      )}

      {embedded.length > 0 || stories.length > 0 ? (
        <section className="container-page mt-12">
          <SectionHeading title="Video stories" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{stories.map((s) => <StoryCard key={s.id} a={s} minRead={d.minRead} />)}</div>
        </section>
      ) : null}
    </div>
  );
}
