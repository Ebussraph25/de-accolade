import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/ContactForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Advertise with us",
  description: "Banner advertising, sponsored stories, business promotion and brand partnerships on De Accolade Magazine.",
  alternates: { canonical: "/advertise" },
};

const options = [
  { name: "Display banners", body: "Homepage leaderboard, in-article and sidebar placements across every section." },
  { name: "Sponsored stories", body: "Clearly labelled features about your business, product or event, written with our editors." },
  { name: "Business promotion", body: "Spotlight companies, products and events to readers at home and in the diaspora." },
  { name: "Brand partnerships", body: "Sponsor a section, a festival series or a video programme on Agunjiegbe Online TV." },
];

export default function AdvertisePage() {
  return (
    <div className="container-page max-w-5xl pt-10">
      <h1 className="section-rule headline pt-4 text-[2.4rem] md:text-[3rem]">Advertise with De Accolade</h1>
      <p className="mt-4 max-w-2xl font-serif text-xl text-muted">Put your brand in front of an engaged community audience across our website, newsletter and {site.parent}.</p>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2">
        {options.map((o) => (
          <li key={o.name} className="border-t-2 border-gold-500 pt-4">
            <h2 className="headline text-xl">{o.name}</h2>
            <p className="mt-1.5 text-muted">{o.body}</p>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-muted">All sponsored content is labelled. Advertisers do not influence our news coverage.</p>
      <section className="mt-12 border border-rule p-6 md:p-8">
        <h2 className="headline mb-1 text-2xl">Request our media kit</h2>
        <p className="mb-6 text-muted">Tell us what you would like to promote and we&apos;ll send rates and availability.</p>
        <ContactForm />
      </section>
    </div>
  );
}
