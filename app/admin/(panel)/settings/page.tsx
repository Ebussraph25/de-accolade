import { requirePage } from "@/lib/auth";
import { getSocialLinks } from "@/lib/data";
import { saveSocialLinks } from "../../actions";
import { SimpleForm } from "@/components/admin/SimpleForm";
import { PageHeader, Panel } from "@/components/admin/ui";

export const metadata = { title: "Site settings" };

const fields = [
  { key: "facebook", label: "Facebook page", placeholder: "https://facebook.com/yourpage" },
  { key: "x", label: "X (Twitter)", placeholder: "https://x.com/yourhandle" },
  { key: "youtube", label: "YouTube channel", placeholder: "https://youtube.com/@yourchannel" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourhandle" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@yourhandle" },
  { key: "whatsapp", label: "WhatsApp number", placeholder: "0803 894 2507" },
] as const;

export default async function SettingsPage() {
  await requirePage("editor");
  const links = await getSocialLinks();
  return (
    <div className="max-w-3xl">
      <PageHeader title="Site settings" description="Your social media pages. They appear as 'Follow us' buttons at the bottom of every page and in the header. Leave a box empty to hide that button." />
      <Panel title="Social media">
        <SimpleForm action={saveSocialLinks} resetOnSuccess={false} className="grid gap-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label htmlFor={f.key} className="label">{f.label}</label>
              <input id={f.key} name={f.key} defaultValue={links[f.key]} className="field" placeholder={f.placeholder} inputMode={f.key === "whatsapp" ? "tel" : "url"} />
            </div>
          ))}
          <div><button className="btn btn-primary">Save links</button></div>
        </SimpleForm>
      </Panel>
    </div>
  );
}
