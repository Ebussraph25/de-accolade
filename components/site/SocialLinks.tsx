import { site } from "@/lib/site";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon, XIcon, YouTubeIcon } from "./Icons";

export function SocialLinks({ className = "" }: { className?: string }) {
  const wa = site.whatsapp ? `https://wa.me/${site.whatsapp.replace(/\D/g, "")}` : "";
  const links = [
    { href: site.social.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: site.social.youtube, label: "YouTube", Icon: YouTubeIcon },
    { href: site.social.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: site.social.tiktok, label: "TikTok", Icon: TikTokIcon },
    { href: site.social.x, label: "X", Icon: XIcon },
    { href: wa, label: "WhatsApp", Icon: WhatsAppIcon },
  ].filter((l) => l.href);
  return (
    <ul className={className}>
      {links.map(({ href, label, Icon }) => (
        <li key={label}>
          <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`De Accolade on ${label}`} className="block opacity-85 hover:text-gold-400 hover:opacity-100">
            <Icon />
          </a>
        </li>
      ))}
    </ul>
  );
}
