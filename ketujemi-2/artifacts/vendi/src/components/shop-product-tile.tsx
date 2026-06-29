import { ArrowRight } from "lucide-react";
import { BRAND_BLUE } from "@/lib/brand-colors";
import { cn } from "@/lib/utils";
import { useShopProductsCopy } from "@/lib/shop-products-i18n";
import type { ShopProductPublic } from "@/components/shop-product-card";

type Props = {
  product: ShopProductPublic;
  onOpen: () => void;
  className?: string;
};

export function ShopProductTile({ product, onOpen, className }: Props) {
  const c = useShopProductsCopy();
  const cover =
    product.image_urls?.[0] ?? product.image_url ?? null;
  const tag = product.collection?.trim() || c.uncategorizedProducts;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group flex flex-col text-left rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden",
        "transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        className,
      )}
    >
      <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-5xl opacity-25" aria-hidden>
            🛍️
          </div>
        )}
        {product.image_urls && product.image_urls.length > 1 ? (
          <span className="absolute top-3 right-3 text-[10px] font-bold bg-black/55 text-white px-2 py-1 rounded-full backdrop-blur">
            +{product.image_urls.length - 1} {c.morePhotos}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col flex-1 p-5 gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: BRAND_BLUE }}>
          {tag}
        </p>
        <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
          {product.title}
        </h3>
        <span className="inline-flex items-center gap-1 text-sm font-semibold mt-auto pt-2" style={{ color: BRAND_BLUE }}>
          {c.viewProduct}
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}
