import { AuthShell } from "@/components/admin/AuthShell";
import { ForgotForm } from "@/components/admin/ForgotForm";

export const metadata = { title: "Reset password" };

export default function ForgotPage() {
  return (
    <AuthShell title="Reset your password" subtitle="We'll email you a link to choose a new password.">
      <ForgotForm />
    </AuthShell>
  );
}
