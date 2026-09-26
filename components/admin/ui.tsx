import Link from "next/link";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="headline text-[2rem]">{title}</h1>
        {description && <p className="mt-1 text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ title, children, action, className = "" }: { title?: string; children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <section className={`border border-rule bg-bg ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-rule px-5 py-3">
          <h2 className="font-semibold">{title}</h2>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

const statusStyles: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
  draft: "bg-surface text-muted border border-rule",
  pending: "bg-gold-100 text-navy-900",
  archived: "bg-surface text-muted line-through",
  approved: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
  rejected: "bg-surface text-muted",
  spam: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200",
  new: "bg-gold-100 text-navy-900",
  contacted: "bg-navy-100 text-navy-900",
  confirmed: "bg-emerald-100 text-emerald-900",
  closed: "bg-surface text-muted",
};
const statusText: Record<string, string> = { pending: "In review" };

export function StatusPill({ status }: { status: string }) {
  return <span className={`inline-block rounded-sm px-2 py-0.5 text-xs font-semibold capitalize ${statusStyles[status] ?? "bg-surface"}`}>{statusText[status] ?? status}</span>;
}

export function Empty({ title, body, href, cta }: { title: string; body?: string; href?: string; cta?: string }) {
  return (
    <div className="py-12 text-center">
      <p className="font-semibold">{title}</p>
      {body && <p className="mt-1 text-sm text-muted">{body}</p>}
      {href && cta && <Link href={href} className="btn btn-primary mt-4">{cta}</Link>}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error"; children: React.ReactNode }) {
  return <p role={tone === "error" ? "alert" : "status"} className={`mb-5 border-l-4 px-4 py-2.5 text-sm ${tone === "error" ? "border-live bg-live/10" : "border-gold-500 bg-gold-100/60 text-navy-900 dark:bg-navy-900 dark:text-gold-100"}`}>{children}</p>;
}
