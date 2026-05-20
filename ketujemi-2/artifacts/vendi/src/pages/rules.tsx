import { LuxuryStaticShell } from "@/components/luxury-static-shell";
import { useStaticPages } from "@/lib/static-pages-i18n";

export default function RulesPage() {
  const { rules } = useStaticPages();
  return <LuxuryStaticShell title={rules.title} tagline={rules.tagline} />;
}
