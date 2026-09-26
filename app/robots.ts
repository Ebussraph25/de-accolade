import type { MetadataRoute } from "next";
import { absoluteUrl, isIndexable } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Keep the temporary *.vercel.app address and preview builds out of Google.
  if (!isIndexable()) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/search"] }],
    sitemap: [absoluteUrl("/sitemap.xml"), absoluteUrl("/news-sitemap.xml")],
  };
}
