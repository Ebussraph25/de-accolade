import "server-only";
import { unstable_cache } from "next/cache";
import demo from "./demo-content.json";
import { publicClient } from "./supabase/public";
import { site } from "./site";
import type { ArticleType, LangCode } from "./taxonomy";
import type {
  Article,
  ArticleCard,
  BreakingItem,
  LiveUpdate,
  PublicComment,
  VideoItem,
} from "./types";

export const CONTENT_TAG = "content";
const REVALIDATE = 60;

const CARD_COLS =
  "id,slug,title,excerpt,category,type,language,translation_of,featured,breaking,featured_image,featured_image_alt,byline,reading_minutes,published_at,views,youtube_url,author:profiles(full_name,slug)";

// --------------------------------------------------------------------------
// Demo content (used only when Supabase is not configured)
// --------------------------------------------------------------------------
type DemoArticle = (typeof demo.articles)[number] & {
  subtitle?: string;
  featured?: boolean;
  breaking?: boolean;
  live?: { minutesAgo: number; body: string }[];
};

function demoArticles(): Article[] {
  const now = Date.now();
  return (demo.articles as DemoArticle[]).map((d, i) => {
    const published = new Date(now - d.hoursAgo * 3600_000).toISOString();
    return {
      id: `demo-${i}`,
      slug: d.slug,
      title: d.title,
      subtitle: d.subtitle ?? null,
      excerpt: d.excerpt ?? null,
      body: d.body,
      category: d.category,
      tags: d.tags ?? [],
      type: d.type as ArticleType,
      language: "en",
      translation_of: null,
      status: "published",
      featured: Boolean(d.featured),
      breaking: Boolean(d.breaking),
      featured_image: null,
      featured_image_alt: null,
      image_credit: null,
      youtube_url: null,
      video_url: null,
      gallery: [],
      attachments: [],
      author_id: null,
      byline: "De Accolade Newsroom",
      seo_title: null,
      seo_description: null,
      keywords: null,
      views: d.views ?? 0,
      reading_minutes: readingMinutes(d.body),
      published_at: published,
      created_at: published,
      updated_at: published,
      author: null,
    };
  });
}

export function readingMinutes(text: string) {
  return Math.max(1, Math.round(text.trim().split(/\s+/).length / 220));
}

const toCard = (a: Article): ArticleCard => ({
  id: a.id,
  slug: a.slug,
  title: a.title,
  excerpt: a.excerpt,
  category: a.category,
  type: a.type,
  language: a.language,
  translation_of: a.translation_of,
  featured: a.featured,
  breaking: a.breaking,
  featured_image: a.featured_image,
  featured_image_alt: a.featured_image_alt,
  byline: a.byline,
  reading_minutes: a.reading_minutes,
  published_at: a.published_at,
  views: a.views,
  youtube_url: a.youtube_url,
  author: a.author ?? null,
});

// --------------------------------------------------------------------------
// Localisation: list originals, then swap in a translation for the reader's language.
// --------------------------------------------------------------------------
async function localize(cards: ArticleCard[], lang: LangCode): Promise<ArticleCard[]> {
  const db = await contentDb();
  if (!db || lang === "en" || cards.length === 0) return cards;
  const { data } = await db
    .from("articles")
    .select(CARD_COLS)
    .eq("status", "published")
    .eq("language", lang)
    .in("translation_of", cards.map((c) => c.id));
  const byOriginal = new Map((data as unknown as ArticleCard[] | null)?.map((t) => [t.translation_of!, t]) ?? []);
  return cards.map((c) => byOriginal.get(c.id) ?? c);
}

