import { useState } from "react";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { primaryListingImageUrl } from "@/lib/listing-images";

type Props = {
  imageUrl?: string | null;
  primaryImageUrl?: string | null;
  alt: string;
  className?: string;
};

export function ListingCardImage({ imageUrl, primaryImageUrl, alt, className }: Props) {
  const src = primaryImageUrl ?? primaryListingImageUrl(imageUrl);
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "w-full h-full bg-gray-200 flex flex-col items-center justify-center gap-1",
          className,
        )}
        aria-hidden
      >
        <Camera className="h-10 w-10 text-gray-400 stroke-[1.5]" aria-hidden />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn("w-full h-full object-cover object-center", className)}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
