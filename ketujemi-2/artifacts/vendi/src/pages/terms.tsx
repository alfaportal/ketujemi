import { LuxuryStaticShell } from "@/components/luxury-static-shell";
import { useStaticPages } from "@/lib/static-pages-i18n";

export default function TermsPage() {
  const { terms } = useStaticPages();
  return <LuxuryStaticShell title={terms.title} tagline={terms.tagline} />;
}
