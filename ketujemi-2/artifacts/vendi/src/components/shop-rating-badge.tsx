import { ShopRatingStars } from "@/components/shop-rating-stars";
import { formatRatingsCount, useShopRatingCopy } from "@/lib/shop-rating-i18n";

type Props = {
  averageRating: number | null | undefined;
  ratingCount: number | null | undefined;
  size?: "sm" | "md";
  tone?: "default" | "onDark";
};

export function ShopRatingBadge({ averageRating, ratingCount, size = "sm", tone = "default" }: Props) {
  const copy = useShopRatingCopy();
  const count = ratingCount ?? 0;
  const mutedClass = tone === "onDark" ? "text-white/75" : "text-gray-400";
  const textClass =
    tone === "onDark"
      ? size === "sm"
        ? "text-xs font-semibold text-white/90"
        : "text-sm font-semibold text-white"
      : size === "sm"
        ? "text-xs font-semibold text-gray-600"
        : "text-sm font-semibold text-gray-700";
  if (!count || averageRating == null) {
    return <p className={`text-xs ${mutedClass}`}>{copy.noRatingYet}</p>;
  }
  return (
    <div className={size === "sm" ? "flex items-center gap-1.5" : "flex items-center gap-2"}>
      <ShopRatingStars value={averageRating} size={size === "sm" ? 14 : 18} />
      <span className={textClass}>{formatRatingsCount(copy, averageRating, count)}</span>
    </div>
  );
}
