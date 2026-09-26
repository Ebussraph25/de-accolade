import Link from "next/link";

export function Pagination({ page, total, pageSize, basePath, query = {} }: { page: number; total: number; pageSize: number; basePath: string; query?: Record<string, string | undefined> }) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  const href = (p: number) => {
    const qs = new URLSearchParams(Object.entries({ ...query, page: p > 1 ? String(p) : undefined }).filter(([, v]) => v) as [string, string][]);
    const s = qs.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-between border-t border-rule pt-6">
      {page > 1 ? <Link href={href(page - 1)} className="btn btn-ghost" rel="prev">Newer stories</Link> : <span />}
      <p className="text-sm text-muted">Page {page} of {pages}</p>
      {page < pages ? <Link href={href(page + 1)} className="btn btn-ghost" rel="next">Older stories</Link> : <span />}
    </nav>
  );
}
