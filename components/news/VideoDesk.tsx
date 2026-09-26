import Link from "next/link";
import { site } from "@/lib/site";
import { timeAgo } from "@/lib/format";
import { youTubeId } from "@/lib/data";
import type { ArticleCard, VideoItem } from "@/lib/types";
import { YouTubeEmbed } from "./YouTubeEmbed";
import { ArticleImage } from "./ArticleImage";
import { YouTubeIcon, PlayIcon } from "../site/Icons";

/** Navy band featuring Agunjiegbe Online Television (PRD §6.5). */
export function VideoDesk({ channel, articles, title, subtitle }: { channel: VideoItem[]; articles: ArticleCard[]; title: string; subtitle: string }) {
  const lead = channel[0];
  const leadArticleVid = !lead ? articles.find((a) => youTubeId(a.youtube_url)) : undefined;
  const rest = channel.slice(1, 5);
  return (
    <section className="mt-16 bg-navy-900 py-12 text-white dark:bg-navy-950" aria-labelledby="video-heading">
      <div className="container-page">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-white/15 pb-4">
          <div>
            <h2 id="video-heading" className="headline text-[1.85rem] text-white">{title}</h2>
            <p className="mt-1 text-[0.95rem] text-gold-400">{subtitle}</p>
          </div>
          <a href={site.youtube.handleUrl} target="_blank" rel="noopener noreferrer" className="btn border border-white/25 text-white hover:border-gold-400 hover:text-gold-400">
            <YouTubeIcon className="h-5 w-5" /> Subscribe on YouTube
          </a>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            {lead ? (
              <>
                <YouTubeEmbed id={lead.id} title={lead.title} />
                <h3 className="headline mt-4 text-2xl text-white">{lead.title}</h3>
                <p className="mt-1 text-sm text-white/60">{timeAgo(lead.published)}</p>
              </>
            ) : leadArticleVid ? (
              <>
                <YouTubeEmbed id={youTubeId(leadArticleVid.youtube_url)!} title={leadArticleVid.title} />
                <h3 className="headline mt-4 text-2xl"><Link href={`/article/${leadArticleVid.slug}`} className="story-link">{leadArticleVid.title}</Link></h3>
              </>
            ) : (
              <a href={site.youtube.handleUrl} target="_blank" rel="noopener noreferrer" className="group relative flex aspect-video items-center justify-center overflow-hidden bg-navy-800">
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(216,183,95,.25),transparent_55%)]" />
                <span className="relative text-center">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-500 text-navy-950 transition group-hover:scale-105"><PlayIcon className="ml-1 h-7 w-7" /></span>
                  <span className="mt-4 block font-serif text-2xl">Watch Agunjiegbe Online TV</span>
                  <span className="mt-1 block text-sm text-white/70">News, interviews, documentaries and live coverage</span>
                </span>
              </a>
            )}
          </div>
          <ul className="grid content-start gap-5">
            {rest.map((v) => (
              <li key={v.id}>
                <a href={v.url} target="_blank" rel="noopener noreferrer" className="group grid grid-cols-[8.5rem_1fr] gap-4">
                  <span className="relative block aspect-video overflow-hidden bg-navy-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={v.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </span>
                  <span>
                    <span className="headline block text-[1.02rem] text-white group-hover:underline">{v.title}</span>
                    <span className="mt-1 block text-xs text-white/60">{timeAgo(v.published)}</span>
                  </span>
                </a>
              </li>
            ))}
            {rest.length === 0 &&
              articles.slice(0, 4).map((a) => (
                <li key={a.id}>
                  <Link href={`/article/${a.slug}`} className="group grid grid-cols-[8.5rem_1fr] gap-4">
                    <ArticleImage src={a.featured_image} alt={a.featured_image_alt} category={a.category} ratio="aspect-video" sizes="140px" />
                    <span className="headline text-[1.02rem] text-white group-hover:underline">{a.title}</span>
                  </Link>
                </li>
              ))}
            <li><Link href="/video" className="text-sm font-semibold text-gold-400 hover:underline">More from the video desk</Link></li>
          </ul>
        </div>
      </div>
    </section>
  );
}
