import { InfoStaticPage } from "@/components/info-static-page";
import { useStaticPages } from "@/lib/static-pages-i18n";

export default function CookiesPage() {
  const { cookies } = useStaticPages();
  return <InfoStaticPage copy={cookies} />;
}
