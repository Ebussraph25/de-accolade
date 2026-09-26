/**
 * Information architecture from the PRD (section 5).
 * Articles store a single `category` slug; sections group categories for navigation.
 */
export type Category = { slug: string; name: string; section: string };
export type Section = {
  slug: string;
  name: string;
  description: string;
  categories: Category[];
};

const cats = (section: string, list: [string, string][]): Category[] =>
  list.map(([slug, name]) => ({ slug, name, section }));

export const sections: Section[] = [
  {
    slug: "news",
    name: "News",
    description: "Breaking stories, local reporting, politics, business, education and health.",
    categories: cats("news", [
      ["breaking-news", "Breaking News"],
      ["local-news", "Local News"],
      ["politics", "Politics"],
      ["community", "Community"],
      ["business", "Business"],
      ["education", "Education"],
      ["health", "Health"],
    ]),
  },
  {
    slug: "culture",
    name: "Culture",
    description: "Igbo, Yoruba and Hausa heritage, traditions, festivals and language.",
    categories: cats("culture", [
      ["igbo-heritage", "Igbo Heritage"],
      ["yoruba-heritage", "Yoruba Heritage"],
      ["hausa-heritage", "Hausa Heritage"],
      ["traditional-events", "Traditional Events"],
    ]),
  },
  {
    slug: "entertainment",
    name: "Entertainment",
    description: "Movies, music, celebrity and lifestyle.",
    categories: cats("entertainment", [
      ["movies", "Movies"],
      ["music", "Music"],
      ["celebrity", "Celebrity"],
      ["lifestyle", "Lifestyle"],
    ]),
  },
  {
    slug: "sports",
    name: "Sports",
    description: "Football, athletics and grassroots sport from our communities.",
    categories: cats("sports", [["sports", "Sports"]]),
  },
  {
    slug: "interviews",
    name: "Interviews",
    description: "Conversations with leaders, achievers and emerging voices.",
    categories: cats("interviews", [["interviews", "Interviews"]]),
  },
  {
    slug: "events",
    name: "Event Coverage",
    description: "Weddings, festivals, launches and community gatherings we covered.",
    categories: cats("events", [["events", "Event Coverage"]]),
  },
];

export const allCategories: Category[] = sections.flatMap((s) => s.categories);

export function getCategory(slug: string | null | undefined) {
  return allCategories.find((c) => c.slug === slug);
}
export function getSection(slug: string) {
  return sections.find((s) => s.slug === slug);
}
export function categoryName(slug: string) {
  return getCategory(slug)?.name ?? slug;
}
/** Where a category lives in the URL space. Single-category sections link to the section itself. */
export function categoryHref(slug: string) {
  const c = getCategory(slug);
  if (!c) return "/search";
  const s = getSection(c.section)!;
  if (s.categories.length === 1) return `/${s.slug}`;
  return `/${s.slug}/${c.slug}`;
}

export const heritage = [
  { slug: "igbo-heritage", name: "Igbo", blurb: "Traditions, history, language and festivals of Ndi Igbo." },
  { slug: "yoruba-heritage", name: "Yoruba", blurb: "Oríkì, festivals, crafts and the living history of Yorùbá land." },
  { slug: "hausa-heritage", name: "Hausa", blurb: "Durbar, trade, scholarship and the culture of the North." },
] as const;

export const languages = [
  { code: "en", name: "English", native: "English" },
  { code: "ig", name: "Igbo", native: "Igbo" },
  { code: "yo", name: "Yoruba", native: "Yorùbá" },
  { code: "ha", name: "Hausa", native: "Hausa" },
] as const;
export type LangCode = (typeof languages)[number]["code"];
export const isLang = (v: unknown): v is LangCode => languages.some((l) => l.code === v);

export const articleTypes = [
  { value: "article", label: "Article" },
  { value: "video", label: "Video" },
  { value: "gallery", label: "Photo story" },
  { value: "live", label: "Live coverage" },
] as const;
export type ArticleType = (typeof articleTypes)[number]["value"];
