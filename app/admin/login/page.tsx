import type { Metadata } from "next";
import { AuthShell } from "@/components/admin/AuthShell";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

const messages: Record<string, string> = {
  access: "This account doesn't have newsroom access. Ask a super admin to grant you a role.",
  link: "That sign-in link has expired or was already used. Request a new one.",
  signedout: "You've been signed out.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  const next = sp.next?.startsWith("/admin") ? sp.next : "/admin/dashboard";
  return (
    <AuthShell title="Newsroom sign in" subtitle="Use the email address your editor invited.">
      {sp.error && messages[sp.error] && <p role="alert" className="mb-5 border-l-4 border-gold-500 bg-gold-100/60 px-3 py-2 text-sm text-navy-900">{messages[sp.error]}</p>}
      <LoginForm next={next} />
    </AuthShell>
  );
}
