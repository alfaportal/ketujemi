import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  max?: number;
  size?: number;
  className?: string;
  interactive?: boolean;
  onChange?: (value: number) => void;
};

export function ShopRatingStars({
  value,
  max = 5,
  size = 16,
  className,
  interactive = false,
  onChange,
}: Props) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role={interactive ? "radiogroup" : "img"} aria-label={`${value} / ${max}`}>
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const filled = value >= starValue - 0.25;
        const half = !filled && value > i && value < starValue;
        const Icon = Star;
        const inner = (
          <Icon
            size={size}
            className={cn(
              filled ? "fill-amber-400 text-amber-400" : half ? "fill-amber-200 text-amber-400" : "text-gray-300",
            )}
            aria-hidden
          />
        );
        if (interactive && onChange) {
          return (
            <button
              key={starValue}
              type="button"
              onClick={() => onChange(starValue)}
              className="p-0.5 rounded hover:scale-110 transition-transform touch-manipulation"
              aria-label={`${starValue}`}
            >
              {inner}
            </button>
          );
        }
        return <span key={starValue}>{inner}</span>;
      })}
    </span>
  );
}
