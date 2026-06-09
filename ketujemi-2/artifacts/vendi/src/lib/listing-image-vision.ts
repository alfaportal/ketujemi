import { fileToVisionBase64 } from "./listing-image-prepare";

export { fileToVisionBase64 };

/** Fetch an existing listing photo URL and prepare vision payload for AI analyze. */
export async function imageUrlToVisionBase64(
  url: string,
): Promise<{ data: string; mediaType: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("image_fetch_failed");
  const blob = await res.blob();
  const type = blob.type.startsWith("image/") ? blob.type : "image/jpeg";
  const file = new File([blob], "listing.jpg", { type });
  return fileToVisionBase64(file);
}

export type ListingImageAnalysis = {
  parent_category_id: number;
  category_id: number;
  brand_category_id?: number;
  parent_name: string;
  category_name: string;
  brand_name?: string;
  title: string;
  description: string;
  confidence: "high" | "medium" | "low";
};
