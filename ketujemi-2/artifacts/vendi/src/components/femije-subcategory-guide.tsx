import { useMarket } from "@/lib/market-context";
import type { MarketCode } from "@/lib/category-translations";
import { getFemijeSubcategoryGuide } from "@/lib/femije-subcategory-guides";

type Props = {
  slug: string;
  locale: MarketCode;
};

export function FemijeSubcategoryGuide({ slug, locale }: Props) {
  const { t } = useMarket();
  const guide = getFemijeSubcategoryGuide(slug, locale);
  if (!guide) return null;

  const includesTitle = t.fj_guide_includes;
  const conditionTitle = t.fj_guide_conditions;

  return (
    <section
      className="mb-8 -mt-2 max-w-3xl rounded-xl border border-blue-100 bg-blue-50/40 px-4 py-4 sm:px-5 space-y-4"
      aria-labelledby="femije-guide-intro"
    >
      <p id="femije-guide-intro" className="text-sm text-gray-800 leading-relaxed font-medium">
        {guide.intro}
      </p>

      {guide.includes.length > 0 ? (
        <div>
          <h2 className="text-sm font-black text-gray-900 mb-2">{includesTitle}</h2>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1.5">
            {guide.includes.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {guide.conditions.length > 0 ? (
        <div>
          <h2 className="text-sm font-black text-gray-900 mb-2">{conditionTitle}</h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-3 py-2 font-semibold text-gray-800 whitespace-nowrap">
                    {t.fj_guide_col_state}
                  </th>
                  <th className="px-3 py-2 font-semibold text-gray-800">
                    {t.fj_guide_col_meaning}
                  </th>
                </tr>
              </thead>
              <tbody>
                {guide.conditions.map((row) => (
                  <tr key={row.label} className="border-b border-gray-100 last:border-0">
                    <td className="px-3 py-2.5 font-semibold text-gray-900 align-top whitespace-nowrap">
                      {row.label}
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 leading-relaxed">{row.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}
