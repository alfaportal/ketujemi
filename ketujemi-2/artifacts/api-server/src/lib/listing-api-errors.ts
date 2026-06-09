/** Minimal Zod issue shape — avoids a direct `zod` dependency in this package. */
export interface ZodIssue {
  path: (string | number)[];
  message: string;
  code?: string;
}

const FIELD_LABELS_SQ: Record<string, string> = {
  title: "Titulli",
  description: "Përshkrimi",
  price: "Çmimi",
  category_id: "Kategoria",
  location: "Qyteti",
  seller_phone: "Telefoni",
  seller_name: "Emri",
  condition: "Gjendja",
  image_url: "Foto",
};

export function formatZodIssuesMessage(issues: ZodIssue[]): string {
  if (!issues.length) {
    return "Të dhënat e formularit nuk janë të vlefshme. Kontrolloni fushat dhe provoni përsëri.";
  }
  const parts = issues.slice(0, 5).map((issue) => {
    const key = String(issue.path[0] ?? "");
    const label = FIELD_LABELS_SQ[key] ?? key;
    const msg = issue.message?.trim();
    return label && msg ? `${label}: ${msg}` : msg ?? label;
  });
  return parts.filter(Boolean).join(" · ");
}
