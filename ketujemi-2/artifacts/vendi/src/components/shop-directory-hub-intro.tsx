import { useShopDirectoryCopy } from "@/lib/shop-directory-i18n";

export function ShopDirectoryHubIntro() {
  const d = useShopDirectoryCopy();

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
      <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug mb-4">
        {d.introTitle}
      </h1>
      <div className="space-y-3 text-sm sm:text-base text-gray-700 leading-relaxed">
        <p>{d.introP1}</p>
        <p>{d.introP2}</p>
        <p>{d.introP3}</p>
      </div>
    </section>
  );
}
