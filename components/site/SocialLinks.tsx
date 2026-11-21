import { getSocialLinks, type SocialKey } from "@/lib/data";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon, XIcon, YouTubeIcon } from "./Icons";

const meta: { key: SocialKey; label: string; Icon: (p: { className?: string }) => React.JSX.Element; bg: string }[] = [
  { key: "facebook", label: "Facebook", Icon: FacebookIcon, bg: "bg-[#1877F2]" },
  { key: "x", label: "X", Icon: XIcon, bg: "bg-black ring-1 ring-white/25" },
  { key: "youtube", label: "YouTube", Icon: YouTubeIcon, bg: "bg-[#FF0000]" },
  { key: "instagram", label: "Instagram", Icon: InstagramIcon, bg: "bg-[linear-gradient(45deg,#F58529,#DD2A7B_55%,#8134AF)]" },
  { key: "tiktok", label: "TikTok", Icon: TikTokIcon, bg: "bg-black ring-1 ring-white/25" },
  { key: "whatsapp", label: "WhatsApp", Icon: WhatsAppIcon, bg: "bg-[#25D366]" },
];

async function activeLinks() {
  const links = await getSocialLinks().catch(() => null);
  if (!links) return [];
  return meta
    .map((m) => ({ ...m, href: m.key === "whatsapp" ? (links.whatsapp ? `https://wa.me/${links.whatsapp.replace(/\D/g, "")}` : "") : links[m.key] }))
    .filter((m) => m.href);
}

/** Small single-colour icons (header, contact page). */
export async function SocialLinks({ className = "" }: { className?: string }) {
  const links = await activeLinks();
  return (
    <ul className={className}>
      {links.map(({ href, label, Icon }) => (
        <li key={label}>
          <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`De Accolade Magazine Hub on ${label}`} className="block opacity-85 hover:text-gold-400 hover:opacity-100">
            <Icon />
          </a>
        </li>
      ))}
    </ul>
  );
}

/** "Follow us" row of brand-coloured buttons for the footer. */
export async function FollowUs() {
  const links = await activeLinks();
  if (!links.length) return null;
  return (
    <section aria-labelledby="follow-us" className="border-t border-white/10">
      <div className="container-page py-8 text-center">
        <h2 id="follow-us" className="font-sans text-sm font-bold uppercase tracking-[0.2em] text-white">Follow us</h2>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-4">
          {links.map(({ href, label, Icon, bg }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow De Accolade Magazine Hub on ${label}`}
                title={label}
                className={`grid h-12 w-12 place-items-center rounded-xl text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400 ${bg}`}
              >
                <Icon className="h-6 w-6" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
