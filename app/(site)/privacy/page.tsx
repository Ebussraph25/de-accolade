import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy policy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <div className="container-page max-w-3xl pt-10">
      <h1 className="section-rule headline pt-4 text-[2.4rem]">Privacy policy</h1>
      <p className="mt-2 text-sm text-muted">This policy should be reviewed by {site.fullName}&apos;s legal adviser before launch, including for compliance with the Nigeria Data Protection Act 2023.</p>
      <div className="article-body mt-8">
        <p>{site.fullName} (&ldquo;we&rdquo;) respects your privacy. This policy explains what we collect when you use this website and how we use it.</p>
        <h2>What we collect</h2>
        <ul>
          <li><strong>Newsletter:</strong> your email address and preferred language, to send you our newsletter.</li>
          <li><strong>Contact and booking forms:</strong> the name, email, phone number and message you submit, to reply to you.</li>
          <li><strong>Comments:</strong> your name and comment (published after moderation) and your email (never published).</li>
          <li><strong>Usage data:</strong> anonymous, aggregated analytics about pages viewed, to improve the site.</li>
        </ul>
        <h2>How we use it</h2>
        <p>We use your information only for the purpose you gave it. We do not sell your personal data. Service providers who host our website and database process data on our behalf under contract.</p>
        <h2>Cookies and storage</h2>
        <p>We store your language and light/dark display preference on your device. Analytics services may set cookies to measure readership.</p>
        <h2>Your rights</h2>
        <p>You can ask us to access, correct or delete your personal data, or unsubscribe at any time, by emailing <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.</p>
      </div>
    </div>
  );
}
