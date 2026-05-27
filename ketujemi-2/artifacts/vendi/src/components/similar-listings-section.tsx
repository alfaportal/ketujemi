import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarket } from "@/lib/market-context";
import { ListingCardImage } from "@/components/listing-card-image";

type Similar = {
  id: number;
  title: string;
  price: number;
  image_url: string | null;
  primary_image_url?: string | null;
  location: string;
  views?: number;
};

type Props = { listingId: number };

export function SimilarListingsSection({ listingId }: Props) {
  const { t, market } = useMarket();
  const [items, setItems] = useState<Similar[]>([]);
  const [heading, setHeading] = useState("Mund të të interesojë gjithashtu");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetch(`/api/ai/listings/${listingId}/similar`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled || !j) return;
        setItems((j as { similar?: Similar[] }).similar ?? []);
        const h = (j as { heading?: string }).heading;
        if (h) setHeading(h);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  if (!loading && items.length === 0) return null;

  const currency = market.symbol;

  return (
    <section className="mt-8 space-y-4">
      <h2 className="text-lg font-bold text-gray-900">{heading}</h2>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {items.map((item) => (
              <Link
                key={item.id}
                href={`/listings/${item.id}`}
                className="block rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] bg-gray-200">
                  <ListingCardImage
                    imageUrl={item.image_url}
                    primaryImageUrl={item.primary_image_url}
                    alt={item.title}
                  />
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm text-gray-900 line-clamp-2">{item.title}</p>
                  <p className="text-blue-600 font-bold text-sm mt-1">
                    {item.price > 0 ? `${item.price.toLocaleString()} ${currency}` : t.priceAgreement}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-xs text-gray-500 truncate">{item.location}</p>
                    <span className="flex items-center gap-0.5 text-xs text-gray-500 shrink-0">
                      <Eye size={10} aria-hidden />
                      {Number(item.views ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
          ))}
        </div>
      )}
    </section>
  );
}
