import { FaqAccordion } from "@/components/faq-accordion";
import { LuxuryStaticShell } from "@/components/luxury-static-shell";
import { useStaticPages } from "@/lib/static-pages-i18n";

export default function FaqPage() {
  const { faq } = useStaticPages();

  return (
    <LuxuryStaticShell title={faq.title} tagline={faq.tagline}>
      <FaqAccordion items={faq.featured} />
    </LuxuryStaticShell>
  );
}
