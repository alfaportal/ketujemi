import { BusinessLandingPage } from "@/pages/business-landing";
import { useStaticPages } from "@/lib/static-pages-i18n";

export default function AdvertisePage() {
  const { advertise } = useStaticPages();
  return <BusinessLandingPage copy={advertise} />;
}