/** Restrict a query to live, published stories. (Loosely typed: supabase-js builder generics are very deep.) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function published(q: any): any {
  return q.eq("status", "published").lte("published_at", new Date().toISOString());
}

// --------------------------------------------------------------------------
// Sample stories are shown until the newsroom publishes its first real story,
// so a freshly connected site never looks empty. They are never written to the
// database, never listed in sitemaps, and marked noindex.
// --------------------------------------------------------------------------
const hasPublishedStories = unstable_cache(
  async (): Promise<boolean> => {
    const db = publicClient();
    if (!db) return false;
    const { count, error } = await published(db.from("articles").select("id", { count: "exact", head: true }));
    if (error) throw new Error(`Could not reach the newsroom database: ${error.message}`);
    return (count ?? 0) > 0;
  },
  ["has-published-stories"],
  { revalidate: REVALIDATE, tags: [CONTENT_TAG] },
);

/** Database client for content queries, or null while sample stories are being shown. */
async function contentDb() {
  const db = publicClient();
  if (!db) return null;
  return (await hasPublishedStories()) ? db : null;
}

export async function showingSamples() {
  return !(await hasPublishedStories().catch(() => false));
}

export const isSampleId = (id: string) => id.startsWith("demo-");

// --------------------------------------------------------------------------
// Public queries
// --------------------------------------------------------------------------
export const getBreaking = unstable_cache(
  async (): Promise<BreakingItem[]> => {
    const db = publicClient();
    if (db) {
      const { data } = await db
        .from("breaking_news")
        .select("id,headline,link")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(8);
      if (data?.length || (await hasPublishedStories())) return (data as BreakingItem[]) ?? [];
    }
    return demo.breaking.map((b, i) => ({ id: `b${i}`, headline: b.headline, link: `/article/${b.slug}` }));
  },
  ["breaking"],
  { revalidate: REVALIDATE, tags: [CONTENT_TAG] },
);

type ListOpts = {
  categories?: string[];
  type?: ArticleType;
  limit?: number;
  offset?: number;
  order?: "latest" | "views";
  excludeIds?: string[];
  since?: string;
};

const listOriginals = unstable_cache(
  async (opts: ListOpts): Promise<{ items: ArticleCard[]; total: number }> => {
    const { categories, type, limit = 12, offset = 0, order = "latest", excludeIds = [], since } = opts;
    const db = await contentDb();
    if (!db) {
      let all = demoArticles();
      if (categories?.length) all = all.filter((a) => categories.includes(a.category));
      if (type) all = all.filter((a) => a.type === type);
      if (excludeIds.length) all = all.filter((a) => !excludeIds.includes(a.id));
      if (since) all = all.filter((a) => a.published_at! >= since);
      all.sort((a, b) =>
        order === "views" ? b.views - a.views : b.published_at!.localeCompare(a.published_at!),
      );
      return { items: all.slice(offset, offset + limit).map(toCard), total: all.length };
    }
    let q = published(db.from("articles").select(CARD_COLS, { count: "exact" })).is("translation_of", null);
    if (categories?.length) q = q.in("category", categories);
    if (type) q = q.eq("type", type);
    if (excludeIds.length) q = q.not("id", "in", `(${excludeIds.join(",")})`);
    if (since) q = q.gte("published_at", since);
    q = order === "views" ? q.order("views", { ascending: false }) : q.order("published_at", { ascending: false });
    const { data, count, error } = await q.range(offset, offset + limit - 1);
    if (error) throw new Error(`Could not load articles: ${error.message}`);
    return { items: (data as unknown as ArticleCard[]) ?? [], total: count ?? 0 };
  },
  ["articles-list"],
  { revalidate: REVALIDATE, tags: [CONTENT_TAG] },
);

export async function listArticles(opts: ListOpts & { lang?: LangCode }) {
  const { lang = "en", ...rest } = opts;
  const res = await listOriginals(rest);
  return { ...res, items: await localize(res.items, lang) };
}

export async function getTrending(lang: LangCode, limit = 5) {
  const since = new Date(Date.now() - 14 * 86400_000).toISOString();
  let { items } = await listArticles({ order: "views", limit, since, lang });
  if (items.length < limit) ({ items } = await listArticles({ order: "views", limit, lang }));
  return items;
}

