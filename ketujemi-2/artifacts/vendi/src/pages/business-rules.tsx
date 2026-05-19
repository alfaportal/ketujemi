import { StaticPageShell } from "@/components/static-page-shell";
import { LegalPageBody } from "@/components/legal-page-body";
import { useStaticPages } from "@/lib/static-pages-i18n";

export default function BusinessRulesPage() {
  const { businessRules } = useStaticPages();

  return (
    <StaticPageShell
      title={businessRules.title}
      subtitle={businessRules.subtitle}
      tagline={businessRules.tagline}
    >
      <LegalPageBody copy={businessRules} />
    </StaticPageShell>
  );
}
