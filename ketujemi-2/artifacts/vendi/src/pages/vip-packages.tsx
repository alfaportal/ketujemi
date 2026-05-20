import { BusinessLandingPage } from "@/pages/business-landing";
import { useStaticPages } from "@/lib/static-pages-i18n";

export default function VipPackagesPage() {
  const { vipPackages } = useStaticPages();
  return <BusinessLandingPage copy={vipPackages} />;
}
