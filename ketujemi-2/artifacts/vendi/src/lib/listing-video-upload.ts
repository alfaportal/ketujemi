import { useCallback } from "react";
import { uploadVideoToCloudinary, useCloudinaryConfig } from "./cloudinary-config";

export const LISTING_VIDEO_MAX_MB = 150;
export const LISTING_VIDEO_MAX_BYTES = LISTING_VIDEO_MAX_MB * 1024 * 1024;

export function listingVideoTooLargeMessage(uiLang: string): { title: string; description: string } {
  const mb = String(LISTING_VIDEO_MAX_MB);
  switch (uiLang) {
    case "mk":
      return {
        title: "Видеото е преголемо",
        description: `Максималната големина е ${mb} MB. Изберете помало видео.`,
      };
    case "mne":
      return {
        title: "Video je preveliko",
        description: `Maksimalna veličina je ${mb} MB. Odaberite manji video.`,
      };
    case "en":
      return {
        title: "Video is too large",
        description: `Maximum size is ${mb} MB. Choose a smaller video.`,
      };
    default:
      return {
        title: "Video shumë e madhe",
        description: `Maksimumi është ${mb} MB. Zgjidhni një video më të vogël.`,
      };
  }
}

export function listingVideoFormatsHint(uiLang: string): string {
  const base = "(MP4, MOV, AVI";
  switch (uiLang) {
    case "mk":
      return `${base} • макс. ${LISTING_VIDEO_MAX_MB} MB)`;
    case "mne":
      return `${base} • max ${LISTING_VIDEO_MAX_MB} MB)`;
    case "en":
      return `${base} • max ${LISTING_VIDEO_MAX_MB} MB)`;
    default:
      return `${base} • max ${LISTING_VIDEO_MAX_MB} MB)`;
  }
}

const VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/avi",
]);

const VIDEO_EXT = /\.(mp4|mov|avi)$/i;

export function isAllowedListingVideoFile(file: File): boolean {
  const mime = file.type?.trim().toLowerCase() ?? "";
  if (mime && VIDEO_MIME_TYPES.has(mime)) return true;
  return VIDEO_EXT.test(file.name);
}

/** Cloudinary video upload for listing form (optional, max 1 per listing). */
export function useListingVideoUpload() {
  const cloudinary = useCloudinaryConfig();

  const uploadFile = useCallback(
    async (file: File): Promise<string> => {
      if (!cloudinary.ready) {
        throw new Error("upload_not_configured");
      }
      if (!isAllowedListingVideoFile(file)) {
        throw new Error("invalid_video_format");
      }
      if (file.size > LISTING_VIDEO_MAX_BYTES) {
        throw new Error("video_too_large");
      }
      return uploadVideoToCloudinary(file, cloudinary);
    },
    [cloudinary],
  );

  return {
    ready: cloudinary.ready,
    uploadFile,
  };
}
