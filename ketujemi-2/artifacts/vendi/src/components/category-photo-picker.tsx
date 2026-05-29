import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const categoryPhotoCardWidthClass =
  "w-[10.75rem] sm:w-44 md:w-48 lg:w-[13rem] aspect-[4/3]";

/** Matches Vetura hub body-type chips: fixed 108px height, not full-width squares. */
export const categoryPhotoCardGridClass = "w-full min-h-[108px] h-[108px]";

type CategoryPhotoPickerCardProps = {
  selected?: boolean;
  onClick: () => void;
  imageSrc: string;
  label: string;
  imageAlt?: string;
  /** `grid` = 2×4 responsive grid (Fëmijë hub); default = horizontal scroll row. */
  layout?: "row" | "grid";
};

export function CategoryPhotoPickerCard({
  selected = false,
  onClick,
  imageSrc,
  label,
  imageAlt = "",
  layout = "row",
}: CategoryPhotoPickerCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative overflow-hidden border text-left transition-all touch-manipulation",
        layout === "grid"
          ? cn("rounded-xl", categoryPhotoCardGridClass)
          : cn("shrink-0 snap-start rounded-2xl", categoryPhotoCardWidthClass),
        selected
          ? "border-blue-600 ring-2 ring-blue-600/30 shadow-md"
          : "border-gray-100 hover:border-blue-200 hover:shadow-md",
      )}
    >
      <img
        src={imageSrc}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <span
        className={cn(
          "absolute text-white font-bold leading-tight drop-shadow line-clamp-2",
          layout === "grid"
            ? "bottom-0 left-0 right-0 px-2.5 pb-3 pt-8 text-center text-sm"
            : "bottom-2 left-2 right-2 text-sm leading-snug",
        )}
      >
        {label}
      </span>
    </button>
  );
}

export function CategoryPhotoPickerRow({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        "flex gap-3 overflow-x-auto overscroll-x-contain scroll-smooth snap-x snap-mandatory",
        "pb-2 -mx-1 px-1",
        "[scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5",
        "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300",
      )}
    >
      {children}
    </div>
  );
}

/** Fëmijë hub — same photo cards as {@link CategoryPhotoPickerRow} but 2×4 grid like Vetura body types. */
export function CategoryPhotoPickerGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{children}</div>;
}
