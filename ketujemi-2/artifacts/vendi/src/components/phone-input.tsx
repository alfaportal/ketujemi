import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import { smsPhonePrefixLabel } from "@/lib/phone-prefix-i18n";
import {
  SMS_PHONE_PREFIXES,
  buildPhoneDigits,
  dialFromMarketPrefix,
  parsePhoneDigits,
  sanitizeNationalDigits,
} from "@/lib/phone-prefixes";

export type PhoneInputProps = {
  id?: string;
  value: string;
  onChange: (fullDigits: string) => void;
  defaultDial?: string;
  disabled?: boolean;
  className?: string;
  nationalPlaceholder?: string;
};

export function PhoneInput({
  id,
  value,
  onChange,
  defaultDial = "383",
  disabled,
  className,
  nationalPlaceholder = "XX XXX XXX",
}: PhoneInputProps) {
  const { uiLang } = useMarket();
  const locale = translationKeyForUiLang(uiLang);
  const parsed = useMemo(() => parsePhoneDigits(value), [value]);
  const [dial, setDial] = useState(parsed?.dial ?? defaultDial);
  const [national, setNational] = useState(parsed?.national ?? "");

  useEffect(() => {
    if (!value) {
      setDial(defaultDial);
      setNational("");
      return;
    }
    const p = parsePhoneDigits(value);
    if (p) {
      setDial(p.dial);
      setNational(p.national);
    }
  }, [value, defaultDial]);

  const emit = (nextDial: string, nextNational: string) => {
    setDial(nextDial);
    setNational(nextNational);
    onChange(buildPhoneDigits(nextDial, nextNational));
  };

  const selected = SMS_PHONE_PREFIXES.find((p) => p.dial === dial) ?? SMS_PHONE_PREFIXES[0];

  return (
    <div className={cn("flex gap-2 min-w-0", className)}>
      <Select
        value={dial}
        onValueChange={(nextDial) => emit(nextDial, national)}
        disabled={disabled}
      >
        <SelectTrigger
          className="h-12 min-h-12 w-[7.25rem] shrink-0 rounded-xl border-gray-200 px-2.5 text-base sm:w-[8.5rem]"
          aria-label="Country code"
        >
          <SelectValue>
            <span className="flex items-center gap-1.5 truncate">
              <span className="text-lg leading-none" aria-hidden>
                {selected.flag}
              </span>
              <span className="font-semibold text-gray-800">+{selected.dial}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[min(70vh,20rem)]">
          {SMS_PHONE_PREFIXES.map((p) => (
            <SelectItem key={p.dial} value={p.dial} className="min-h-11">
              <span className="flex items-center gap-2">
                <span className="text-lg leading-none" aria-hidden>
                  {p.flag}
                </span>
                <span className="font-medium">{smsPhonePrefixLabel(p.dial, locale)}</span>
                <span className="text-gray-500">+{p.dial}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        disabled={disabled}
        value={national}
        onChange={(e) => emit(dial, sanitizeNationalDigits(e.target.value))}
        placeholder={nationalPlaceholder}
        className="min-h-12 h-12 flex-1 min-w-0 text-base"
      />
    </div>
  );
}

/** Default dial from market selector prefix (+383 → 383). */
export function defaultDialForMarket(marketPrefix: string): string {
  const d = dialFromMarketPrefix(marketPrefix);
  return SMS_PHONE_PREFIXES.some((p) => p.dial === d) ? d : "383";
}
