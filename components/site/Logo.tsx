import Image from "next/image";

/**
 * De Accolade brand assets (public/brand). Each has a navy version for light backgrounds
 * and a "-light" version (navy strokes turned white) for navy / dark-mode backgrounds.
 */
const ASSETS = {
  mark: { w: 171, h: 168 },
  wordmark: { w: 540, h: 108 },
  full: { w: 540, h: 294 },
} as const;

type Tone = "auto" | "onDark";

function BrandImg({ kind, tone, className, priority, alt = "" }: { kind: keyof typeof ASSETS; tone: Tone; className: string; priority?: boolean; alt?: string }) {
  const { w, h } = ASSETS[kind];
  const light = `/brand/logo-${kind}-light.png`;
  const dark = `/brand/logo-${kind}.png`;
  if (tone === "onDark") return <Image src={light} alt={alt} width={w} height={h} priority={priority} className={className} />;
  return (
    <>
      <Image src={dark} alt={alt} width={w} height={h} priority={priority} className={`${className} dark:hidden`} />
      <Image src={light} alt={alt} width={w} height={h} priority={priority} className={`${className} hidden dark:block`} />
    </>
  );
}

/** The DA monogram with star, on its own (watermarks, compact spaces). */
export function BrandMark({ className = "h-10 w-auto", tone = "auto" }: { className?: string; tone?: Tone }) {
  return <BrandImg kind="mark" tone={tone} className={className} />;
}

/** Horizontal lockup: monogram + "DE ACCOLADE MAGAZINE". */
export function Wordmark({ size = "lg", tone = "auto" }: { size?: "sm" | "lg"; tone?: Tone }) {
  const big = size === "lg";
  return (
    <span className="inline-flex items-center gap-3 md:gap-4">
      <BrandImg kind="mark" tone={tone} priority={big} className={big ? "h-12 w-auto md:h-[4.5rem]" : "h-9 w-auto"} />
      <span className="flex flex-col items-start">
        <BrandImg kind="wordmark" tone={tone} priority={big} alt="De Accolade Magazine" className={big ? "h-8 w-auto md:h-12" : "h-6 w-auto"} />
        {big && (
          <span className="mt-2 hidden text-[0.78rem] font-medium tracking-[0.02em] text-muted sm:block">
            An Agunjiegbe Online Television Publication
          </span>
        )}
      </span>
    </span>
  );
}
