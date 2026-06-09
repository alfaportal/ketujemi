import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { ShopRatingStars } from "@/components/shop-rating-stars";
import { ShopRatingBadge } from "@/components/shop-rating-badge";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { useAuth, loginUrlWithReturn } from "@/lib/auth-context";
import { useShopRatingCopy } from "@/lib/shop-rating-i18n";
import { BRAND_BLUE } from "@/lib/brand-colors";
import { useMarket } from "@/lib/market-context";

type Review = {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  author_name: string | null;
  is_mine: boolean;
};

type RatingsPayload = {
  average_rating: number | null;
  rating_count: number;
  user_rating: { rating: number; comment: string | null } | null;
  reviews: Review[];
};

type Props = {
  shopId: number;
};

export function ShopRatingsPanel({ shopId }: Props) {
  const [location] = useLocation();
  const copy = useShopRatingCopy();
  const { uiLang } = useMarket();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<RatingsPayload | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saved, setSaved] = useState(false);
  const ratingsUrl = `/api/shops/${shopId}/ratings?lang=${encodeURIComponent(uiLang)}`;

  useEffect(() => {
    setLoading(true);
    void fetchWithTimeout(ratingsUrl)
      .then((r) => r.json() as Promise<RatingsPayload>)
      .then((payload) => {
        setData(payload);
        if (payload.user_rating) {
          setRating(payload.user_rating.rating);
          setComment(payload.user_rating.comment ?? "");
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [shopId, uiLang]);

  async function submitRating() {
    if (!user || rating < 1) return;
    setSubmitting(true);
    setSaved(false);
    try {
      const res = await fetchWithTimeout(`/api/shops/${shopId}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() || null }),
      });
      if (!res.ok) return;
      const body = (await res.json()) as {
        average_rating: number | null;
        rating_count: number;
        user_rating: { rating: number; comment: string | null };
      };
      setData((prev) =>
        prev
          ? {
              ...prev,
              average_rating: body.average_rating,
              rating_count: body.rating_count,
              user_rating: body.user_rating,
            }
          : prev,
      );
      setSaved(true);
      void fetchWithTimeout(ratingsUrl)
        .then((r) => r.json() as Promise<RatingsPayload>)
        .then(setData);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) return null;

  const hasUserRating = Boolean(data.user_rating);

  return (
    <section className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-900">{copy.ratingsTitle}</h2>
        <ShopRatingBadge averageRating={data.average_rating} ratingCount={data.rating_count} size="md" />
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-800">{hasUserRating ? copy.yourRating : copy.rateThisShop}</p>
        {user ? (
          <>
            <ShopRatingStars value={rating} interactive onChange={setRating} size={28} />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={copy.commentPlaceholder}
              rows={3}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="button"
              disabled={rating < 1 || submitting}
              onClick={() => void submitRating()}
              className="inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: BRAND_BLUE }}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : hasUserRating ? copy.updateRating : copy.submitRating}
            </button>
            {saved ? <p className="text-sm text-green-700 font-medium">{copy.ratingSaved}</p> : null}
          </>
        ) : (
          <Link href={loginUrlWithReturn(location)} className="text-sm font-semibold text-blue-600 hover:underline">
            {copy.loginToRate}
          </Link>
        )}
      </div>

      {data.reviews.length > 0 ? (
        <ul className="space-y-4">
          {data.reviews.map((review) => (
            <li key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900">
                  {review.author_name ?? copy.anonymousUser}
                  {review.is_mine ? <span className="text-gray-400 font-normal"> · </span> : null}
                </p>
                <ShopRatingStars value={review.rating} size={14} />
              </div>
              {review.comment ? (
                <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{review.comment}</p>
              ) : null}
              <p className="mt-1 text-xs text-gray-400">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
