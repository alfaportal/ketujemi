import { useRef, useState } from "react";
import { Camera, ChevronLeft, ChevronRight, ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useListingImageUpload } from "@/lib/listing-image-upload";
import { LISTING_MAX_PHOTOS } from "@/lib/special-listing-categories";
import { useShopProductsCopy } from "@/lib/shop-products-i18n";
import { useToast } from "@/hooks/use-toast";

type Props = {
  urls: string[];
  onChange: (urls: string[]) => void;
};

export function ShopProductPhotoUpload({ urls, onChange }: Props) {
  const c = useShopProductsCopy();
  const { toast } = useToast();
  const imageUpload = useListingImageUpload();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const atLimit = urls.length >= LISTING_MAX_PHOTOS;

  async function onFilesSelected(files: File[]) {
    if (!files.length || !imageUpload.ready) {
      if (!imageUpload.ready) {
        toast({ title: c.productError, description: c.uploadNotReady, variant: "destructive" });
      }
      return;
    }
    const remaining = LISTING_MAX_PHOTOS - urls.length;
    if (remaining <= 0) {
      toast({ title: c.photosMaxReached.replace("{max}", String(LISTING_MAX_PHOTOS)), variant: "destructive" });
      return;
    }
    const batch = files.slice(0, remaining);
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of batch) {
        uploaded.push(await imageUpload.uploadFile(file));
      }
      onChange([...urls, ...uploaded].slice(0, LISTING_MAX_PHOTOS));
    } catch {
      toast({ title: c.uploadFailed, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
      if (cameraRef.current) cameraRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(urls.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= urls.length) return;
    const copy = [...urls];
    [copy[index], copy[next]] = [copy[next]!, copy[index]!];
    onChange(copy);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label>{c.productPhotos}</Label>
        <span className="text-xs text-gray-500">
          {urls.length}/{LISTING_MAX_PHOTOS}
        </span>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">{c.productPhotosHint}</p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => void onFilesSelected(Array.from(e.target.files ?? []))}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => void onFilesSelected(Array.from(e.target.files ?? []))}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-h-10"
          disabled={uploading || atLimit || !imageUpload.ready}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          <span className="ml-2">{uploading ? c.uploadingPhotos : c.addPhotos}</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-10"
          disabled={uploading || atLimit || !imageUpload.ready}
          onClick={() => cameraRef.current?.click()}
        >
          <Camera className="h-4 w-4" />
          <span className="ml-2">{c.takePhoto}</span>
        </Button>
      </div>

      {urls.length > 0 ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {urls.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="relative w-[88px] h-[88px] rounded-xl overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-50"
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                aria-label={c.removePhoto}
              >
                <X size={12} className="text-white" />
              </button>
              {i > 0 ? (
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  className="absolute bottom-1 left-1 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow border border-gray-200"
                  aria-label={c.movePhotoLeft}
                >
                  <ChevronLeft size={14} />
                </button>
              ) : null}
              {i < urls.length - 1 ? (
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  className="absolute bottom-1 right-1 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow border border-gray-200"
                  aria-label={c.movePhotoRight}
                >
                  <ChevronRight size={14} />
                </button>
              ) : null}
              {i === 0 ? (
                <div className="absolute top-1 left-1 text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded">
                  {c.coverPhotoLabel}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
