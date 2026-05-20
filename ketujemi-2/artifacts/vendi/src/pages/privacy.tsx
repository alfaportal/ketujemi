import { LuxuryStaticShell } from "@/components/luxury-static-shell";
import { useStaticPages } from "@/lib/static-pages-i18n";

export default function PrivacyPage() {
  const { privacy } = useStaticPages();
  return <LuxuryStaticShell title={privacy.title} tagline={privacy.tagline} />;
}
