import Link from "next/link";
import { Wordmark } from "../site/Logo";

export function SetupNotice() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Link href="/" className="text-navy-900 dark:text-white"><Wordmark size="sm" /></Link>
      <div className="mt-8 border border-rule bg-bg p-8">
        <h1 className="headline text-3xl">Connect the newsroom database</h1>
        <p className="mt-3 text-muted">The public site is running on sample stories. To sign in and publish, connect Supabase:</p>
        <ol className="mt-5 list-decimal space-y-2 pl-5 text-[0.95rem]">
          <li>Create a Supabase project and run <code className="bg-surface px-1">supabase/migrations/0001_init.sql</code> in its SQL editor.</li>
          <li>Add <code className="bg-surface px-1">NEXT_PUBLIC_SUPABASE_URL</code>, <code className="bg-surface px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and <code className="bg-surface px-1">SUPABASE_SERVICE_ROLE_KEY</code> to the Vercel project&apos;s environment variables.</li>
          <li>Redeploy, create the first account and promote it to super admin (see README, section &ldquo;First admin&rdquo;).</li>
        </ol>
      </div>
    </div>
  );
}
