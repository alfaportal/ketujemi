import { StaticPageShell } from "@/components/static-page-shell";
import { LegalPageBody } from "@/components/legal-page-body";
import { useStaticPages } from "@/lib/static-pages-i18n";

export default function TermsPage() {
  const { terms } = useStaticPages();

  return (
    <StaticPageShell title={terms.title} subtitle={terms.subtitle} tagline={terms.tagline}>
      <LegalPageBody copy={terms} />
    </StaticPageShell>
  );
}
