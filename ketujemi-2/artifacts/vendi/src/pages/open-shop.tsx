import { BusinessLandingPage } from "@/pages/business-landing";
import { useStaticPages } from "@/lib/static-pages-i18n";

export default function OpenShopPage() {
  const { openShop } = useStaticPages();
  return <BusinessLandingPage copy={openShop} />;
}
