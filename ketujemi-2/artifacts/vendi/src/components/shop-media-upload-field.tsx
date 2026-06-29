import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadImageToCloudinary, useCloudinaryConfig } from "@/lib/cloudinary-config";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  uploadLabel: string;
  uploadingLabel: string;
  uploadFailedMessage: string;
  urlPlaceholder?: string;
  previewClassName?: string;
  aspect?: "square" | "wide";
};

export function ShopMediaUploadField({
  id,
  label,
  value,
  onChange,
  uploadLabel,
  uploadingLabel,
  uploadFailedMessage,
  urlPlaceholder = "https://…",
  previewClassName,
  aspect = "square",
}: Props) {
  const cloudinary = useCloudinaryConfig();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !cloudinary.ready) {
      if (!cloudinary.ready) setError("Ngarkimi nuk është gati — rifreskoni faqen.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const url = await uploadImageToCloudinary(file, cloudinary, "shop");
      onChange(url);
    } catch {
      setError(uploadFailedMessage);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const previewSize =
    aspect === "wide"
      ? "h-24 w-full max-w-md rounded-xl object-cover border"
      : "h-16 w-16 rounded-xl object-cover border";

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <input
        ref={fileRef}
        id={id}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void onFileChange(e)}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          className="min-h-10"
          onClick={() => fileRef.current?.click()}
          disabled={busy || !cloudinary.ready}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          <span className="ml-2">{busy ? uploadingLabel : uploadLabel}</span>
        </Button>
        {value ? (
          <img src={value} alt="" className={cn(previewSize, previewClassName)} />
        ) : (
          <span className="text-xs text-gray-500">Ose vendosni URL më poshtë</span>
        )}
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={urlPlaceholder}
        className="min-h-10"
      />
      {error ? (
        <p className="text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
