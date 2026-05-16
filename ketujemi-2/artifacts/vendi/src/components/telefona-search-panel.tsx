import { useEffect, useMemo, useRef, useState } from "react";
import type { GetListingsParams } from "@workspace/api-client-react";
import { Check, ChevronsUpDown, Euro, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useMarket } from "@/lib/market-context";
import { fillCount } from "@/lib/app-extra-i18n";
import {
  TEL_BATTERY_KEYS,
  TEL_BATTERY_LABEL_KEY,
  TEL_BATTERY_SEARCH,
  TEL_BRAND_KEYS,
  TEL_BRAND_LABEL,
  TEL_BRAND_MODELS,
  TEL_BRAND_SLUG,
  TEL_CONDITION_KEYS,
  TEL_CONDITION_LABEL_KEY,
  TEL_CONDITION_SEARCH,
  TEL_DEVICE_KEYS,
  TEL_DEVICE_LABEL_KEY,
  TEL_DEVICE_PHOTOS,
  TEL_STORAGE_KEYS,
  TEL_STORAGE_LABEL_KEY,
  TEL_STORAGE_SEARCH,
  getTelefonaHubChildCategoryIds,
  resolveDeviceTypeCategoryIds,
  resolveTelefonaCategoryIdBySlug,
  type TelBatteryKey,
  type TelBrandKey,
  type TelConditionKey,
  type TelDeviceKey,
  type TelStorageKey,
  type TelefonaCategoryRow,
} from "@/lib/telefona-search-helpers";

const triggerClass = "min-h-12 h-12 w-full text-[16px] rounded-xl border-slate-200 justify-between font-normal";

type Props = {
  hubId: number;
  categories: TelefonaCategoryRow[];
  previewTotal: number | null;
  previewLoading: boolean;
  onListingParamsChange: (params: GetListingsParams) => void;
  onScrollToResults?: () => void;
};

