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
  };
  onChange: (field: ShopSocialField, value: string) => void;
  inputClassName?: string;
};

function SocialField({
  label,
  value,
  onChange,
  inputClassName,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  inputClassName?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("min-h-12", inputClassName)}
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}

export function ShopSocialUrlFields({ values, onChange, inputClassName }: Props) {
  const c = useShopFormCopy();

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">{c.socialUrlHint}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <SocialField
          label={c.facebook}
          value={values.facebook}
          onChange={(v) => onChange("facebook", v)}
          inputClassName={inputClassName}
        />
        <SocialField
          label={c.instagram}
          value={values.instagram}
          onChange={(v) => onChange("instagram", v)}
          inputClassName={inputClassName}
        />
        <SocialField
          label={c.tiktok}
          value={values.tiktok}
          onChange={(v) => onChange("tiktok", v)}
          inputClassName={inputClassName}
        />
        <SocialField
          label={c.whatsapp}
          value={values.whatsapp}
          onChange={(v) => onChange("whatsapp", v)}
          inputClassName={inputClassName}
        />
        <div className="sm:col-span-2">
          <SocialField
            label={c.website}
            value={values.website}
            onChange={(v) => onChange("website", v)}
            inputClassName={inputClassName}
          />
        </div>
      </div>
    </div>
  );
}
