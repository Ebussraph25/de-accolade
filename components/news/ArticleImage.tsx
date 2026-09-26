import Image from "next/image";
import { Laurel } from "../site/Logo";
import { categoryName, getCategory } from "@/lib/taxonomy";

const tones: Record<string, [string, string]> = {
  news: ["#0b1f3f", "#1d4178"],
  culture: ["#1c2a1d", "#3d5a2e"],
  entertainment: ["#2a1733", "#5b2c5f"],
  sports: ["#0c2d36", "#1e5a66"],
  interviews: ["#2b2013", "#6b4b1d"],
  events: ["#301816", "#6e2f27"],
};

/**
 * Story image with a branded fallback. When an article has no photo yet we show
 * a composed placeholder instead of a broken or empty box.
 */
export function ArticleImage({
  src,
  alt,
  category,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority = false,
  className = "",
  ratio = "aspect-[16/10]",
}: {
  src: string | null | undefined;
  alt?: string | null;
  category: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  ratio?: string;
}) {
  if (src) {
    return (
      <div className={`relative overflow-hidden bg-surface ${ratio} ${className}`}>
        <Image src={src} alt={alt ?? ""} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }
  const section = getCategory(category)?.section ?? "news";
  const [a, b] = tones[section] ?? tones.news;
  return (
    <div
      className={`relative overflow-hidden ${ratio} ${className}`}
      style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
      role="img"
      aria-label={alt || `${categoryName(category)} story`}
    >
      <svg className="absolute inset-0 h-full w-full opacity-[0.13]" aria-hidden>
        <defs>
          <pattern id={`p-${section}`} width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2="22" stroke="#d8b75f" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p-${section})`} />
      </svg>
      <Laurel className="absolute -bottom-[18%] -right-[8%] h-[85%] w-auto text-gold-400 opacity-25" />
      <span className="absolute bottom-3 left-3 font-serif text-sm italic text-gold-100/90 md:text-base">
        {categoryName(category)}
      </span>
    </div>
  );
}
