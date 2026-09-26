import Link from "next/link";
import { requirePage } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";
import { formatDate, timeAgo } from "@/lib/format";
import { deleteSubscriber, setBookingStatus, setMessageHandled } from "../../actions";
import { ActionButton } from "@/components/admin/ActionButton";
import { Empty, PageHeader, StatusPill } from "@/components/admin/ui";

export const metadata = { title: "Inbox" };
type Tab = "messages" | "bookings" | "subscribers";

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requirePage("editor");
  const requested = (await searchParams).tab;
  const tab: Tab = (["messages", "bookings", "subscribers"] as const).find((t) => t === requested) ?? "messages";
  const db = await serverClient();
  const tabs: { v: Tab; l: string }[] = [{ v: "messages", l: "Messages" }, { v: "bookings", l: "Coverage bookings" }, { v: "subscribers", l: "Newsletter subscribers" }];

  let content: React.ReactNode = null;
  if (tab === "messages") {
    const { data } = await db.from("contact_messages").select("*").order("handled").order("created_at", { ascending: false }).limit(200);
    const rows = (data ?? []) as { id: string; name: string; email: string; phone: string | null; subject: string; message: string; handled: boolean; created_at: string }[];
    content = rows.length === 0 ? <Empty title="No messages yet" /> : (
      <ul className="divide-y divide-rule">
        {rows.map((m) => (
          <li key={m.id} className={`p-5 ${m.handled ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold">{m.subject}</p>
              <p className="text-sm text-muted">{timeAgo(m.created_at)}</p>
            </div>
            <p className="text-sm text-muted">{m.name} · <a className="underline" href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}>{m.email}</a>{m.phone && <> · <a className="underline" href={`tel:${m.phone}`}>{m.phone}</a></>}</p>
            <p className="mt-2 whitespace-pre-line">{m.message}</p>
            <div className="mt-3"><ActionButton run={setMessageHandled.bind(null, m.id, !m.handled)}>{m.handled ? "Mark as unread" : "Mark as handled"}</ActionButton></div>
          </li>
        ))}
      </ul>
    );
  } else if (tab === "bookings") {
    const { data } = await db.from("bookings").select("*").order("created_at", { ascending: false }).limit(200);
    const rows = (data ?? []) as { id: string; name: string; email: string; phone: string; package: string; event_date: string | null; location: string | null; details: string | null; status: string; created_at: string }[];
    content = rows.length === 0 ? <Empty title="No booking requests yet" /> : (
      <ul className="divide-y divide-rule">
        {rows.map((b) => (
          <li key={b.id} className="p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold">{b.package}{b.event_date && <span className="font-normal text-muted"> on {formatDate(b.event_date)}</span>}</p>
              <StatusPill status={b.status} />
            </div>
            <p className="text-sm text-muted">{b.name} · <a className="underline" href={`tel:${b.phone}`}>{b.phone}</a> · <a className="underline" href={`mailto:${b.email}`}>{b.email}</a>{b.location && <> · {b.location}</>}</p>
            {b.details && <p className="mt-2 whitespace-pre-line text-[0.95rem]">{b.details}</p>}
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <span className="text-muted">Requested {timeAgo(b.created_at)}. Set status:</span>
              {["new", "contacted", "confirmed", "closed"].filter((s) => s !== b.status).map((s) => <ActionButton key={s} className="capitalize" run={setBookingStatus.bind(null, b.id, s)}>{s}</ActionButton>)}
            </div>
          </li>
        ))}
      </ul>
    );
  } else {
    const { data, count } = await db.from("subscribers").select("id,email,language,created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(500);
    const rows = (data ?? []) as { id: string; email: string; language: string; created_at: string }[];
    content = (
      <>
        <div className="flex items-center justify-between border-b border-rule p-4">
          <p className="text-sm text-muted">{count ?? 0} subscribers</p>
          {/* Plain link: this is a file download, not a page navigation. */}
          <a href="/admin/export/subscribers" download className="btn btn-ghost py-1.5 text-sm">Download CSV</a>
        </div>
        {rows.length === 0 ? <Empty title="No subscribers yet" /> : (
          <table className="w-full text-sm">
            <tbody className="divide-y divide-rule">
              {rows.map((s) => (
                <tr key={s.id}><td className="px-4 py-2.5">{s.email}</td><td className="px-3 uppercase text-muted">{s.language}</td><td className="px-3 text-muted">{formatDate(s.created_at, { month: "short" })}</td>
                  <td className="px-4 text-right"><ActionButton className="text-live" confirmText={`Remove ${s.email}?`} run={deleteSubscriber.bind(null, s.id)}>Remove</ActionButton></td></tr>
              ))}
            </tbody>
          </table>
        )}
      </>
    );
  }

  return (
    <div className="max-w-5xl">
      <PageHeader title="Inbox" />
      <nav className="mb-4 flex flex-wrap gap-1" aria-label="Inbox sections">
        {tabs.map((t) => <Link key={t.v} href={`/admin/inbox?tab=${t.v}`} aria-current={t.v === tab ? "page" : undefined} className={`px-3 py-1.5 text-sm font-semibold ${t.v === tab ? "bg-navy-900 text-white dark:bg-gold-400 dark:text-navy-950" : "hover:bg-bg"}`}>{t.l}</Link>)}
      </nav>
      <div className="border border-rule bg-bg">{content}</div>
    </div>
  );
}
