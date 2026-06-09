import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { MARKETS, useMarket, type HomeMarketCode } from "@/lib/market-context";
import {
  citiesForHubCountry,
  HOME_MARKET_CODES,
  type HubLocationFilterValue,
} from "@/lib/hub-location-search";

type Props = {
  value: HubLocationFilterValue;
  onChange: (next: HubLocationFilterValue) => void;
  inputClass?: string;
  areaId?: string;
};

export function HubLocationFilter({ value, onChange, inputClass, areaId = "hub-area" }: Props) {
  const { t } = useMarket();
  const [countryOpen, setCountryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const countryLabel = value.countryCode
    ? (MARKETS.find((m) => m.code === value.countryCode)?.name ?? value.countryCode)
    : "";

  const cityOptions = useMemo(
    () => citiesForHubCountry(value.countryCode),
    [value.countryCode],
  );

  const selectCountry = (code: HomeMarketCode | "") => {
    onChange({ ...value, countryCode: code, city: "" });
    setCountryOpen(false);
  };

  const selectCity = (city: string) => {
    onChange({ ...value, city });
    setCityOpen(false);
  };

  const countryLbl = (t as { lz_country_lbl?: string }).lz_country_lbl ?? "Shteti";
  const countryPh = (t as { lz_country_ph?: string }).lz_country_ph ?? "Zgjidh shtetin";
  const countryAny = (t as { lz_country_any?: string }).lz_country_any ?? "Të gjitha shtetet";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <span className="text-sm text-gray-600 flex items-center gap-1">
          <MapPin size={14} className="text-blue-600" aria-hidden />
          {countryLbl}
        </span>
        <Popover open={countryOpen} onOpenChange={setCountryOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={countryOpen}
              className={cn(
                "w-full justify-between font-normal rounded-xl",
                inputClass,
                !value.countryCode && "text-muted-foreground",
              )}
            >
              <span className="truncate">{value.countryCode ? countryLabel : countryPh}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl" align="start">
            <Command>
              <CommandList>
                <CommandGroup>
                  <CommandItem
                    value="__any_country__"
                    onSelect={() => selectCountry("")}
                    className="min-h-11"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        !value.countryCode ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {countryAny}
                  </CommandItem>
                  {HOME_MARKET_CODES.map((code) => {
                    const m = MARKETS.find((x) => x.code === code);
                    return (
                      <CommandItem
                        key={code}
                        value={`${code} ${m?.name ?? code}`}
                        onSelect={() => selectCountry(code)}
                        className="min-h-11"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value.countryCode === code ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {m?.name ?? code}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <span className="text-sm text-gray-600 flex items-center gap-1">
          <MapPin size={14} className="text-blue-600" aria-hidden />
          {t.lz_city_lbl}
        </span>
        <Popover open={cityOpen} onOpenChange={setCityOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={cityOpen}
              className={cn(
                "w-full justify-between font-normal rounded-xl",
                inputClass,
                !value.city && "text-muted-foreground",
              )}
            >
              <span className="truncate">{value.city || t.lz_city_ph}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl"
            align="start"
          >
            <Command>
              <CommandInput placeholder={t.lz_city_search_ph} className="h-11" />
              <CommandList>
                <CommandEmpty>{t.lz_city_none}</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="__any_city__"
                    onSelect={() => selectCity("")}
                    className="min-h-11"
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4", !value.city ? "opacity-100" : "opacity-0")}
                    />
                    {t.lz_city_any}
                  </CommandItem>
                  {cityOptions.map((city) => (
                    <CommandItem
                      key={city}
                      value={city}
                      onSelect={() => selectCity(city)}
                      className="min-h-11"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value.city === city ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {city}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor={areaId} className="text-sm text-gray-600">
          {t.fj_area_lbl}
        </Label>
        <Input
          id={areaId}
          value={value.areaZone}
          onChange={(e) => onChange({ ...value, areaZone: e.target.value })}
          placeholder={t.fj_area_ph}
          className={inputClass}
        />
      </div>

      <p className="text-xs text-gray-500 leading-relaxed">
        {(t as { fj_search_location_hint?: string }).fj_search_location_hint ??
          "Kërkoni sipas vendit ku është njoftimi. Postimi mund të bëhet nga çdo shtet — kategoria tregon vetëm llojin e produktit."}
      </p>
    </div>
  );
}
