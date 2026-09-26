"use client";
import Link from "next/link";
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="headline text-3xl">This page didn&apos;t load</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">We couldn&apos;t reach the newsroom just now. Try again in a moment.</p>
      <div className="mt-8 flex justify-center gap-3"><button onClick={reset} className="btn btn-primary">Try again</button><Link href="/" className="btn btn-ghost">Front page</Link></div>
    </div>
  );
}
