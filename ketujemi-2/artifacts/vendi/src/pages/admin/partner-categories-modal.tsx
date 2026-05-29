import { Loader2, X } from "lucide-react";
import type { AdminCategory } from "@/lib/admin-api";
import { PartnerCategoryChecklist } from "./partner-category-checklist";

export function PartnerCategoriesModal({
  title,
  subtitle,
  categories,
  selectedIds,
  saving,
  variant = "curated",
  onClose,
  onChange,
  onSave,
}: {
  title: string;
  subtitle?: string;
  categories: AdminCategory[];
  selectedIds: number[];
  saving?: boolean;
  variant?: "curated" | "business";
  onClose: () => void;
  onChange: (ids: number[]) => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-gray-100">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900">{title}</h3>
            {subtitle ? (
              <p className="text-sm text-gray-500 truncate mt-0.5">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 min-w-10 flex items-center justify-center rounded-lg hover:bg-gray-100 shrink-0"
            aria-label="Mbyll"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">
          <PartnerCategoryChecklist
            categories={categories}
            selectedIds={selectedIds}
            onChange={onChange}
            disabled={saving}
            variant={variant}
          />
        </div>
        <div className="p-5 border-t border-gray-100 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 min-h-12 rounded-xl border border-gray-200 font-bold text-gray-700"
          >
            Anulo
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="flex-1 min-h-12 rounded-xl bg-[#1A56A0] text-white font-bold flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Ruaj kategoritë"}
          </button>
        </div>
      </div>
    </div>
  );
}
