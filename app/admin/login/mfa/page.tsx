import { AuthShell } from "@/components/admin/AuthShell";
import { MfaChallenge } from "@/components/admin/MfaChallenge";

export const metadata = { title: "Two-factor verification" };

export default function MfaPage() {
  return (
    <AuthShell title="Enter your code" subtitle="Open your authenticator app and enter the 6-digit code for De Accolade.">
      <MfaChallenge />
    </AuthShell>
  );
}
