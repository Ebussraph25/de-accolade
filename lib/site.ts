/**
 * Central brand + site configuration.
 * Anything an editor might want to change without touching components lives here.
 */
export const site = {
  name: "De Accolade",
  fullName: "De Accolade Magazine",
  tagline: "Your Voice. Our Community. Our Story.",
  parent: "Agunjiegbe Online Television",
  parentLine: "An Agunjiegbe Online Television Publication",
  description:
    "De Accolade Magazine is a community-driven digital newspaper covering local news, culture and heritage, interviews, sports, entertainment and events from across Nigeria.",
  /**
   * Public address. Set NEXT_PUBLIC_SITE_URL to override; otherwise Vercel's production
   * domain is used automatically (the custom domain once one is connected).
   */
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
  ).replace(/\/$/, ""),
  locale: "en_NG",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "newsroom@deaccolade.com",
  contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  youtube: {
    handleUrl: "https://www.youtube.com/@OnuigboEmeka",
    channelId: process.env.YOUTUBE_CHANNEL_ID || "UCojC7JrGXuoMsKZQHBJi4oQ",
  },
  social: {
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "",
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
    tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL || "",
    x: process.env.NEXT_PUBLIC_X_URL || "",
    youtube: "https://www.youtube.com/@OnuigboEmeka",
  },
} as const;

export function absoluteUrl(path = "/") {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Search engines should only index the real, custom-domain production site — never
 * preview deployments or the temporary *.vercel.app address.
 */
export function isIndexable() {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") return false;
  try {
    const host = new URL(site.url).hostname;
    return !(host.endsWith(".vercel.app") || host === "localhost");
  } catch {
    return false;
  }
}
