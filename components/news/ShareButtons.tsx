"use client";
import { useState } from "react";
import { FacebookIcon, LinkIcon, WhatsAppIcon, XIcon } from "../site/Icons";

export function ShareButtons({ url, title, label = "Share this story" }: { url: string; title: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url), tt = encodeURIComponent(title);
  const links = [
    { name: "WhatsApp", href: `https://wa.me/?text=${tt}%20${u}`, Icon: WhatsAppIcon },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, Icon: FacebookIcon },
    { name: "X", href: `https://x.com/intent/post?text=${tt}&url=${u}`, Icon: XIcon },
  ];
  const btn = "inline-flex h-10 w-10 items-center justify-center border border-rule hover:border-navy-900 hover:bg-navy-900 hover:text-white dark:hover:border-gold-400 dark:hover:bg-gold-400 dark:hover:text-navy-950";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-semibold">{label}</span>
      {links.map(({ name, href, Icon }) => (
        <a key={name} href={href} target="_blank" rel="noopener noreferrer" className={btn} aria-label={`Share on ${name}`}><Icon className="h-4 w-4" /></a>
      ))}
      <button type="button" className={btn} aria-label="Copy link"
        onClick={async () => {
          try {
            if (navigator.share && window.matchMedia("(pointer: coarse)").matches) { await navigator.share({ title, url }); return; }
            await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000);
          } catch { /* user cancelled */ }
        }}>
        <LinkIcon className="h-4 w-4" />
      </button>
      <span role="status" className="text-sm text-accent">{copied ? "Link copied" : ""}</span>
    </div>
  );
}
