import { AuthShell } from "@/components/admin/AuthShell";
import { ForgotForm } from "@/components/admin/ForgotForm";

export const metadata = { title: "Reset password" };

export default function ForgotPage() {
  return (
    <AuthShell title="Reset your password" subtitle="The quickest way: ask your newsroom's super admin to reset it from Team & activity. They'll give you a new temporary password.">
      <p className="mb-4 text-sm text-muted">Or request an email link below. Email links work once the newsroom has set up its email sender.</p>
      <ForgotForm />
    </AuthShell>
  );
}
