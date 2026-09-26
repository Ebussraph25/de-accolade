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
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
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
