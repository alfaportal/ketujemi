import { useCallback } from "react";
import { uploadVideoToCloudinary, useCloudinaryConfig } from "./cloudinary-config";
import {
  LISTING_VIDEO_MAX_BYTES,
  LISTING_VIDEO_MAX_MB,
  listingVideoShortenMessage,
  prepareListingVideoFile,
  type VideoPrepareProgress,
} from "./listing-video-prepare";

export { LISTING_VIDEO_MAX_BYTES, LISTING_VIDEO_MAX_MB, listingVideoShortenMessage };

export function listingVideoTooLargeMessage(uiLang: string): { title: string; description: string } {
  return listingVideoShortenMessage(uiLang);
}

export function listingVideoFormatsHint(uiLang: string): string {
  const mb = String(LISTING_VIDEO_MAX_MB);
  switch (uiLang) {
    case "mk":
      return `(MP4, MOV, AVI • Full HD • автоматски до ${mb} MB)`;
    case "mne":
      return `(MP4, MOV, AVI • Full HD • automatski do ${mb} MB)`;
    case "en":
      return `(MP4, MOV, AVI • Full HD • auto-optimized to ${mb} MB)`;
    default:
      return `(MP4, MOV, AVI • Full HD • optimizohet automatikisht deri në ${mb} MB)`;
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

export type ListingVideoUploadPhase = "preparing" | "uploading";

/** Cloudinary video upload for listing form (optional, max 1 per listing). */
export function useListingVideoUpload() {
  const cloudinary = useCloudinaryConfig();

  const uploadFile = useCallback(
    async (
      file: File,
      opts?: {
        onPhase?: (phase: ListingVideoUploadPhase) => void;
        onPrepareProgress?: VideoPrepareProgress;
      },
    ): Promise<string> => {
      if (!cloudinary.ready) {
        throw new Error("upload_not_configured");
      }
      if (!isAllowedListingVideoFile(file)) {
        throw new Error("invalid_video_format");
      }

      opts?.onPhase?.("preparing");
      const prepared = await prepareListingVideoFile(file, opts?.onPrepareProgress);

      if (prepared.size > LISTING_VIDEO_MAX_BYTES) {
        throw new Error("video_shorten_needed");
      }

      opts?.onPhase?.("uploading");
      return uploadVideoToCloudinary(prepared, cloudinary);
    },
    [cloudinary],
  );

  return {
    ready: cloudinary.ready,
    uploadFile,
  };
}