export function TelefonaSearchPanel({
  hubId,
  categories,
  previewTotal,
  previewLoading,
  onListingParamsChange,
  onScrollToResults,
}: Props) {
  const { t } = useMarket();

  const defaultCsv = useMemo(() => {
    const ids = getTelefonaHubChildCategoryIds(categories, hubId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [categories, hubId]);

  const [deviceKey, setDeviceKey] = useState<TelDeviceKey | null>(null);
  const [brandKey, setBrandKey] = useState<TelBrandKey | "">("");
  const [brandOpen, setBrandOpen] = useState(false);
  const [model, setModel] = useState("");
  const [modelOpen, setModelOpen] = useState(false);
  const [storage, setStorage] = useState<Record<TelStorageKey, boolean>>({
    "32": false,
    "64": false,
    "128": false,
    "256": false,
    "512": false,
    "1tb": false,
  });
  const [condition, setCondition] = useState<TelConditionKey | "">("");
  const [battery, setBattery] = useState<TelBatteryKey | "">("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const models = brandKey ? (TEL_BRAND_MODELS[brandKey] ?? []) : [];
  const showBattery = brandKey === "apple";

  useEffect(() => {
    setModel("");
    if (brandKey !== "apple") setBattery("");
  }, [brandKey]);

  const callbackRef = useRef(onListingParamsChange);
  callbackRef.current = onListingParamsChange;

  const buildParams = (): GetListingsParams => {
    const p: GetListingsParams = {
      page: 1,
      limit: 20,
      category_ids: defaultCsv,
    };

    if (brandKey) {
      const cid = resolveTelefonaCategoryIdBySlug(categories, hubId, TEL_BRAND_SLUG[brandKey]);
      if (cid) {
        p.category_id = cid;
        delete p.category_ids;
      }
    } else if (deviceKey) {
      const ids = resolveDeviceTypeCategoryIds(categories, hubId, deviceKey);
      if (ids.length === 1) {
        p.category_id = ids[0];
        delete p.category_ids;
      } else if (ids.length > 1) {
        p.category_ids = [...ids].sort((a, b) => a - b).join(",");
      }
    }

    if (model.trim()) {
      p.vehicle_model = model.trim();
    }

    const searchBits: string[] = [];
    for (const sk of TEL_STORAGE_KEYS) {
      if (storage[sk]) searchBits.push(TEL_STORAGE_SEARCH[sk]);
    }
    if (condition) searchBits.push(TEL_CONDITION_SEARCH[condition]);
    if (showBattery && battery) searchBits.push(TEL_BATTERY_SEARCH[battery]);

    if (searchBits.length) p.search = searchBits.join(" ");

    const minP = parseFloat(priceMin.replace(",", "."));
    const maxP = parseFloat(priceMax.replace(",", "."));
    if (Number.isFinite(minP) && priceMin.trim()) p.min_price = minP;
    if (Number.isFinite(maxP) && priceMax.trim()) p.max_price = maxP;

    return p;
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      callbackRef.current(buildParams());
    }, 400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounced live preview
  }, [
    defaultCsv,
    hubId,
    deviceKey,
    brandKey,
    model,
    storage,
    condition,
    battery,
    priceMin,
    priceMax,
    categories,
    showBattery,
  ]);

  const handleSearch = () => {
    callbackRef.current(buildParams());
    onScrollToResults?.();
  };

  return (
    <div className="mb-8 space-y-6 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm overflow-hidden max-w-full">
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <Smartphone size={20} className="text-blue-600 shrink-0" aria-hidden />
          {t.tel_panel_title}
        </h2>
        <p className="text-sm text-gray-500">{t.tel_panel_sub}</p>
      </div>

      {/* Section 1 — device types */}
      <section className="space-y-3">
        <Label className="text-sm font-bold text-gray-900">{t.tel_sec_device}</Label>
        <div className="grid grid-cols-2 gap-3">
          {TEL_DEVICE_KEYS.map((key) => {
            const selected = deviceKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setDeviceKey(selected ? null : key)}
                className={cn(
                  "relative overflow-hidden rounded-2xl border text-left transition-all min-h-[7.5rem] touch-manipulation",
                  selected
                    ? "border-blue-600 ring-2 ring-blue-600/30 shadow-md"
                    : "border-gray-100 hover:border-blue-200 hover:shadow-md",
                )}
              >
                <img
                  src={TEL_DEVICE_PHOTOS[key]}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <span className="absolute bottom-2 left-2 right-2 text-white text-sm font-bold leading-snug line-clamp-2 drop-shadow">
                  {t[TEL_DEVICE_LABEL_KEY[key]]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Section 2 — brand */}
      <section className="space-y-2">
        <Label className="text-sm font-bold text-gray-900">{t.tel_sec_brand}</Label>
        <Popover open={brandOpen} onOpenChange={setBrandOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={brandOpen}
              className={cn(triggerClass, !brandKey && "text-muted-foreground")}
            >
              <span className="truncate">
                {brandKey ? TEL_BRAND_LABEL[brandKey] : t.tel_brand_ph}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl" align="start">
            <Command>
              <CommandInput placeholder={t.tel_brand_search_ph} className="h-11" />
              <CommandList>
                <CommandEmpty>{t.tel_brand_none}</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="__any__"
                    onSelect={() => {
                      setBrandKey("");
                      setBrandOpen(false);
                    }}
                    className="min-h-11"
                  >
                    <Check className={cn("mr-2 h-4 w-4", !brandKey ? "opacity-100" : "opacity-0")} />
                    {t.tel_brand_any}
                  </CommandItem>
                  {TEL_BRAND_KEYS.map((bk) => (
                    <CommandItem
                      key={bk}
                      value={`${bk} ${TEL_BRAND_LABEL[bk]}`}
                      onSelect={() => {
                        setBrandKey(bk);
                        setBrandOpen(false);
                      }}
                      className="min-h-11"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          brandKey === bk ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {TEL_BRAND_LABEL[bk]}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </section>

      {/* Section 3 — model */}
      <section className="space-y-2">
        <Label className="text-sm font-bold text-gray-900">{t.tel_sec_model}</Label>
        <Popover open={modelOpen} onOpenChange={setModelOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={modelOpen}
              disabled={!brandKey}
              className={cn(triggerClass, !model && "text-muted-foreground")}
            >
              <span className="truncate">{model || t.tel_model_ph}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl" align="start">
            <Command>
              <CommandInput placeholder={t.tel_model_search_ph} className="h-11" />
              <CommandList>
                <CommandEmpty>{t.tel_model_none}</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="__any__"
                    onSelect={() => {
                      setModel("");
                      setModelOpen(false);
                    }}
                    className="min-h-11"
                  >
                    <Check className={cn("mr-2 h-4 w-4", !model ? "opacity-100" : "opacity-0")} />
                    {t.tel_model_any}
                  </CommandItem>
                  {models.map((m) => (
                    <CommandItem
                      key={m}
                      value={m}
                      onSelect={() => {
                        setModel(m);
                        setModelOpen(false);
                      }}
                      className="min-h-11"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          model === m ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {m}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </section>

      {/* Section 4 — storage */}
      <section className="space-y-3">
        <p className="text-sm font-bold text-gray-900">{t.tel_sec_storage}</p>
        <div className="grid grid-cols-2 gap-3">
          {TEL_STORAGE_KEYS.map((sk) => (
            <label
              key={sk}
              className="flex items-center gap-3 min-h-12 cursor-pointer touch-manipulation"
            >
              <Checkbox
                checked={storage[sk]}
                onCheckedChange={(c) =>
                  setStorage((prev) => ({ ...prev, [sk]: c === true }))
                }
                className="h-5 w-5"
              />
              <span className="text-sm font-medium text-gray-800">
                {t[TEL_STORAGE_LABEL_KEY[sk]]}
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* Section 5 — condition */}
      <section className="space-y-3">
        <p className="text-sm font-bold text-gray-900">{t.tel_sec_condition}</p>
        <RadioGroup
          value={condition}
          onValueChange={(v) => setCondition(v as TelConditionKey)}
          className="grid grid-cols-1 gap-2"
        >
          {TEL_CONDITION_KEYS.map((ck) => (
            <label
              key={ck}
              htmlFor={`tel-cond-${ck}`}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3 min-h-12 cursor-pointer transition-colors touch-manipulation",
                condition === ck
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-200",
              )}
            >
              <RadioGroupItem id={`tel-cond-${ck}`} value={ck} className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium text-gray-800">
                {t[TEL_CONDITION_LABEL_KEY[ck]]}
              </span>
            </label>
          ))}
        </RadioGroup>
      </section>

      {/* Section 6 — battery (Apple only) */}
      {showBattery ? (
        <section className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
          <p className="text-sm font-bold text-gray-900">{t.tel_sec_battery}</p>
          <RadioGroup
            value={battery}
            onValueChange={(v) => setBattery(v as TelBatteryKey)}
            className="grid grid-cols-1 gap-2"
          >
            {TEL_BATTERY_KEYS.map((bk) => (
              <label
                key={bk}
                htmlFor={`tel-bat-${bk}`}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3 min-h-12 cursor-pointer transition-colors touch-manipulation",
                  battery === bk
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-200 bg-white",
                )}
              >
                <RadioGroupItem id={`tel-bat-${bk}`} value={bk} className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium text-gray-800">
                  {t[TEL_BATTERY_LABEL_KEY[bk]]}
                </span>
              </label>
            ))}
          </RadioGroup>
        </section>
      ) : null}

      {/* Section 7 — price */}
      <section className="space-y-3">
        <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Euro size={18} className="text-blue-600 shrink-0" aria-hidden />
          {t.tel_sec_price}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <span className="text-sm text-gray-600">{t.tel_from}</span>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="0"
              className="min-h-12 h-12 text-[16px]"
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm text-gray-600">{t.tel_to}</span>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="1500"
              className="min-h-12 h-12 text-[16px]"
            />
          </div>
        </div>
      </section>

      <Button
        type="button"
        onClick={handleSearch}
        className="w-full min-h-12 h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 touch-manipulation"
      >
        {t.tel_search_btn}
      </Button>
    </div>
  );
}