export async function getHomepage(lang: LangCode) {
  const [featured, latest, community, interviews, videos, culture] = await Promise.all([
    listOriginals({ limit: 40 }),
    listArticles({ limit: 13, lang }),
    listArticles({ categories: ["community", "events", "local-news"], limit: 4, lang }),
    listArticles({ categories: ["interviews"], limit: 3, lang }),
    listArticles({ type: "video", limit: 4, lang }),
    Promise.all(
      ["igbo-heritage", "yoruba-heritage", "hausa-heritage"].map((c) =>
        listArticles({ categories: [c], limit: 2, lang }).then((r) => r.items),
      ),
    ),
  ]);
  const heroOriginal = featured.items.find((a) => a.featured) ?? latest.items[0];
  const [hero] = heroOriginal ? await localize([heroOriginal], lang) : [];
  return {
    hero,
    latest: latest.items.filter((a) => a.id !== hero?.id && a.translation_of !== hero?.id).slice(0, 12),
    community: community.items,
    interviews: interviews.items,
    videos: videos.items,
    culture: { igbo: culture[0], yoruba: culture[1], hausa: culture[2] },
  };
}

const articleBySlug = unstable_cache(
  async (slug: string): Promise<Article | null> => {
    const db = await contentDb();
    if (!db) return demoArticles().find((a) => a.slug === slug) ?? null;
    const { data } = await published(
      db.from("articles").select("*, author:profiles(full_name,slug,bio,avatar_url)"),
    )
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return null;
    const { search: _search, ...article } = data as Article & { search?: unknown };
    void _search;
    return article as Article;
  },
  ["article"],
  { revalidate: REVALIDATE, tags: [CONTENT_TAG] },
);
export const getArticle = (slug: string) => articleBySlug(slug);

/** Other language versions of the same story (for hreflang links and the language switcher). */
export const getTranslations = unstable_cache(
  async (groupId: string): Promise<{ slug: string; language: LangCode }[]> => {
    const db = await contentDb();
    if (!db) return [];
    const { data } = await published(db.from("articles").select("slug,language"))
      .or(`id.eq.${groupId},translation_of.eq.${groupId}`);
    return (data as { slug: string; language: LangCode }[]) ?? [];
  },
  ["translations"],
  { revalidate: REVALIDATE, tags: [CONTENT_TAG] },
);

export async function getRelated(article: Article, lang: LangCode) {
  const { items } = await listArticles({
    categories: [article.category],
    excludeIds: [article.translation_of ?? article.id],
    limit: 3,
    lang,
  });
  if (items.length >= 3) return items;
  const more = await listArticles({ excludeIds: [article.translation_of ?? article.id, ...items.map((i) => i.id)], limit: 3 - items.length, lang });
  return [...items, ...more.items];
}

export async function getLiveUpdates(article: Article): Promise<LiveUpdate[]> {
  const db = await contentDb();
  if (!db) {
    const d = (demo.articles as DemoArticle[]).find((x) => x.slug === article.slug);
    return (d?.live ?? []).map((u, i) => ({
      id: `l${i}`,
      body: u.body,
      image_url: null,
      created_at: new Date(Date.now() - u.minutesAgo * 60_000).toISOString(),
    }));
  }
  const { data } = await db
    .from("live_updates")
    .select("id,body,image_url,created_at")
    .eq("article_id", article.id)
    .order("created_at", { ascending: false })
    .limit(200);
  return (data as LiveUpdate[]) ?? [];
}

export const getComments = unstable_cache(
  async (articleId: string): Promise<PublicComment[]> => {
    const db = publicClient();
    if (!db) return [];
    const { data } = await db
      .from("comments")
      .select("id,name,body,created_at")
      .eq("article_id", articleId)
      .eq("status", "approved")
      .order("created_at", { ascending: true })
      .limit(200);
    return (data as PublicComment[]) ?? [];
  },
  ["comments"],
  { revalidate: REVALIDATE, tags: [CONTENT_TAG] },
);

export type SearchParams = {
  q?: string;
  category?: string;
  language?: string;
  type?: string;
  from?: string;
  to?: string;
  page?: number;
};
export const SEARCH_PAGE_SIZE = 12;

