import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <p className="font-serif text-7xl font-semibold text-gold-500">404</p>
      <h1 className="headline mt-4 text-3xl">We couldn&apos;t find that page</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">The story may have moved or the link may be mistyped. Try searching, or head back to the front page.</p>
      <div className="mt-8 flex justify-center gap-3"><Link href="/" className="btn btn-primary">Front page</Link><Link href="/search" className="btn btn-ghost">Search</Link></div>
    </div>
  );
}
