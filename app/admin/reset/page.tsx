import { AuthShell } from "@/components/admin/AuthShell";
import { PasswordForm } from "@/components/admin/PasswordForm";

export const metadata = { title: "Choose a password" };

export default function ResetPage() {
  return (
    <AuthShell title="Choose a password" subtitle="Use at least 10 characters. A short sentence is easy to remember and hard to guess.">
      <PasswordForm redirectTo="/admin/dashboard" />
    </AuthShell>
  );
}
