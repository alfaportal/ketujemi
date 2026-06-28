import { Link } from "wouter";
import { ShoppingBag, ExternalLink } from "lucide-react";
import { BRAND_BLUE, BRAND_ORANGE } from "@/lib/brand-colors";
import { cn } from "@/lib/utils";
import { useShopProductsCopy } from "@/lib/shop-products-i18n";
import { shopWhatsAppOrderHref } from "@/lib/shop-whatsapp-order";
import { Button } from "@/components/ui/button";

export type ShopProductPublic = {
  id: number;
  title: string;
  description: string;
  price: number;
  compare_at_price?: number | null;
  category_id: number;
  image_url?: string | null;
  sku?: string | null;
  listing_id?: number | null;
};

type Props = {
  product: ShopProductPublic;
  shopName?: string | null;
  shopWhatsapp?: string | null;
  className?: string;
};

function formatPrice(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ShopProductCard({ product, shopName, shopWhatsapp, className }: Props) {
  const c = useShopProductsCopy();
  const orderHref = shopWhatsAppOrderHref(shopWhatsapp, product.title, product.price, shopName);
  const hasDiscount =
    product.compare_at_price != null &&
    product.compare_at_price > product.price;

  return (
    <article
      className={cn(
        "group flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className="h-full w-full flex items-center justify-center text-5xl opacity-30"
            aria-hidden
          >
            🛍️
          </div>
        )}
        {hasDiscount ? (
          <span
            className="absolute top-3 left-3 text-xs font-bold text-white px-2.5 py-1 rounded-full shadow"
            style={{ background: BRAND_ORANGE }}
          >
            OFERTË
          </span>
        ) : null}
      </div>

      <div className="flex flex-col flex-1 p-4 gap-2">
        {product.sku ? (
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {product.sku}
          </p>
        ) : null}
        <h3 className="font-bold text-gray-900 leading-snug line-clamp-2">{product.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 flex-1">{product.description}</p>

        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-xl font-black" style={{ color: BRAND_BLUE }}>
            {formatPrice(product.price)}
          </span>
          {hasDiscount ? (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.compare_at_price!)}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {orderHref ? (
            <a href={orderHref} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[120px]">
              <Button
                type="button"
                className="w-full min-h-11 text-white font-bold gap-2 text-base"
                style={{ background: `linear-gradient(90deg, ${BRAND_BLUE}, ${BRAND_ORANGE})` }}
              >
                <ShoppingBag size={18} />
                {c.orderProduct}
              </Button>
            </a>
          ) : null}
          {product.listing_id ? (
            <Link href={`/listings/${product.listing_id}`} className="flex-1 min-w-[120px]">
              <Button type="button" variant="outline" className="w-full min-h-10 gap-1.5 font-semibold">
                <ExternalLink size={16} />
                {c.viewOnMarketplace}
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
