import { requirePage, roleLabel } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";
import { formatDate, timeAgo } from "@/lib/format";
import { createStaff, resetStaff2fa } from "../../actions";
import { SimpleForm } from "@/components/admin/SimpleForm";
import { RoleSelect } from "@/components/admin/RoleSelect";
import { ResetPasswordButton } from "@/components/admin/ResetPasswordButton";
import { ActionButton } from "@/components/admin/ActionButton";
import { Notice, PageHeader, Panel } from "@/components/admin/ui";
import type { Role } from "@/lib/types";

export const metadata = { title: "Team & activity" };

type Member = { id: string; full_name: string; role: Role | null; email: string; last_sign_in_at: string | null; created_at: string };

export default async function TeamPage() {
  const me = await requirePage("super_admin");
  const db = await serverClient();
  const [{ data: members, error }, { data: log }] = await Promise.all([
    db.rpc("staff_directory"),
    db.from("activity_log").select("id,action,entity,entity_id,meta,created_at,actor:profiles(full_name)").order("created_at", { ascending: false }).limit(60),
  ]);
  const people = (members ?? []) as Member[];
  const entries = (log ?? []) as unknown as { id: number; action: string; entity: string | null; meta: Record<string, string> | null; created_at: string; actor: { full_name: string } | null }[];
  const describe = (e: (typeof entries)[number]) => {
    const t = e.meta?.title || e.meta?.headline || e.meta?.email || "";
    const map: Record<string, string> = {
      "article.create": "created a story", "article.update": "updated a story", "article.delete": "deleted a story",
      "comment.approved": "approved a comment", "comment.rejected": "rejected a comment", "comment.spam": "marked a comment as spam", "comment.delete": "deleted a comment",
      "breaking.create": "added a breaking headline", "team.invite": "added a team member", "team.role": "changed a role",
      "team.revoke": "removed access for a member", "team.password_reset": "reset a team member's password", "team.2fa_reset": "reset a team member's two-factor authentication",
    };
    return `${map[e.action] ?? e.action}${t ? `: ${t}` : ""}`;
  };

  return (
    <div className="max-w-5xl">
      <PageHeader title="Team & activity" description="Add colleagues and choose what they can do." />
      {error && <Notice tone="error">The team list couldn&apos;t be loaded. Refresh the page to try again.</Notice>}

      <Panel title="Add a team member" className="mb-6">
        <SimpleForm action={createStaff} className="grid gap-3 md:grid-cols-[1fr_1fr_10rem_auto] md:items-end">
          <div><label htmlFor="inv-name" className="label">Full name</label><input id="inv-name" name="full_name" required className="field" /></div>
          <div><label htmlFor="inv-email" className="label">Email</label><input id="inv-email" name="email" type="email" required className="field" /></div>
          <div><label htmlFor="inv-role" className="label">Role</label><select id="inv-role" name="role" className="field" defaultValue="reporter"><option value="reporter">Reporter</option><option value="editor">Editor</option><option value="super_admin">Super admin</option></select></div>
          <button className="btn btn-primary">Create account</button>
        </SimpleForm>
        <p className="mt-3 text-sm text-muted">You&apos;ll get a temporary password to share with them privately (for example on WhatsApp). They sign in at /admin/login and change it under My account.</p>
        <dl className="mt-4 grid gap-2 text-sm text-muted md:grid-cols-3">
          <div><dt className="font-semibold text-fg">Reporter</dt><dd>Writes drafts and submits them for review.</dd></div>
          <div><dt className="font-semibold text-fg">Editor</dt><dd>Publishes, edits any story, uploads media, moderates comments, manages the inbox.</dd></div>
          <div><dt className="font-semibold text-fg">Super admin</dt><dd>Everything, plus team management and the activity log.</dd></div>
        </dl>
      </Panel>

      <Panel title="Newsroom members" className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-sm">
            <thead className="text-left text-muted"><tr><th className="pb-2 font-medium">Name</th><th className="pb-2 font-medium">Email</th><th className="pb-2 font-medium">Last sign-in</th><th className="pb-2 font-medium">Role</th><th className="pb-2" /></tr></thead>
            <tbody className="divide-y divide-rule">
              {people.map((p) => (
                <tr key={p.id} className={p.role ? "" : "text-muted"}>
                  <td className="py-2.5 pr-3 font-medium">{p.full_name}{p.id === me.id && <span className="ml-1 text-xs text-muted">(you)</span>}</td>
                  <td className="pr-3">{p.email}</td>
                  <td className="pr-3">{p.last_sign_in_at ? timeAgo(p.last_sign_in_at) : "Not yet"}</td>
                  <td className="pr-3">{p.id === me.id ? roleLabel[me.role] : <RoleSelect userId={p.id} role={p.role} />}</td>
                  <td className="whitespace-nowrap text-right">{p.id !== me.id && (<span className="inline-flex gap-4"><ResetPasswordButton userId={p.id} name={p.full_name} /><ActionButton className="text-accent" confirmText={`Clear ${p.full_name}'s two-factor authentication? Use this if they lost their phone. They'll set it up again at next sign-in.`} run={resetStaff2fa.bind(null, p.id)}>Reset 2FA</ActionButton></span>)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Activity log">
        {entries.length === 0 ? <p className="text-sm text-muted">No activity recorded yet.</p> : (
          <ul className="divide-y divide-rule text-sm">
            {entries.map((e) => (
              <li key={e.id} className="flex justify-between gap-4 py-2">
                <span><span className="font-semibold">{e.actor?.full_name ?? "Someone"}</span> {describe(e)}</span>
                <time className="shrink-0 text-muted" dateTime={e.created_at} title={formatDate(e.created_at)}>{timeAgo(e.created_at)}</time>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
