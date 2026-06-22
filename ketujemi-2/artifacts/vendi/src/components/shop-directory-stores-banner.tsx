import type { CSSProperties } from "react";
import { Link } from "wouter";
import type { ShopDirectoryListItem } from "@/components/shop-directory-card";
import { cn } from "@/lib/utils";

type Props = {
  shops: ShopDirectoryListItem[];
  loading?: boolean;
};

function ShopLogoTile({ shop }: { shop: ShopDirectoryListItem }) {
  return (
    <Link
      href={`/dyqani/${shop.id}`}
      aria-label={shop.shop_name}
      className="flex w-28 sm:w-32 shrink-0 flex-col items-center gap-2 group"
    >
      <div className="flex h-20 w-24 sm:h-24 sm:w-28 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 transition-colors group-hover:border-blue-200">
        {shop.logo_url?.trim() ? (
          <img
            src={shop.logo_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-contain p-1.5 sm:p-2"
          />
        ) : (
          <span className="text-xl font-black text-blue-600" aria-hidden>
            {shop.shop_name.trim().charAt(0).toUpperCase() || "?"}
          </span>
        )}
      </div>
      <span className="max-w-full text-center text-xs sm:text-sm font-semibold leading-tight text-gray-600 line-clamp-2 group-hover:text-blue-700">
        {shop.shop_name}
      </span>
    </Link>
  );
}

function MarqueeTrack({ shops }: { shops: ShopDirectoryListItem[] }) {
  const loop = [...shops, ...shops];

  return (
    <div className="shop-directory-stores-marquee relative overflow-hidden px-1">
      <div
        className="shop-directory-stores-marquee-track flex w-max items-start gap-6 sm:gap-8"
        style={{ "--shop-marquee-duration": `${Math.max(shops.length * 6, 24)}s` } as CSSProperties}
      >
        {loop.map((shop, index) => (
          <ShopLogoTile key={`${shop.id}-${index}`} shop={shop} />
        ))}
      </div>
    </div>
  );
}

/** Enough tiles for a smooth horizontal scroll (even with 1–2 real shops). */
function shopsForMarquee(shops: ShopDirectoryListItem[]): ShopDirectoryListItem[] {
  if (shops.length === 0) return shops;
  if (shops.length >= 5) return shops;
  const out: ShopDirectoryListItem[] = [];
  while (out.length < 8) {
    for (const shop of shops) {
      out.push(shop);
      if (out.length >= 8) break;
    }
  }
  return out;
}

export function ShopDirectoryStoresBanner({ shops, loading }: Props) {
  if (!loading && shops.length === 0) return null;

  const marqueeShops = shopsForMarquee(shops);

  return (
    <section
      className={cn(
        "rounded-2xl border border-gray-200 bg-white py-5 sm:py-6 shadow-sm",
        "shop-directory-stores-marquee-mask",
      )}
      aria-busy={loading || undefined}
      aria-label="Dyqanet e regjistruara"
    >
      {loading ? (
        <div className="flex justify-center gap-4 px-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex w-28 flex-col items-center gap-2">
              <div className="h-20 w-24 animate-pulse rounded-2xl bg-gray-100 sm:h-24 sm:w-28" />
              <div className="h-3.5 w-20 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : (
        <MarqueeTrack shops={marqueeShops} />
      )}
    </section>
  );
}
