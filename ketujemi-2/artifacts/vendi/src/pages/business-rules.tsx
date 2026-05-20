import { LuxuryStaticShell } from "@/components/luxury-static-shell";
import { LegalPageBody } from "@/components/legal-page-body";
import { useStaticPages } from "@/lib/static-pages-i18n";

export default function BusinessRulesPage() {
  const { businessRules } = useStaticPages();

  return (
    <LuxuryStaticShell title={businessRules.title} tagline={businessRules.tagline}>
      <LegalPageBody copy={businessRules} />
    </LuxuryStaticShell>
  );
}
