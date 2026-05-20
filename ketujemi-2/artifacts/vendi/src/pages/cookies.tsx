import { LuxuryStaticShell } from "@/components/luxury-static-shell";
import { useStaticPages } from "@/lib/static-pages-i18n";

export default function CookiesPage() {
  const { cookies } = useStaticPages();
  return <LuxuryStaticShell title={cookies.title} tagline={cookies.tagline} />;
}
