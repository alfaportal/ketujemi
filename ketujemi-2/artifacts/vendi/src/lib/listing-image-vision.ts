export { fileToVisionBase64 } from "./listing-image-prepare";

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
