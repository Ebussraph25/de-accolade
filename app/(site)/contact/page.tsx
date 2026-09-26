import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/forms/ContactForm";
import { SocialLinks } from "@/components/site/SocialLinks";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the De Accolade newsroom with story tips, corrections, partnership and advertising enquiries.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="container-page grid max-w-5xl gap-12 pt-10 md:grid-cols-[1fr_1.5fr]">
      <div>
        <h1 className="section-rule headline pt-4 text-[2.4rem] md:text-[3rem]">Contact the newsroom</h1>
        <p className="mt-4 font-serif text-lg text-muted">Got a story, a correction or an idea? We read every message.</p>
        <dl className="mt-8 space-y-5">
          <div><dt className="font-semibold">Email</dt><dd><a className="text-link underline decoration-gold-500 underline-offset-2" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a></dd></div>
          {site.contactPhone && <div><dt className="font-semibold">Phone</dt><dd><a className="text-link underline" href={`tel:${site.contactPhone}`}>{site.contactPhone}</a></dd></div>}
          {site.whatsapp && <div><dt className="font-semibold">WhatsApp</dt><dd><a className="text-link underline" href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`}>Message us on WhatsApp</a></dd></div>}
          <div><dt className="font-semibold">Event coverage</dt><dd><Link href="/event-coverage" className="text-link underline">Book our events desk</Link></dd></div>
          <div><dt className="font-semibold">Advertising</dt><dd><Link href="/advertise" className="text-link underline">Advertising options</Link></dd></div>
        </dl>
        <SocialLinks className="mt-8 flex gap-4 text-navy-900 dark:text-white" />
      </div>
      <div className="border border-rule p-6 md:mt-4 md:p-8"><ContactForm /></div>
    </div>
  );
}
