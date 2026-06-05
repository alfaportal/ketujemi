import { Link } from "wouter";
import { BRAND_BLUE, BRAND_ORANGE } from "@/lib/brand-colors";
import { useShopDirectoryCopy } from "@/lib/shop-directory-i18n";

export function ShopDirectoryHomeBanner() {
  const d = useShopDirectoryCopy();

  return (
    <section className="w-full px-4 sm:px-6 py-6 sm:py-8">
      <div
        className="max-w-7xl mx-auto rounded-2xl sm:rounded-3xl overflow-hidden text-white p-6 sm:p-10 shadow-lg"
        style={{ background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, ${BRAND_ORANGE} 100%)` }}
      >
        <div className="max-w-2xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight">{d.homeBannerTitle}</h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-white/90 leading-relaxed">{d.homeBannerSubtitle}</p>
          <Link
            href="/dyqanet"
            className="mt-4 sm:mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 text-sm sm:text-base font-black text-blue-700 hover:bg-blue-50 transition-colors"
          >
            {d.homeBannerBtn}
          </Link>
        </div>
      </div>
    </section>
  );
}
