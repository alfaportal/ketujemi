import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  DIASPORA_MARKET_CODES,
  HOME_MARKET_CODES,
  HOME_MARKET_ISO,
  MARKETS,
  type ListingMarketCode,
} from "@/lib/market-context";

type Props = {
  value: ListingMarketCode;
  onChange: (code: ListingMarketCode) => void;
  countryLabel?: string;
  className?: string;
};

const homeMarkets = HOME_MARKET_CODES.map((code) => MARKETS.find((m) => m.code === code)!);
const diasporaMarkets = DIASPORA_MARKET_CODES.map((code) => MARKETS.find((m) => m.code === code)!);

export function ListingCountryPicker({
  value,
  onChange,
  countryLabel = "Shteti",
  className,
}: Props) {
  return (
    <div className={cn("space-y-3", className)}>
      <Label>{countryLabel}</Label>

      <div className="grid grid-cols-3 gap-1.5 max-w-[14rem]">
        {homeMarkets.map((m) => {
          const selected = value === m.code;
          const iso = HOME_MARKET_ISO[m.code as keyof typeof HOME_MARKET_ISO];
          return (
            <button
              key={m.code}
              type="button"
              data-testid={`button-listing-country-${m.code}`}
              onClick={() => onChange(m.code as ListingMarketCode)}
              className={cn(
                "min-h-10 rounded-lg border-2 flex flex-col items-center justify-center gap-0.5 touch-manipulation transition-colors px-1",
                selected
                  ? "border-blue-500 bg-blue-50 text-blue-800"
                  : "border-gray-200 hover:border-gray-300 text-gray-700",
              )}
            >
              <span className="text-xs font-black leading-none tracking-wide">{iso}</span>
              <span className="text-[9px] leading-tight text-center font-medium line-clamp-2">
                {m.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {diasporaMarkets.map((m) => {
          const selected = value === m.code;
          return (
            <button
              key={m.code}
              type="button"
              data-testid={`button-listing-country-${m.code}`}
              onClick={() => onChange(m.code as ListingMarketCode)}
              className={cn(
                "min-h-10 rounded-lg border-2 flex flex-col items-center justify-center gap-0 touch-manipulation transition-colors px-1",
                selected
                  ? "border-blue-500 bg-blue-50 text-blue-800"
                  : "border-gray-200 hover:border-gray-300 text-gray-700",
              )}
            >
              <span className="text-[9px] leading-none font-medium lowercase text-gray-500">
                diaspora
              </span>
              <span className="text-[10px] font-bold leading-none lowercase">{m.code}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
