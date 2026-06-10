import { Dumbbell } from "lucide-react";
import {
  CategoryPhotoPickerCard,
  CategoryPhotoPickerGrid,
} from "@/components/category-photo-picker";
import { useMarket } from "@/lib/market-context";
import {
  resolveTypeCategoryId,
  type HubTypePickerConfig,
} from "@/lib/hub-drill-down";

type CategoryRow = {
  id: number;
  slug: string | null;
  parent_id: number | null;
};

type Props<T extends string> = {
  config: HubTypePickerConfig<T>;
  hubId: number;
  categories: CategoryRow[];
  onNavigateToCategory: (childCategoryId: number) => void;
};

export function HubTypePicker<T extends string>({
  config,
  hubId,
  categories,
  onNavigateToCategory,
}: Props<T>) {
  const { t } = useMarket();

  return (
    <div className="mb-8 space-y-6 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm overflow-hidden max-w-full">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Dumbbell size={20} className="text-blue-600 shrink-0" aria-hidden />
            {t[config.titleI18nKey] ?? config.titleI18nKey}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t[config.hintI18nKey]}
          </p>
        </div>
        <CategoryPhotoPickerGrid>
          {config.typeKeys.map((key) => {
            const cid = resolveTypeCategoryId(categories, hubId, config.typeDbSlug[key]);
            const label = t[config.typeLabelKey[key]] ?? key;
            return (
              <CategoryPhotoPickerCard
                key={key}
                onClick={() => {
                  if (cid) onNavigateToCategory(cid);
                }}
                imageSrc={config.typePhotos[key]}
                label={label}
              />
            );
          })}
        </CategoryPhotoPickerGrid>
      </section>
    </div>
  );
}
