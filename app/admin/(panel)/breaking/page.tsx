import { requirePage } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/format";
import { addBreaking, setBreakingActive } from "../../actions";
import { ActionButton } from "@/components/admin/ActionButton";
import { SimpleForm } from "@/components/admin/SimpleForm";
import { Empty, PageHeader, Panel } from "@/components/admin/ui";

export const metadata = { title: "Breaking ticker" };

export default async function BreakingPage() {
  await requirePage("editor");
  const db = await serverClient();
  const { data } = await db.from("breaking_news").select("id,headline,link,active,created_at").order("created_at", { ascending: false }).limit(50);
  const rows = (data ?? []) as { id: string; headline: string; link: string | null; active: boolean; created_at: string }[];
  return (
    <div className="max-w-4xl">
      <PageHeader title="Breaking news ticker" description="Headlines scroll across the top of every page while they are live." />
      <Panel title="Add a headline" className="mb-6">
        <SimpleForm action={addBreaking} className="grid gap-3">
          <div><label htmlFor="headline" className="label">Headline</label><input id="headline" name="headline" required maxLength={200} className="field" placeholder="Community leader launches youth empowerment initiative in Anambra" /></div>
          <div><label htmlFor="link" className="label">Link <span className="font-normal text-muted">(optional)</span></label><input id="link" name="link" className="field" placeholder="/article/story-slug" /></div>
          <div><button className="btn btn-primary">Add to ticker</button></div>
        </SimpleForm>
      </Panel>
      <div className="border border-rule bg-bg">
        {rows.length === 0 ? <Empty title="The ticker is empty" body="Add a headline above and it will appear across the site." /> : (
          <ul className="divide-y divide-rule">
            {rows.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className={`font-medium ${b.active ? "" : "text-muted line-through"}`}>{b.headline}</p>
                  <p className="text-xs text-muted">{b.link ?? "No link"} · added {timeAgo(b.created_at)}</p>
                </div>
                <div className="flex gap-4">
                  <ActionButton run={setBreakingActive.bind(null, b.id, !b.active)}>{b.active ? "Take down" : "Put live"}</ActionButton>
                  <ActionButton className="text-live" confirmText="Delete this headline?" run={setBreakingActive.bind(null, b.id, "delete")}>Delete</ActionButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
