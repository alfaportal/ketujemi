import { InfoStaticPage } from "@/components/info-static-page";
import { useStaticPages } from "@/lib/static-pages-i18n";

export default function RulesPage() {
  const { rules } = useStaticPages();
  return <InfoStaticPage copy={rules} />;
}
