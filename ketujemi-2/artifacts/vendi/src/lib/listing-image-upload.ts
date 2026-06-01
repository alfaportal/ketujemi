import { useCallback, useEffect, useState } from "react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { uploadImageToCloudinary } from "./cloudinary-config";

const BUILD_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim() ?? "";
const BUILD_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim() ?? "";

export type ImageUploadProvider = "b2" | "cloudinary" | null;

export type ListingImageUploadConfig = {
  provider: ImageUploadProvider;
  cloudinaryCloudName: string;
  cloudinaryUploadPreset: string;
  ready: boolean;
};

/** Fetch `/api/config/public` then expose unified upload for listing photos (Backblaze B2 or Cloudinary). */
export function useListingImageUpload(): ListingImageUploadConfig & {
  uploadFile: (file: File) => Promise<string>;
} {
  const [provider, setProvider] = useState<ImageUploadProvider>(null);
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState(BUILD_CLOUD_NAME);
  const [cloudinaryUploadPreset, setCloudinaryUploadPreset] = useState(BUILD_UPLOAD_PRESET);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void fetchWithTimeout("/api/config/public", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : {}))
      .then(
        (data: {
          imageUploadProvider?: string;
          cloudinaryCloudName?: string;
          cloudinaryUploadPreset?: string;
        }) => {
          if (cancelled) return;
          const raw = data.imageUploadProvider;
          const p: ImageUploadProvider =
            raw === "b2" || raw === "cloudinary" ? raw : null;
          setProvider(p);
          const cn = data.cloudinaryCloudName?.trim() ?? "";
          const preset = data.cloudinaryUploadPreset?.trim() ?? "";
          setCloudinaryCloudName((prev) => cn || prev);
          setCloudinaryUploadPreset((prev) => preset || prev);

          const cloudReady = !!(cn || BUILD_CLOUD_NAME) && !!(preset || BUILD_UPLOAD_PRESET);
          setReady(p === "b2" || (p === "cloudinary" && cloudReady));
        },
      )
      .catch(() => {
        if (!cancelled) {
          const fallbackCloud = !!(BUILD_CLOUD_NAME && BUILD_UPLOAD_PRESET);
          setProvider(fallbackCloud ? "cloudinary" : null);
          setReady(fallbackCloud);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const uploadFile = useCallback(
    async (file: File): Promise<string> => {
      const ct = file.type?.trim() || "image/jpeg";

      if (provider === "b2") {
        const pres = await fetchWithTimeout("/api/uploads/b2-presign", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: ct }),
        });
        const body = (await pres.json().catch(() => ({}))) as {
          uploadUrl?: string;
          publicUrl?: string;
          contentType?: string;
        };
        if (!pres.ok || !body.uploadUrl || !body.publicUrl) {
          throw new Error("presign_failed");
        }
        const putCt = body.contentType?.trim() || ct;
        const put = await fetchWithTimeout(body.uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": putCt },
        });
        if (!put.ok) throw new Error("b2_upload_failed");
        return body.publicUrl;
      }

      if (provider === "cloudinary") {
        const cn = cloudinaryCloudName || BUILD_CLOUD_NAME;
        const preset = cloudinaryUploadPreset || BUILD_UPLOAD_PRESET;
        return uploadImageToCloudinary(file, { cloudName: cn, uploadPreset: preset }, "listing");
      }

      throw new Error("upload_not_configured");
    },
    [provider, cloudinaryCloudName, cloudinaryUploadPreset],
  );

  return {
    provider,
    cloudinaryCloudName,
    cloudinaryUploadPreset,
    ready,
    uploadFile,
  };
}
