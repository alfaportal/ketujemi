import { useState, type ReactNode } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { FEMIJE_HERO_PHOTO } from "@/lib/femije-search-helpers";

export const categoryPhotoCardWidthClass =
  "w-[10.75rem] sm:w-44 md:w-48 lg:w-[13rem] aspect-[4/3]";

/** Matches Vetura hub body-type chips: fixed 108px height, not full-width squares. */
export const categoryPhotoCardGridClass = "w-full min-h-[108px] h-[108px]";

/** Dyqanet subcategory picker — ~20% shorter than default grid cards. */
export const categoryPhotoCardGridClassCompact = "w-full min-h-[86px] h-[86px]";

/** Dyqanet /dyqanet/[category] subcategory grid — full-width photo with 4:3 aspect. */
export const categoryPhotoCardGridClassDirectory = "w-full aspect-[4/3]";

type CategoryPhotoPickerCardProps = {
  selected?: boolean;
  onClick?: () => void;
  href?: string;
  imageSrc: string;
  label: string;
  imageAlt?: string;
  /** Used when image fails to load (hub-specific hero). */
  fallbackImageSrc?: string;
  /** `grid` = responsive static grid (no horizontal scroll); `row` = legacy alias, same as grid. */
  layout?: "row" | "grid";
  /** `compact` = shorter cards (legacy hubs). `directory` = Dyqanet subcategory grid. */
  size?: "default" | "compact" | "directory";
};

export function CategoryPhotoPickerCard({
  selected = false,
  onClick,
  href,
  imageSrc,
  label,
  imageAlt = "",
  fallbackImageSrc = FEMIJE_HERO_PHOTO,
  layout = "grid",
  size = "default",
}: CategoryPhotoPickerCardProps) {
  const [imgSrc, setImgSrc] = useState(imageSrc);

  const className = cn(
    "relative block overflow-hidden border text-left transition-all touch-manipulation",
    layout === "grid" || layout === "row"
      ? cn(
          "rounded-xl",
          size === "directory"
            ? categoryPhotoCardGridClassDirectory
            : size === "compact"
              ? categoryPhotoCardGridClassCompact
              : categoryPhotoCardGridClass,
        )
      : cn("shrink-0 snap-start rounded-2xl", categoryPhotoCardWidthClass),
    selected
      ? "border-blue-600 ring-2 ring-blue-600/30 shadow-md"
      : "border-gray-100 hover:border-blue-200 hover:shadow-md",
  );

  const content =
    size === "directory" ? (
      <>
        <img
          src={imgSrc}
          alt={imageAlt}
          onError={() => setImgSrc(fallbackImageSrc)}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-2.5 sm:py-3">
          <span className="block text-center text-white font-bold text-xs sm:text-sm leading-snug line-clamp-2">
            {label}
          </span>
        </div>
      </>
    ) : (
      <>
        <img
          src={imgSrc}
          alt={imageAlt}
          onError={() => setImgSrc(fallbackImageSrc)}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <span
          className={cn(
            "absolute text-white font-bold leading-tight drop-shadow line-clamp-2",
            layout === "grid" || layout === "row"
              ? size === "compact"
                ? "bottom-0 left-0 right-0 px-2 pb-2 pt-5 text-center text-[11px] sm:text-xs leading-tight"
                : "bottom-0 left-0 right-0 px-2.5 pb-3 pt-8 text-center text-sm"
              : "bottom-2 left-2 right-2 text-sm leading-snug",
          )}
        >
          {label}
        </span>
      </>
    );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

/** Static responsive grid — 2 cols mobile, 4 desktop; no horizontal scroll. */
export function CategoryPhotoPickerGrid({
  children,
  spacious = false,
}: {
  children: ReactNode;
  spacious?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid w-full max-w-full grid-cols-2 md:grid-cols-4 overflow-hidden",
        spacious ? "gap-4 sm:gap-5" : "gap-3",
      )}
    >
      {children}
    </div>
  );
}

/** @deprecated Use {@link CategoryPhotoPickerGrid} — kept as alias (no scroll row). */
export function CategoryPhotoPickerRow({ children }: { children: ReactNode }) {
  return <CategoryPhotoPickerGrid>{children}</CategoryPhotoPickerGrid>;
}
