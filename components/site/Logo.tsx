/** Laurel mark: the "accolade". Geometry computed once at module load so it stays crisp at any size. */
const LAUREL = (() => {
  const cx = 32, cy = 31, R = 22, d2r = Math.PI / 180;
  const P = (t: number, r: number) => [cx + r * Math.cos(t * d2r), cy + r * Math.sin(t * d2r)].map((n) => +n.toFixed(2));
  const [sx, sy] = P(98, R), [ex, ey] = P(238, R);
  const leaves: { x: number; y: number; rx: number; ry: number; rot: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const t = 112 + i * 22, s = 1 - i * 0.06;
    const [ox, oy] = P(t, R + 4.2 * s), [ix, iy] = P(t + 4, R - 4.2 * s);
    leaves.push({ x: ox, y: oy, rx: 2.3 * s, ry: 5.4 * s, rot: t - 28 });
    leaves.push({ x: ix, y: iy, rx: 2.1 * s, ry: 4.8 * s, rot: t + 30 });
  }
  const [tx, ty] = P(242, R + 1);
  leaves.push({ x: tx, y: ty, rx: 1.9, ry: 4.4, rot: 242 });
  return { stem: `M${sx} ${sy} A${R} ${R} 0 0 1 ${ex} ${ey}`, leaves };
})();

export function Laurel({ className = "", title }: { className?: string; title?: string }) {
  const branch = (
    <>
      <path d={LAUREL.stem} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {LAUREL.leaves.map((l, i) => (
        <ellipse key={i} cx={l.x} cy={l.y} rx={l.rx} ry={l.ry} transform={`rotate(${l.rot} ${l.x} ${l.y})`} fill="currentColor" />
      ))}
    </>
  );
  return (
    <svg viewBox="0 0 64 64" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <g>{branch}</g>
      <g transform="translate(64 0) scale(-1 1)">{branch}</g>
    </svg>
  );
}

export function Wordmark({ size = "lg" }: { size?: "sm" | "lg" }) {
  const big = size === "lg";
  return (
    <span className="inline-flex items-center gap-2.5 md:gap-3.5">
      <Laurel className={big ? "h-10 w-10 text-gold-500 md:h-14 md:w-14" : "h-7 w-7 text-gold-500"} />
      <span className="flex flex-col leading-none">
        <span
          className={`font-serif font-semibold tracking-[-0.02em] ${big ? "text-[2.1rem] md:text-[3.4rem]" : "text-[1.45rem]"}`}
          style={{ fontVariationSettings: '"opsz" 72' }}
        >
          De Accolade
        </span>
        {big && (
          <span className="mt-1.5 hidden text-[0.8rem] font-medium tracking-[0.02em] text-muted sm:block">
            Magazine <span className="mx-1.5 text-gold-500">|</span> An Agunjiegbe Online Television Publication
          </span>
        )}
      </span>
    </span>
  );
}
