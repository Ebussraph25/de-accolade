import Link from "next/link";
import { requirePage } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";
import { adPlacements, type AdPlacement } from "@/lib/ads";
import { addAdvert, setAdvertActive } from "../../actions";
import { ActionButton } from "@/components/admin/ActionButton";
import { AdvertForm } from "@/components/admin/AdvertForm";
import { Empty, PageHeader, Panel } from "@/components/admin/ui";

export const metadata = { title: "Adverts" };

type Row = { id: string; advertiser: string; image_url: string; link: string | null; placement: AdPlacement; start_date: string | null; end_date: string | null; active: boolean };

const lagosToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date());
const showDate = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function status(a: Row, today: string) {
  if (!a.active) return { label: "Paused", cls: "bg-rule text-muted" };
  if (a.start_date && a.start_date > today) return { label: `Starts ${showDate(a.start_date)}`, cls: "bg-gold-100 text-navy-900" };
  if (a.end_date && a.end_date < today) return { label: "Ended", cls: "bg-rule text-muted" };
  return { label: "Live now", cls: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" };
}

export default async function AdvertsPage() {
  await requirePage("editor");
  const db = await serverClient();
  const { data } = await db.from("adverts").select("id,advertiser,image_url,link,placement,start_date,end_date,active").order("created_at", { ascending: false }).limit(100);
  const rows = (data ?? []) as Row[];
  const today = lagosToday();
  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Adverts"
        description="Upload an advertiser's banner, choose where it shows and for how long. Until an advert is live in a spot, that spot shows a 'Reach our community' notice linking to your Advertise page."
      />
      <Panel title="Add an advert" className="mb-6">
        <AdvertForm action={addAdvert} />
      </Panel>

      <Panel title="Where adverts appear" className="mb-6">
        <ul className="grid gap-3 text-sm sm:grid-cols-3">
          {(Object.keys(adPlacements) as AdPlacement[]).map((k) => (
            <li key={k} className="border border-rule p-3">
              <p className="font-semibold">{adPlacements[k].label}</p>
              <p className="text-muted">{adPlacements[k].where}.</p>
              <p className="mt-1">Size: {adPlacements[k].size}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">If several adverts are live in the same spot, they take turns: each visitor sees one at random.</p>
      </Panel>

      <div className="border border-rule bg-bg">
        {rows.length === 0 ? <Empty title="No adverts yet" body="Add your first advert above. It appears on the site within a minute." /> : (
          <ul className="divide-y divide-rule">
            {rows.map((a) => {
              const s = status(a, today);
              return (
                <li key={a.id} className="flex flex-wrap items-center gap-4 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.image_url} alt="" className="h-16 w-28 shrink-0 border border-rule object-contain" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{a.advertiser} <span className={`ml-2 inline-block rounded px-2 py-0.5 text-xs font-semibold ${s.cls}`}>{s.label}</span></p>
                    <p className="text-xs text-muted">
                      {adPlacements[a.placement].label}
                      {" · "}{a.start_date ? showDate(a.start_date) : "From the start"} to {a.end_date ? showDate(a.end_date) : "no end date"}
                      {a.link && <> · <Link href={a.link} target="_blank" className="underline">link</Link></>}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <ActionButton run={setAdvertActive.bind(null, a.id, !a.active)}>{a.active ? "Pause" : "Resume"}</ActionButton>
                    <ActionButton className="text-live" confirmText={`Delete the ${a.advertiser} advert?`} run={setAdvertActive.bind(null, a.id, "delete")}>Delete</ActionButton>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
