import { useEffect, useState } from "react";
import { fetchWithTimeout, VIDEO_UPLOAD_TIMEOUT_MS } from "@/lib/fetch-with-timeout";
import {
  CLOUDINARY_LISTINGS_FOLDER,
  CLOUDINARY_PARTNERS_FOLDER,
  CLOUDINARY_SHOPS_FOLDER,
  CLOUDINARY_SITE_ASSETS_FOLDER,
} from "../../../../lib/cloudinary-asset.ts";

const BUILD_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim() ?? "";
const BUILD_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim() ?? "";

export type CloudinaryConfig = {
  cloudName: string;
  uploadPreset: string;
  ready: boolean;
};

export function useCloudinaryConfig(): CloudinaryConfig {
  const [cloudName, setCloudName] = useState(BUILD_CLOUD_NAME);
  const [uploadPreset, setUploadPreset] = useState(BUILD_UPLOAD_PRESET);
  const [ready, setReady] = useState(!!BUILD_CLOUD_NAME && !!BUILD_UPLOAD_PRESET);

  useEffect(() => {
    if (BUILD_CLOUD_NAME && BUILD_UPLOAD_PRESET) {
      setReady(true);
      return;
    }

    let cancelled = false;
    void fetchWithTimeout("/api/config/public", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: { cloudinaryCloudName?: string; cloudinaryUploadPreset?: string }) => {
        if (cancelled) return;
        const cn = data.cloudinaryCloudName?.trim() ?? "";
        const preset = data.cloudinaryUploadPreset?.trim() ?? "";
        setCloudName(cn);
        setUploadPreset(preset);
        setReady(!!cn && !!preset);
      })
      .catch(() => {
        if (!cancelled) setReady(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { cloudName, uploadPreset, ready };
}

/**
 * listing — shpallje (fshihen automatikisht)
 * partner — logo/banner partnerësh (ruhen gjithmonë → partners/)
 * site-asset — banera, kategori, UI (ruhen gjithmonë → site-assets/)
 */
export type CloudinaryUploadTarget = "listing" | "partner" | "shop" | "site-asset";

export async function uploadImageToCloudinary(
  file: File,
  config: Pick<CloudinaryConfig, "cloudName" | "uploadPreset">,
  target: CloudinaryUploadTarget = "listing",
): Promise<string> {
  const { cloudName, uploadPreset } = config;
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary config missing");
  }

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", uploadPreset);

  if (target === "partner") {
    fd.append("folder", CLOUDINARY_PARTNERS_FOLDER);
    fd.append("tags", "partner,permanent");
    fd.append("context", "permanent=true|asset_type=partner");
  } else if (target === "shop") {
    fd.append("folder", CLOUDINARY_SHOPS_FOLDER);
    fd.append("tags", "shop,permanent");
    fd.append("context", "permanent=true|asset_type=shop");
  } else if (target === "site-asset") {
    fd.append("folder", CLOUDINARY_SITE_ASSETS_FOLDER);
    fd.append("tags", "site,permanent");
    fd.append("context", "permanent=true|asset_type=site");
  } else {
    fd.append("folder", CLOUDINARY_LISTINGS_FOLDER);
    fd.append("tags", "listing,deletable");
  }

  const res = await fetchWithTimeout(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    throw new Error("Upload failed");
  }

  const data = (await res.json()) as { secure_url?: string };
  if (!data.secure_url) {
    throw new Error("Upload failed");
  }

  return data.secure_url;
}

/** Listing video — same unsigned preset/folder as photos; uses Cloudinary video upload API. */
export async function uploadVideoToCloudinary(
  file: File,
  config: Pick<CloudinaryConfig, "cloudName" | "uploadPreset">,
): Promise<string> {
  const { cloudName, uploadPreset } = config;
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary config missing");
  }

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", uploadPreset);
  fd.append("folder", CLOUDINARY_LISTINGS_FOLDER);
  fd.append("tags", "listing,video,deletable");
  fd.append("resource_type", "video");

  const res = await fetchWithTimeout(
    `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
    {
      method: "POST",
      body: fd,
    },
    VIDEO_UPLOAD_TIMEOUT_MS,
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    if (res.status === 413 || /file size too large|max(imum)? file size/i.test(detail)) {
      throw new Error("video_too_large");
    }
    throw new Error("video_upload_failed");
  }

  const data = (await res.json()) as { secure_url?: string };
  if (!data.secure_url) {
    throw new Error("Video upload failed");
  }

  return data.secure_url;
}
