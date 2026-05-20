import { StaticPageShell } from "@/components/static-page-shell";
import { LegalPageBody } from "@/components/legal-page-body";
import { useStaticPages } from "@/lib/static-pages-i18n";
import { CardPaymentsPanel } from "@/components/card-payments-panel";

export default function BusinessRulesPage() {
  const { businessRules } = useStaticPages();

  return (
    <StaticPageShell
      title={businessRules.title}
      subtitle={businessRules.subtitle}
      tagline={businessRules.tagline}
    >
      <CardPaymentsPanel className="mb-6" />
      <LegalPageBody copy={businessRules} />
    </StaticPageShell>
  );
}
