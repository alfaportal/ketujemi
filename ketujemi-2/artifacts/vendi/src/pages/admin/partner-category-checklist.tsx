import { cn } from "@/lib/utils";
import type { AdminCategory } from "@/lib/admin-api";
import { isRootCategory, sortRootCategories } from "@/lib/parent-category-slugs";

export function PartnerCategoryChecklist({
  categories,
  selectedIds,
  onChange,
  disabled,
}: {
  categories: AdminCategory[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
}) {
  const roots = sortRootCategories(categories.filter((c) => isRootCategory(c)));

  function toggle(id: number) {
    if (disabled) return;
    const set = new Set(selectedIds);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onChange([...set]);
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-gray-700">
        Kategoritë ku shfaqet (faqe hub)
      </p>
      <p className="text-[11px] text-gray-500 leading-snug">
        Asnjë e zgjedhur = vetëm kryefaqja. Mund të zgjidhni disa njëkohësisht.
      </p>
      {roots.length === 0 ? (
        <p className="text-xs text-gray-400">Nuk u ngarkuan kategoritë.</p>
      ) : (
        <ul className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100 bg-gray-50/50">
          {roots.map((cat) => {
            const checked = selectedIds.includes(cat.id);
            return (
              <li key={cat.id}>
                <label
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 cursor-pointer touch-manipulation",
                    disabled && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggle(cat.id)}
                    className="h-4 w-4 rounded border-gray-300 text-[#1A56A0] focus:ring-[#1A56A0]"
                  />
                  <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function formatPartnerCategoryLabels(
  categoryIds: number[],
  categories: AdminCategory[],
): string {
  if (categoryIds.length === 0) return "Vetëm kryefaqe";
  const byId = new Map(categories.map((c) => [c.id, c.name]));
  const names = categoryIds
    .map((id) => byId.get(id))
    .filter((n): n is string => Boolean(n));
  return names.length > 0 ? names.join(", ") : `${categoryIds.length} kategori`;
}
