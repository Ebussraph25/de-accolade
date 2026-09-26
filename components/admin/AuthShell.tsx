import Link from "next/link";
import { Wordmark } from "../site/Logo";

export function AuthShell({ title, children, subtitle }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-navy-900 p-12 text-white lg:flex">
        <Link href="/" className="text-white"><Wordmark size="sm" /></Link>
        <div>
          <p className="headline text-4xl leading-tight">Your Voice. Our Community. Our Story.</p>
          <p className="mt-3 text-white/70">De Accolade newsroom: write, edit and publish.</p>
        </div>
        <p className="text-sm text-white/50">Authorised staff only. Activity is logged.</p>
      </div>
      <div className="flex items-center justify-center bg-bg px-4 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-10 block text-navy-900 lg:hidden dark:text-white"><Wordmark size="sm" /></Link>
          <h1 className="headline text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
