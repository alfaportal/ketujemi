import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchLabel: string;
  /** When set, Enter and the button call this (main /dyqanet page). */
  onSubmit?: () => void;
  className?: string;
};

export function ShopDirectorySearchBar({
  value,
  onChange,
  placeholder,
  searchLabel,
  onSubmit,
  className,
}: Props) {
  return (
    <div className={cn("flex gap-2", className)}>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit?.();
          }
        }}
        placeholder={placeholder}
        className="w-full min-h-12 flex-1 rounded-xl border border-gray-200 bg-white px-4 text-base sm:text-sm shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />
      {onSubmit ? (
        <button
          type="button"
          onClick={onSubmit}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 min-h-12 rounded-xl border border-blue-600 bg-blue-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Search size={16} aria-hidden />
          <span className="hidden sm:inline">{searchLabel}</span>
        </button>
      ) : null}
    </div>
  );
}
