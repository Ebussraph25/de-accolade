import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { BrandMark } from "@/components/site/Logo";

export const metadata: Metadata = {
  title: "About us",
  description: `${site.fullName} is a community-driven digital newspaper and a subsidiary of ${site.parent}.`,
  alternates: { canonical: "/about" },
};

const coverage = ["Reliable local news", "Community updates", "Breaking stories", "Cultural heritage", "Interviews", "Human-interest stories", "Sports", "Entertainment", "Event coverage"];

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-navy-900 text-white dark:bg-navy-950">
        <BrandMark tone="onDark" className="pointer-events-none absolute -right-10 top-6 h-[22rem] w-auto opacity-10" />
        <div className="container-page relative max-w-4xl py-16">
          <h1 className="headline text-[2.6rem] md:text-[3.6rem]">{site.tagline}</h1>
          <p className="mt-5 max-w-2xl font-serif text-xl leading-relaxed text-white/80">
            {site.fullName} is a digital newspaper and storytelling platform from {site.parent}. We bring the credibility of traditional journalism to the way people read, watch and share news today.
          </p>
        </div>
      </section>
      <div className="container-page grid max-w-5xl gap-12 pt-14 md:grid-cols-[1fr_16rem]">
        <div className="article-body">
          <h2>What we do</h2>
          <p>We report the stories that shape our communities: local news, development, business, education and health, alongside the culture and heritage that make each community distinct. Our reporting is published in English, with Igbo, Yoruba and Hausa editions reviewed by our editors.</p>
          <h2>Why we exist</h2>
          <p>Too many communities only make the news when something goes wrong. De Accolade exists to amplify community voices, celebrate achievement, document heritage for the next generation, and hold leaders to account with fair, accurate reporting.</p>
          <h2>Our standards</h2>
          <p>We verify before we publish, correct mistakes openly, keep sponsored content clearly labelled and separate from news, and give people the chance to respond to stories about them. To report an error, <Link href="/contact">contact the newsroom</Link>.</p>
          <h2>Part of {site.parent}</h2>
          <p>De Accolade works alongside {site.parent}, whose video reporting, interviews and documentaries appear throughout this site. <a href={site.youtube.handleUrl}>Watch the channel on YouTube</a>.</p>
        </div>
        <aside>
          <h2 className="border-t-2 border-gold-500 pt-3 font-semibold">What we cover</h2>
          <ul className="mt-3 space-y-2 text-[0.95rem] text-muted">{coverage.map((c) => <li key={c}>{c}</li>)}</ul>
          <div className="mt-8 grid gap-3">
            <Link href="/contact" className="btn btn-primary">Share a story tip</Link>
            <Link href="/event-coverage" className="btn btn-ghost">Book event coverage</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
