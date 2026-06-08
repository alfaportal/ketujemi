import { z } from "zod";

/** Avoid Zod "Expected number, received nan" when optional/hidden numeric fields are empty. */
function finiteFormNumber(fallback = 0) {
  return z.preprocess((val) => {
    if (val === undefined || val === null || val === "") return fallback;
    const n = typeof val === "number" ? val : Number(val);
    return Number.isFinite(n) ? n : fallback;
  }, z.number());
}

export type ListingFormSchemaMessages = {
  parentCategory: string;
  titleMin: string;
  descriptionMin: string;
  location: string;
  phoneMin: string;
  sellerName: string;
};

export function buildNewListingSchema(m: ListingFormSchemaMessages) {
  return z.object({
    parent_category_id: finiteFormNumber(0).pipe(z.number().min(1, m.parentCategory)),
    category_id: finiteFormNumber(0),
    brand_category_id: finiteFormNumber(0).optional(),
    title: z.string().min(5, m.titleMin),
    description: z.string().min(15, m.descriptionMin),
    price: finiteFormNumber(0).pipe(z.number().min(0)),
    price_agreement: z.boolean().default(false),
    image_url: z.string().optional(),
    location: z.string().min(1, m.location),
    seller_phone: z.string().min(5, m.phoneMin),
    seller_name: z.string().min(2, m.sellerName),
    condition: z.enum(["New", "Used", "Damaged"]),
    xMarka: z.string().optional(),
    xModeli: z.string().optional(),
    xViti: z.string().optional(),
    xKm: z.string().optional(),
    xKarburanti: z.string().optional(),
    xTransmisioni: z.string().optional(),
    xTipi: z.string().optional(),
    xNgjyraV: z.string().optional(),
    xMotori: z.string().optional(),
    xFuqia: z.string().optional(),
    xGjendjaT: z.string().optional(),
    xKlima: z.string().optional(),
    xPanorama: z.string().optional(),
    xSellerEmail: z.string().optional(),
    xSellerAddress: z.string().optional(),
    xSiperfaqja: z.string().optional(),
    xKati: z.string().optional(),
    xDhomat: z.string().optional(),
    xFurnished: z.string().optional(),
    xTelMarka: z.string().optional(),
    xTelModeli: z.string().optional(),
    xKapaciteti: z.string().optional(),
    xNgjyra: z.string().optional(),
  });
}

export type NewListingFormData = z.infer<ReturnType<typeof buildNewListingSchema>>;
