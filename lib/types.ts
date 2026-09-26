import type { ArticleType, LangCode } from "./taxonomy";

export type Role = "super_admin" | "editor" | "reporter";
export type ArticleStatus = "draft" | "pending" | "published" | "archived";

export type GalleryItem = { url: string; caption?: string; credit?: string };
export type Attachment = { url: string; name: string };

export type Author = {
  id: string;
  full_name: string;
  slug: string | null;
  bio: string | null;
  avatar_url: string | null;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  body: string;
  category: string;
  tags: string[];
  type: ArticleType;
  language: LangCode;
  translation_of: string | null;
  status: ArticleStatus;
  featured: boolean;
  breaking: boolean;
  featured_image: string | null;
  featured_image_alt: string | null;
  image_credit: string | null;
  youtube_url: string | null;
  video_url: string | null;
  gallery: GalleryItem[];
  attachments: Attachment[];
  author_id: string | null;
  byline: string | null;
  seo_title: string | null;
  seo_description: string | null;
  keywords: string | null;
  views: number;
  reading_minutes: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author?: Pick<Author, "full_name" | "slug"> | null;
};

/** Lightweight shape used for cards and lists. */
export type ArticleCard = Pick<
  Article,
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "category"
  | "type"
  | "language"
  | "translation_of"
  | "featured"
  | "breaking"
  | "featured_image"
  | "featured_image_alt"
  | "byline"
  | "reading_minutes"
  | "published_at"
  | "views"
  | "youtube_url"
> & { author?: Pick<Author, "full_name" | "slug"> | null };

export type LiveUpdate = { id: string; body: string; image_url: string | null; created_at: string };
export type PublicComment = { id: string; name: string; body: string; created_at: string };
export type BreakingItem = { id: string; headline: string; link: string | null };
export type VideoItem = { id: string; title: string; published: string; url: string; thumbnail: string };