export async function searchArticles(p: SearchParams) {
  const page = Math.max(1, p.page ?? 1);
  const q = (p.q ?? "").trim().slice(0, 120);
  const db = await contentDb();
  if (!db) {
    let all = demoArticles();
    if (q) {
      const needle = q.toLowerCase();
      all = all.filter((a) => `${a.title} ${a.excerpt} ${a.body}`.toLowerCase().includes(needle));
    }
    if (p.category) all = all.filter((a) => a.category === p.category);
    if (p.type) all = all.filter((a) => a.type === p.type);
    if (p.language) all = all.filter((a) => a.language === p.language);
    if (p.from) all = all.filter((a) => a.published_at! >= p.from!);
    if (p.to) all = all.filter((a) => a.published_at! <= `${p.to}T23:59:59Z`);
    return {
      items: all.slice((page - 1) * SEARCH_PAGE_SIZE, page * SEARCH_PAGE_SIZE).map(toCard),
      total: all.length,
      authors: [] as { full_name: string; slug: string }[],
    };
  }
  let query = published(db.from("articles").select(CARD_COLS, { count: "exact" }));
  if (q) query = query.textSearch("search", q, { type: "websearch", config: "simple" });
  if (p.category) query = query.eq("category", p.category);
  if (p.type) query = query.eq("type", p.type);
  if (p.language) query = query.eq("language", p.language);
  if (p.from) query = query.gte("published_at", p.from);
  if (p.to) query = query.lte("published_at", `${p.to}T23:59:59Z`);
  const [{ data, count }, authors] = await Promise.all([
    query
      .order("published_at", { ascending: false })
      .range((page - 1) * SEARCH_PAGE_SIZE, page * SEARCH_PAGE_SIZE - 1),
    q
      ? db.from("profiles").select("full_name,slug").not("role", "is", null).not("slug", "is", null).ilike("full_name", `%${q.replace(/[%_,()]/g, "")}%`).limit(5)
      : Promise.resolve({ data: [] }),
  ]);
  return {
    items: (data as unknown as ArticleCard[]) ?? [],
    total: count ?? 0,
    authors: ((authors as { data: unknown }).data as { full_name: string; slug: string }[]) ?? [],
  };
}

export const getAuthor = unstable_cache(
  async (slug: string) => {
    const db = publicClient();
    if (!db) return null;
    const { data: author } = await db
      .from("profiles")
      .select("id,full_name,slug,bio,avatar_url")
      .eq("slug", slug)
      .not("role", "is", null)
      .maybeSingle();
    if (!author) return null;
    const { data } = await published(db.from("articles").select(CARD_COLS))
      .eq("author_id", author.id)
      .order("published_at", { ascending: false })
      .limit(24);
    return { author, articles: (data as unknown as ArticleCard[]) ?? [] };
  },
  ["author"],
  { revalidate: REVALIDATE, tags: [CONTENT_TAG] },
);

export const getSitemapEntries = unstable_cache(
  async () => {
    const db = await contentDb();
    if (!db) return []; // sample stories are never offered to search engines
    const { data } = await published(db.from("articles").select("slug,updated_at,published_at,title,language,excerpt,category"))
      .order("published_at", { ascending: false })
      .limit(5000);
    return (data as { slug: string; updated_at: string; published_at: string; title: string; language: string; excerpt: string | null; category: string }[]) ?? [];
  },
  ["sitemap"],
  { revalidate: 600, tags: [CONTENT_TAG] },
);

// --------------------------------------------------------------------------
// YouTube (Agunjiegbe Online Television) — public RSS feed, no API key needed
// --------------------------------------------------------------------------
export async function getYouTubeVideos(limit = 6): Promise<VideoItem[]> {
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${site.youtube.channelId}`, {
      next: { revalidate: 1800, tags: ["youtube"] },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const entries = xml.split("<entry>").slice(1, limit + 1);
    const decode = (s: string) =>
      s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    return entries
      .map((e) => {
        const id = e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ?? "";
        return {
          id,
          title: decode(e.match(/<title>([^<]*)<\/title>/)?.[1] ?? ""),
          published: e.match(/<published>([^<]+)<\/published>/)?.[1] ?? "",
          url: `https://www.youtube.com/watch?v=${id}`,
          thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        };
      })
      .filter((v) => /^[\w-]{11}$/.test(v.id));
  } catch {
    return [];
  }
}

export function youTubeId(url: string | null | undefined) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/);
  return m?.[1] ?? null;
}
