import { SimpleStaticPage } from "@/components/simple-static-page";
import { useStaticPages } from "@/lib/static-pages-i18n";

export default function CookiesPage() {
  const { cookies } = useStaticPages();
  return <SimpleStaticPage copy={cookies} />;
}
