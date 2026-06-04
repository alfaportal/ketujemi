import { useCallback } from "react";
import { uploadVideoToCloudinary, useCloudinaryConfig } from "./cloudinary-config";

export const LISTING_VIDEO_MAX_BYTES = 100 * 1024 * 1024;

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
