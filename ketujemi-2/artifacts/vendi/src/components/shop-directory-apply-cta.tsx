import { useShopDirectoryCopy } from "@/lib/shop-directory-i18n";
import { useAuth, loginUrlWithReturn } from "@/lib/auth-context";
import { useMarket } from "@/lib/market-context";
import { openShopApplyPath } from "@/lib/static-page-paths";
import { BRAND_BLUE, BRAND_ORANGE } from "@/lib/brand-colors";
import { cn } from "@/lib/utils";

export function ShopDirectoryApplyCta() {
  const d = useShopDirectoryCopy();
  const { user } = useAuth();
  const { uiLang } = useMarket();
  const applyPath = openShopApplyPath(uiLang);

  function handleApply() {
    if (!user) {
      window.location.href = loginUrlWithReturn(applyPath);
      return;
    }
    window.location.href = applyPath;
  }

  return (
    <section className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-orange-50 p-5 sm:p-6 shadow-sm text-center">
      <p className="text-base sm:text-lg font-bold text-gray-900">{d.introApplyTitle}</p>
      <p className="mt-2 text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
        {d.introApplyText}
      </p>
      <button
        type="button"
        onClick={handleApply}
        className={cn(
          "mt-5 inline-flex items-center justify-center min-h-[3.25rem] px-8 py-3 rounded-2xl",
          "text-base sm:text-lg font-black text-white shadow-lg ring-2 ring-blue-200/80",
          "hover:opacity-95 active:scale-[0.98] transition-all touch-manipulation",
        )}
        style={{ background: `linear-gradient(90deg, ${BRAND_ORANGE}, ${BRAND_BLUE})` }}
      >
        {d.introApplyBtn}
      </button>
    </section>
  );
}
