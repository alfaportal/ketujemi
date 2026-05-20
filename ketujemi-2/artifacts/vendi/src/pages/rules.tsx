import { SimpleStaticPage } from "@/components/simple-static-page";
import { useStaticPages } from "@/lib/static-pages-i18n";

export default function RulesPage() {
  const { rules } = useStaticPages();
  return <SimpleStaticPage copy={rules} />;
}
