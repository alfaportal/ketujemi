import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const categoryPhotoCardWidthClass =
  "w-[10.75rem] sm:w-44 md:w-48 lg:w-[13rem] aspect-[4/3]";

type CategoryPhotoPickerCardProps = {
  selected?: boolean;
  onClick: () => void;
  imageSrc: string;
  label: string;
  imageAlt?: string;
};

export function CategoryPhotoPickerCard({
  selected = false,
  onClick,
  imageSrc,
  label,
  imageAlt = "",
}: CategoryPhotoPickerCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative shrink-0 snap-start overflow-hidden rounded-2xl border text-left transition-all touch-manipulation",
        categoryPhotoCardWidthClass,
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
      <span className="absolute bottom-2 left-2 right-2 text-white text-sm font-bold leading-snug line-clamp-2 drop-shadow">
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
