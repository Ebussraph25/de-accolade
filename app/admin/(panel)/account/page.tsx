import Link from "next/link";
import { requirePage, roleLabel } from "@/lib/auth";
import { updateProfile } from "../../actions";
import { SimpleForm } from "@/components/admin/SimpleForm";
import { PasswordForm } from "@/components/admin/PasswordForm";
import { MfaSetup } from "@/components/admin/MfaSetup";
import { Notice, PageHeader, Panel } from "@/components/admin/ui";

export const metadata = { title: "My account" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ setup2fa?: string }> }) {
  const me = await requirePage();
  const setup = (await searchParams).setup2fa === "1";
  return (
    <div className="max-w-3xl">
      <PageHeader title="My account" description={`${me.email} · ${roleLabel[me.role]}`} />
      {setup && <Notice tone="error">Your newsroom requires two-factor authentication. Set it up below to continue.</Notice>}
      <div className="grid gap-6">
        <Panel title="Two-factor authentication"><MfaSetup highlight={setup} /></Panel>
        <Panel title="Author profile" action={me.slug ? <Link href={`/author/${me.slug}`} target="_blank" className="text-sm text-accent hover:underline">View public page</Link> : undefined}>
          <SimpleForm action={updateProfile} resetOnSuccess={false} className="grid gap-4">
            <div><label htmlFor="full_name" className="label">Display name</label><input id="full_name" name="full_name" defaultValue={me.full_name} required className="field" /></div>
            <div><label htmlFor="bio" className="label">Short bio</label><textarea id="bio" name="bio" defaultValue={me.bio ?? ""} rows={3} maxLength={600} className="field" placeholder="Shown on your author page" /></div>
            <div><label htmlFor="avatar_url" className="label">Photo URL <span className="font-normal text-muted">(optional)</span></label><input id="avatar_url" name="avatar_url" type="url" defaultValue={me.avatar_url ?? ""} className="field" /></div>
            <div><button className="btn btn-primary">Save profile</button></div>
          </SimpleForm>
        </Panel>
        <Panel title="Change password"><PasswordForm /></Panel>
      </div>
    </div>
  );
}
