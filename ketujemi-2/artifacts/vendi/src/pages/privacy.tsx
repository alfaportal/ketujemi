import { InfoStaticPage } from "@/components/info-static-page";
import { useStaticPages } from "@/lib/static-pages-i18n";

export default function PrivacyPage() {
  const { privacy } = useStaticPages();
  return <InfoStaticPage copy={privacy} />;
}
