import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { StaticPageBackLink } from "@/components/static-page-back-link";
import { ShopApplicationForm } from "@/components/shop-application-form";
import { useAuth, loginUrlWithReturn } from "@/lib/auth-context";
import { useMarket } from "@/lib/market-context";
import { useShopFormCopy } from "@/lib/shop-application-i18n";
import { openShopApplyPath } from "@/lib/static-page-paths";

export default function HapShitoreAplikoPage() {
  const c = useShopFormCopy();
  const { user, loading: authLoading } = useAuth();
  const { uiLang } = useMarket();
  const applyPath = openShopApplyPath(uiLang);

  useEffect(() => {
    document.title = c.applyDocTitle;
  }, [c.applyDocTitle]);

  useEffect(() => {
    if (authLoading || user) return;
    window.location.href = loginUrlWithReturn(applyPath);
  }, [authLoading, user, applyPath]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#f0f4f9] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f9]">
      <SiteHeader />
      <div className="max-w-4xl mx-auto px-4 pt-3 sm:pt-4">
        <StaticPageBackLink />
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 pt-6">
        <ShopApplicationForm />
      </div>
    </div>
  );
}
