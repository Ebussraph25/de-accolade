import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of use", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <div className="container-page max-w-3xl pt-10">
      <h1 className="section-rule headline pt-4 text-[2.4rem]">Terms of use</h1>
      <p className="mt-2 text-sm text-muted">These terms should be reviewed by {site.fullName}&apos;s legal adviser before launch.</p>
      <div className="article-body mt-8">
        <p>By using this website you agree to these terms.</p>
        <h2>Our content</h2>
        <p>Articles, photographs, video and graphics on this site belong to {site.fullName}, {site.parent} or their licensors. You may share links and short quotations with attribution. Please contact us before republishing.</p>
        <h2>Comments and submissions</h2>
        <p>You are responsible for what you post. We moderate comments and may remove anything that is abusive, defamatory, unlawful, spam or off-topic. By submitting a story tip or photo you confirm you have the right to share it.</p>
        <h2>Corrections</h2>
        <p>We aim to be accurate. If you believe something we published is wrong, contact the newsroom and we will review it promptly.</p>
        <h2>Sponsored content</h2>
        <p>Paid or sponsored content is always labelled and kept separate from our independent news coverage.</p>
        <h2>Contact</h2>
        <p>Questions about these terms: <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.</p>
      </div>
    </div>
  );
}
