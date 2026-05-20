import { InfoStaticPage } from "@/components/info-static-page";
import { useStaticPages } from "@/lib/static-pages-i18n";

export default function AboutPage() {
  const { about } = useStaticPages();
  return <InfoStaticPage copy={about} />;
}
