import type { Metadata } from "next";
import Link from "next/link";
import { listArticles } from "@/lib/data";
import { BookingForm } from "@/components/forms/BookingForm";
import { StoryCard } from "@/components/news/StoryCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Event Coverage",
  description: "Book De Accolade and Agunjiegbe Online Television to cover your wedding, community event, corporate function, festival or interview.",
  alternates: { canonical: "/event-coverage" },
};

const packages = [
  { name: "Wedding coverage", body: "Traditional and white weddings: photography, highlight video and a published photo story." },
  { name: "Community event coverage", body: "Town union meetings, launches, homecomings and fundraisers, reported for the whole community." },
  { name: "Corporate coverage", body: "Product launches, AGMs, conferences and CSR projects, with press-ready photos and a news report." },
  { name: "Festival coverage", body: "New Yam, masquerade and cultural festivals, documented on camera for broadcast and archive." },
  { name: "Interview coverage", body: "Profile interviews for leaders, entrepreneurs and achievers, filmed and published on our platforms." },
];

const steps = [
  { title: "Send a request", body: "Tell us the date, venue and what you want covered using the form below." },
  { title: "We confirm the details", body: "Our events desk calls you within one working day to agree coverage and a quote." },
  { title: "We cover your event", body: "Our crew arrives early and documents the day in photos and video." },
  { title: "Your story goes live", body: "We publish your story on De Accolade and share highlights on Agunjiegbe Online TV." },
];

export default async function EventCoveragePage() {
  const { items } = await listArticles({ categories: ["events"], limit: 3 });
  return (
    <div>
      <section className="bg-navy-900 text-white dark:bg-navy-950">
        <div className="container-page grid gap-8 py-14 md:grid-cols-[1.3fr_1fr] md:items-end">
          <div>
            <h1 className="headline text-[2.6rem] leading-[1.05] md:text-[3.6rem]">Your occasion, told as a story worth keeping</h1>
            <p className="mt-4 max-w-xl font-serif text-xl text-white/80">From weddings to festivals, our events desk photographs, films and publishes your event for the community at home and abroad.</p>
          </div>
          <div className="flex gap-3 md:justify-end">
            <a href="#book" className="btn btn-gold">Request coverage</a>
            <Link href="/events" className="btn border border-white/30 text-white hover:border-gold-400">See our coverage</Link>
          </div>
        </div>
      </section>

      <section className="container-page mt-14">
        <SectionHeading title="Coverage packages" />
        <ul className="grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((p) => (
            <li key={p.name} className="bg-bg p-6">
              <h2 className="headline text-[1.35rem]">{p.name}</h2>
              <p className="mt-2 text-muted">{p.body}</p>
            </li>
          ))}
          <li className="flex flex-col justify-center bg-gold-100/50 p-6 dark:bg-surface">
            <p className="font-semibold">Pricing</p>
            <p className="mt-1 text-muted">Every event is different. We quote based on duration, location and deliverables.</p>
          </li>
        </ul>
      </section>

      <section className="container-page mt-14">
        <SectionHeading title="How booking works" />
        <ol className="grid gap-8 md:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title}>
              <span className="font-serif text-4xl font-semibold text-gold-500">{i + 1}</span>
              <h3 className="mt-2 font-semibold">{s.title}</h3>
              <p className="mt-1 text-[0.95rem] text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="book" className="container-page mt-16 grid gap-10 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <h2 className="section-rule headline pt-3 text-[1.9rem]">Request coverage</h2>
          <p className="mt-3 text-muted">Tell us about your event. There is no obligation until you approve a quote.</p>
          <dl className="mt-6 space-y-3 text-sm">
            <div><dt className="font-semibold">Email</dt><dd><a className="text-link underline" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a></dd></div>
            {site.contactPhone && <div><dt className="font-semibold">Phone</dt><dd><a className="text-link underline" href={`tel:${site.contactPhone}`}>{site.contactPhone}</a></dd></div>}
          </dl>
        </div>
        <div className="border border-rule p-6 md:p-8"><BookingForm /></div>
      </section>

      {items.length > 0 && (
        <section className="container-page mt-16">
          <SectionHeading title="Recent event coverage" href="/events" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{items.map((a) => <StoryCard key={a.id} a={a} />)}</div>
        </section>
      )}
    </div>
  );
}
