import { LuxuryStaticShell } from "@/components/luxury-static-shell";
import { useStaticPages } from "@/lib/static-pages-i18n";

export default function AboutPage() {
  const { about } = useStaticPages();
  return <LuxuryStaticShell title={about.title} tagline={about.tagline} />;
}
