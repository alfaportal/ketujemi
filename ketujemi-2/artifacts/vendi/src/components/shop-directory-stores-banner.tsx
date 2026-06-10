import type { CSSProperties } from "react";
import { Link } from "wouter";
import type { ShopDirectoryListItem } from "@/components/shop-directory-card";
import { cn } from "@/lib/utils";

/** Below this count logos stay centered; at or above, the strip auto-scrolls. */
const SCROLL_MIN_SHOPS = 5;

type Props = {
  shops: ShopDirectoryListItem[];
  loading?: boolean;
};

function ShopLogoTile({ shop }: { shop: ShopDirectoryListItem }) {
  return (
    <Link
      href={`/dyqani/${shop.id}`}
      aria-label={shop.shop_name}
      className="flex w-[5.5rem] sm:w-24 shrink-0 flex-col items-center gap-1.5 group"
    >
      <div className="flex h-14 w-[4.5rem] sm:h-16 sm:w-20 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50 transition-colors group-hover:border-blue-200">
        {shop.logo_url?.trim() ? (
          <img
            src={shop.logo_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-contain p-1"
          />
        ) : (
          <span className="text-lg font-black text-blue-600" aria-hidden>
            {shop.shop_name.trim().charAt(0).toUpperCase() || "?"}
          </span>
        )}
      </div>
      <span className="max-w-full text-center text-[10px] sm:text-xs font-semibold leading-tight text-gray-600 line-clamp-2 group-hover:text-blue-700">
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
        className="shop-directory-stores-marquee-track flex w-max items-start gap-5 sm:gap-6"
        style={{ "--shop-marquee-duration": `${Math.max(shops.length * 6, 28)}s` } as CSSProperties}
      >
        {loop.map((shop, index) => (
          <ShopLogoTile key={`${shop.id}-${index}`} shop={shop} />
        ))}
      </div>
    </div>
  );
}

function StaticRow({ shops }: { shops: ShopDirectoryListItem[] }) {
  return (
    <div className="flex flex-wrap items-start justify-center gap-4 sm:gap-5 px-4">
      {shops.map((shop) => (
        <ShopLogoTile key={shop.id} shop={shop} />
      ))}
    </div>
  );
}

export function ShopDirectoryStoresBanner({ shops, loading }: Props) {
  if (!loading && shops.length === 0) return null;

  const scrollable = shops.length >= SCROLL_MIN_SHOPS;

  return (
    <section
      className={cn(
        "rounded-2xl border border-gray-200 bg-white py-4 sm:py-5 shadow-sm",
        scrollable && "shop-directory-stores-marquee-mask",
      )}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <div className="flex justify-center gap-4 px-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex w-20 flex-col items-center gap-2">
              <div className="h-14 w-[4.5rem] animate-pulse rounded-xl bg-gray-100" />
              <div className="h-3 w-14 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : scrollable ? (
        <MarqueeTrack shops={shops} />
      ) : (
        <StaticRow shops={shops} />
      )}
    </section>
  );
}
