import { BusinessLandingPage } from "@/pages/business-landing";
import { useStaticPages } from "@/lib/static-pages-i18n";

export default function PartnershipPage() {
  const { partnership } = useStaticPages();
  return <BusinessLandingPage copy={partnership} />;
}
