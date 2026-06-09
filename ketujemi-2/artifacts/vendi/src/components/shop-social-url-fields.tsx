import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SHOP_SOCIAL_PREFIX,
  type ShopSocialField,
} from "@/lib/shop-social-url-input";
import { useShopFormCopy } from "@/lib/shop-application-i18n";
import { cn } from "@/lib/utils";

type Props = {
  values: {
    facebook: string;
    instagram: string;
    tiktok: string;
    whatsapp: string;
    website: string;
  };
  onChange: (field: ShopSocialField, suffix: string) => void;
  inputClassName?: string;
};

function PrefixedField({
  field,
  label,
  placeholder,
  prefix,
  value,
  onChange,
  inputClassName,
}: {
  field: ShopSocialField;
  label: string;
  placeholder: string;
  prefix: string;
  value: string;
  onChange: (v: string) => void;
  inputClassName?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex min-h-12 rounded-xl border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <span
          className="hidden sm:inline-flex shrink-0 items-center px-2.5 text-xs text-muted-foreground bg-muted/60 border-r border-input font-mono select-none"
          aria-hidden
        >
          {prefix}
        </span>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\s/g, ""))}
          placeholder={placeholder}
          className={cn(
            "min-h-12 border-0 rounded-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
            inputClassName,
          )}
          inputMode={field === "whatsapp" ? "numeric" : "text"}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      <p className="sm:hidden text-[11px] text-muted-foreground font-mono break-all">{prefix}</p>
    </div>
  );
}

export function ShopSocialUrlFields({ values, onChange, inputClassName }: Props) {
  const c = useShopFormCopy();

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">{c.socialUrlHint}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <PrefixedField
          field="facebook"
          label={c.facebook}
          prefix={SHOP_SOCIAL_PREFIX.facebook}
          placeholder={c.socialPhFacebook}
          value={values.facebook}
          onChange={(v) => onChange("facebook", v)}
          inputClassName={inputClassName}
        />
        <PrefixedField
          field="instagram"
          label={c.instagram}
          placeholder={c.socialPhInstagram}
          prefix={SHOP_SOCIAL_PREFIX.instagram}
          value={values.instagram}
          onChange={(v) => onChange("instagram", v)}
          inputClassName={inputClassName}
        />
        <PrefixedField
          field="tiktok"
          label={c.tiktok}
          prefix={SHOP_SOCIAL_PREFIX.tiktok}
          placeholder={c.socialPhTiktok}
          value={values.tiktok}
          onChange={(v) => onChange("tiktok", v)}
          inputClassName={inputClassName}
        />
        <PrefixedField
          field="whatsapp"
          label={c.whatsapp}
          prefix={SHOP_SOCIAL_PREFIX.whatsapp}
          placeholder={c.socialPhWhatsapp}
          value={values.whatsapp}
          onChange={(v) => onChange("whatsapp", v)}
          inputClassName={inputClassName}
        />
        <div className="sm:col-span-2">
          <PrefixedField
            field="website"
            label={c.website}
            prefix={SHOP_SOCIAL_PREFIX.website}
            placeholder={c.socialPhWebsite}
            value={values.website}
            onChange={(v) => onChange("website", v)}
            inputClassName={inputClassName}
          />
        </div>
      </div>
    </div>
  );
}
