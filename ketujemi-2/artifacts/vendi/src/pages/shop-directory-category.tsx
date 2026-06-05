import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { StaticPageBackLink } from "@/components/static-page-back-link";
import { ShopDirectoryCard, type ShopDirectoryListItem } from "@/components/shop-directory-card";
import {
  CategoryPhotoPickerCard,
  CategoryPhotoPickerGrid,
} from "@/components/category-photo-picker";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { applyPageMeta } from "@/lib/page-meta";
import { shopDirectoryCategoryImageUrl } from "@/lib/shop-directory-category-images";
import { shopDirectorySubcategoryImageUrl } from "@/lib/shop-directory-subcategory-images";
import { directoryCategoryBySlug } from "@/lib/shop-directory-taxonomy";
import {
  seoCategoryDescriptionFor,
  translateDirectoryCategory,
  translateDirectorySubcategory,
  useShopDirectoryCopy,
} from "@/lib/shop-directory-i18n";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import { useMarket } from "@/lib/market-context";

export default function ShopDirectoryCategoryPage() {
  const [, params] = useRoute("/dyqanet/:slug");
  const slug = params?.slug ?? "";
  const cat = directoryCategoryBySlug(slug);
  const d = useShopDirectoryCopy();
  const { uiLang } = useMarket();
  const locale = translationKeyForUiLang(uiLang);

  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<ShopDirectoryListItem[]>([]);
  const [subFilter, setSubFilter] = useState("");

  useEffect(() => {
    if (!cat) return;
    const categoryName = translateDirectoryCategory(cat, locale);
    const title = `${categoryName} — ${d.seoCategoryTitleSuffix}`;
    const description = seoCategoryDescriptionFor(d, categoryName);
    applyPageMeta({ title, description, ogTitle: title, ogDescription: description });
  }, [cat, d, locale]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    const params = new URLSearchParams({ category: slug });
    if (subFilter) params.set("subcategory", subFilter);
    void fetchWithTimeout(`/api/shops/directory?${params}`)
      .then((r) => r.json() as Promise<{ shops: ShopDirectoryListItem[] }>)
      .then((data) => setShops(data.shops ?? []))
      .catch(() => setShops([]))
      .finally(() => setLoading(false));
  }, [slug, subFilter]);

  const title = cat ? translateDirectoryCategory(cat, locale) : d.docCategoryTitle;
  const categoryImageUrl = cat ? shopDirectoryCategoryImageUrl(cat.slug) : undefined;

  if (!cat) {
    return (
      <div className="min-h-screen bg-[#f0f4f9]">
        <SiteHeader />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-lg font-bold">{d.noResults}</p>
          <Link href="/dyqanet" className="mt-4 inline-block text-blue-600 font-semibold">
            {d.viewAllShops}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f9]">
      <SiteHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
        <StaticPageBackLink />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex items-center gap-3 sm:gap-4">
          {categoryImageUrl ? (
            <img
              src={categoryImageUrl}
              alt=""
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover border border-gray-200 shrink-0"
            />
          ) : (
            <span className="text-4xl shrink-0" aria-hidden>
              {cat.emoji}
            </span>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {shops.length} {d.shopsCount}
            </p>
          </div>
        </div>

        <CategoryPhotoPickerGrid>
          <CategoryPhotoPickerCard
            selected={!subFilter}
            onClick={() => setSubFilter("")}
            imageSrc={categoryImageUrl ?? ""}
            fallbackImageSrc={categoryImageUrl}
            label={d.allSubcategories}
          />
          {cat.subcategories.map((sub) => (
            <CategoryPhotoPickerCard
              key={sub.slug}
              selected={subFilter === sub.slug}
              onClick={() => setSubFilter(sub.slug)}
              imageSrc={shopDirectorySubcategoryImageUrl(cat.slug, sub.slug) ?? categoryImageUrl ?? ""}
              fallbackImageSrc={categoryImageUrl}
              label={translateDirectorySubcategory(sub, locale)}
            />
          ))}
        </CategoryPhotoPickerGrid>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : shops.length === 0 ? (
          <p className="text-center text-gray-500 py-12">{d.noShops}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shops.map((shop) => (
              <ShopDirectoryCard key={shop.id} shop={shop} viewLabel={d.viewShop} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
