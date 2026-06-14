import type { AdminListing } from "@/lib/admin-api";

type CategoryRow = { id: number; parent_id?: number | null };

function parseListingDescription(description: string): { specs: Record<string, string>; body: string } {
  const sep = "\n\n";
  const idx = description.indexOf(sep);
  if (idx > 0) {
    const firstLine = description.slice(0, idx);
    if (firstLine.includes(": ") && !firstLine.includes("\n")) {
      const specs: Record<string, string> = {};
      firstLine.split(" · ").forEach((pair) => {
        const colon = pair.indexOf(": ");
        if (colon > 0) {
          specs[pair.slice(0, colon).trim()] = pair.slice(colon + 2).trim();
        }
      });
      return { specs, body: description.slice(idx + sep.length) };
    }
  }
  return { specs: {}, body: description };
}

/** Walk category tree to parent / sub / brand ids for the posting form. */
export function resolveListingCategoryIds(
  leafId: number,
  categories: CategoryRow[],
): { parent_category_id: number; category_id: number; brand_category_id: number } {
  const chain: number[] = [];
  let id = leafId;
  const byId = new Map(categories.map((c) => [c.id, c]));
  while (id > 0) {
    chain.unshift(id);
    const cat = byId.get(id);
    if (!cat?.parent_id) break;
    id = cat.parent_id;
  }
  if (chain.length >= 3) {
    return {
      parent_category_id: chain[0]!,
      category_id: chain[1]!,
      brand_category_id: chain[chain.length - 1]!,
    };
  }
  if (chain.length === 2) {
    return { parent_category_id: chain[0]!, category_id: chain[1]!, brand_category_id: 0 };
  }
  if (chain.length === 1) {
    return { parent_category_id: chain[0]!, category_id: 0, brand_category_id: 0 };
  }
  return { parent_category_id: 0, category_id: 0, brand_category_id: 0 };
}

/** Prefill new-listing form fields from an admin listing row. */
export function adminListingToFormPrefill(
  listing: AdminListing,
  categories: CategoryRow[],
): Record<string, string | number | boolean | undefined> {
  const { specs, body } = parseListingDescription(listing.description ?? "");
  const cats = resolveListingCategoryIds(listing.category_id, categories);
  const price = Number(listing.price) || 0;

  return {
    ...cats,
    title: listing.title,
    description: body,
    price,
    price_agreement: price === 0,
    location: listing.location,
    seller_name: listing.seller_name,
    seller_phone: listing.seller_phone,
    condition: listing.condition,
    xMarka: specs.Marka ?? "",
    xModeli: listing.vehicle_model ?? specs.Modeli ?? "",
    xViti: listing.vehicle_year != null ? String(listing.vehicle_year) : specs.Viti ?? "",
    xKm:
      listing.vehicle_mileage_km != null
        ? String(listing.vehicle_mileage_km)
        : specs.Kilometrazha ?? "",
    xKarburanti: listing.vehicle_fuel ?? specs.Karburanti ?? "",
    xTransmisioni: specs.Transmisioni ?? "",
    xTipi: listing.vehicle_body_type ?? specs.Tipi ?? "",
    xNgjyraV: specs.Ngjyra ?? "",
    xMotori: specs.Motori ?? "",
    xFuqia: specs.Fuqia ?? "",
    xGjendjaT: specs["Gjendja teknike"] ?? "",
    xKlima: specs.Klima ?? "",
    xPanorama: specs.Panorama ?? "",
    xSellerEmail: specs.Email ?? "",
    xSellerAddress: specs.Adresa ?? "",
    xSiperfaqja:
      listing.property_sqm != null ? String(listing.property_sqm) : specs["Sipërfaqja"] ?? "",
    xKati: listing.property_floor ?? specs.Kati ?? "",
    xDhomat: specs.Dhomat ?? "",
    xFurnished: specs.Mobilimi ?? "",
    xTelMarka: specs["Marka telefonit"] ?? "",
    xTelModeli: specs["Modeli telefonit"] ?? "",
    xKapaciteti: specs.Kapaciteti ?? "",
    xNgjyra: specs.Ngjyra ?? "",
  };
}
