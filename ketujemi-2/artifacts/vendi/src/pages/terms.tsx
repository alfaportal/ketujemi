import { InfoStaticPage } from "@/components/info-static-page";
import { useStaticPages } from "@/lib/static-pages-i18n";

export default function TermsPage() {
  const { terms } = useStaticPages();
  return <InfoStaticPage copy={terms} />;
}
