import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ShopSocialField } from "@/lib/shop-social-url-input";
import { useShopFormCopy } from "@/lib/shop-application-i18n";
import { cn } from "@/lib/utils";

type Props = {
  values: {
    facebook: string;
    instagram: string;
    tiktok: string;
    whatsapp: string;
    website: string;
    youtube: string;
  };
  onChange: (field: ShopSocialField, value: string) => void;
  inputClassName?: string;
  /** Admin / storefront hints for Porosit + social icons */
  showStorefrontHints?: boolean;
};

function SocialField({
  label,
  hint,
  value,
  onChange,
  inputClassName,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  inputClassName?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {hint ? <p className="text-xs text-gray-500 leading-snug">{hint}</p> : null}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("min-h-12", inputClassName)}
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
      />
    </div>
  );
}

export function ShopSocialUrlFields({
  values,
  onChange,
  inputClassName,
  showStorefrontHints = false,
}: Props) {
  const c = useShopFormCopy();

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        {showStorefrontHints
          ? "Këto linke shfaqen në webfaqen e dyqanit (/dyqani/slug): ikona sociale në krye, WhatsApp për butonin «Porosit», telefoni për thirrje."
          : c.socialUrlHint}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <SocialField
          label={c.whatsapp}
          hint={
            showStorefrontHints
              ? "Numri ose linku WhatsApp — klienti klikon «Porosit» dhe hapet mesazhi automatik."
              : undefined
          }
          value={values.whatsapp}
          onChange={(v) => onChange("whatsapp", v)}
          inputClassName={inputClassName}
          placeholder="+38344123456"
        />
        <SocialField
          label={c.facebook}
          value={values.facebook}
          onChange={(v) => onChange("facebook", v)}
          inputClassName={inputClassName}
          placeholder="https://facebook.com/..."
        />
        <SocialField
          label={c.instagram}
          value={values.instagram}
          onChange={(v) => onChange("instagram", v)}
          inputClassName={inputClassName}
          placeholder="https://instagram.com/..."
        />
        <SocialField
          label={c.tiktok}
          value={values.tiktok}
          onChange={(v) => onChange("tiktok", v)}
          inputClassName={inputClassName}
          placeholder="https://tiktok.com/@..."
        />
        <SocialField
          label="YouTube"
          hint={
            showStorefrontHints
              ? "Linku i kanalit YouTube — shfaqet si ikonë në webfaqe."
              : undefined
          }
          value={values.youtube}
          onChange={(v) => onChange("youtube", v)}
          inputClassName={inputClassName}
          placeholder="https://youtube.com/@kanali"
        />
        <div className="sm:col-span-2">
          <SocialField
            label={c.website}
            hint={
              showStorefrontHints
                ? "Faqja e jashtme e firmës (p.sh. jetfund.com) — JO linku ketujemi.com/dyqani/… (ai shkon te «Emri në link» lart)."
                : undefined
            }
            value={values.website}
            onChange={(v) => onChange("website", v)}
            inputClassName={inputClassName}
            placeholder="https://dyqani-im.com"
          />
        </div>
      </div>
    </div>
  );
}
