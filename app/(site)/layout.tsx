import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BreakingTicker } from "@/components/site/BreakingTicker";
import { DemoNotice } from "@/components/site/DemoNotice";
import { getBreaking } from "@/lib/data";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { hasSupabase } from "@/lib/supabase/env";
import { HtmlLang } from "@/components/site/HtmlLang";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  const breaking = await getBreaking().catch(() => []);
  return (
    <>
      <HtmlLang lang={lang} />
      {!hasSupabase && <DemoNotice />}
      <Header lang={lang} />
      <BreakingTicker items={breaking} label={t(lang).breaking} />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
