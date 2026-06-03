/** User-visible reasons when a new listing cannot be posted (client + API). */

export type ListingPostApiBody = {
  error?: string;
  message?: string;
  moderation_reason?: string;
  reason?: string;
  details?: Array<{ path?: (string | number)[]; message?: string }>;
  show_packages?: boolean;
  used?: number;
  limit?: number;
  wallet_balance_cents?: number;
  balance_cents?: number;
  root_category_name?: string | null;
  quota_resets_at?: string;
};

const FIELD_LABELS_SQ: Record<string, string> = {
  parent_category_id: "Kategoria kryesore",
  category_id: "Nënkategoria",
  brand_category_id: "Marka",
  title: "Titulli",
  description: "Përshkrimi",
  price: "Çmimi",
  location: "Qyteti",
  seller_phone: "Telefoni",
  seller_name: "Emri",
  image_url: "Foto",
  condition: "Gjendja",
};

const ERROR_DEFAULTS_SQ: Record<string, string> = {
  "Authentication required":
    "Duhet të jeni i kyçur për të postuar. Hyni në llogari dhe provoni përsëri.",
  "Account suspended": "Llogaria juaj është pezulluar. Kontaktoni mbështetjen.",
  "Invalid request body": "Të dhënat e formularit nuk janë të vlefshme.",
  DUPLICATE_LISTING: "Ky njoftim ekziston tashmë. Nuk mund të postoni të njëjtën gjë dy herë.",
  DUPLICATE_LISTING_SELF: "Keni një njoftim të ngjashëm aktiv. Ndryshoni titullin ose përshkrimin.",
  BLACKLIST_WORD: "Përmbajtja përmban fjalë të ndaluara. Ndryshoni titullin ose përshkrimin.",
  PHONE_IN_DESCRIPTION:
    "Numri i telefonit nuk lejohet në përshkrim. Vendoseni vetëm në fushën e telefonit.",
  EXTERNAL_LINK_IN_DESCRIPTION: "Linqet e jashtme nuk lejohen në përshkrim.",
  LISTING_POST_COOLDOWN: "Ki pak durim — prisni 30 sekonda për postimin tjetër.",
  LISTING_POST_IP_COOLDOWN: "Shumë postime nga i njëjti rrjet. Prisni pak dhe provoni përsëri.",
  LISTING_MODERATION_REJECTED:
    "Njoftimi nuk u miratua. Kontrolloni titullin, përshkrimin dhe çmimin.",
  FREE_QUOTA_EXCEEDED:
    "Postimet falas këtë muaj për këtë kategori janë shpenzuar. Vazhdoni me €0.30/postim nga portofoli (Profili) ose prisni muajin e ri.",
  LISTING_MONTHLY_CAP:
    "Ke arritur limitin e njoftimeve aktive. Fshini një njoftim të vjetër ose blini paketë shtesë.",
  WALLET_INSUFFICIENT: "Balanca në portofol nuk mjafton. Mbushni portofolin nga profili.",
  BUSINESS_QUOTA_EXCEEDED: "Keni arritur limitin falas të biznesit. Mbushni portofolin (€0.30/shpallje).",
  BUSINESS_MONTHLY_CAP: "Keni arritur limitin mujor të njoftimeve aktive për llogarinë e biznesit.",
  BUSINESS_PENDING_ACTIVATION: "Llogaria e biznesit nuk është aktivizuar ende.",
  BUSINESS_NOT_ACTIVE: "Llogaria e biznesit nuk është aktive.",
  BUSINESS_PRICE_REQUIRED: "Vendosni çmimin e produktit.",
  BUSINESS_NO_CONTACT_PRICE: "Mos vendosni kontakt në vend të çmimit.",
  BUSINESS_GENERIC_AD: "Përshkrimi duket shumë i përgjithshëm — specifikoni produktin.",
  BUSINESS_STOCK_PHOTO: "Fotoja duket si stok — përdorni foto të produktit tuaj.",
  BUSINESS_TITLE_TOO_SHORT: "Titulli i biznesit është shumë i shkurtër.",
  DHURATA_PRICE_ZERO: "Dhurata falas duhet çmim 0 €.",
  DHURATA_PHOTO_REQUIRED: "Dhurata falas kërkon të paktën një foto.",
  DHURATA_PHOTO_LIMIT: "Dhurata falas lejon vetëm numrin e lejuar të fotove.",
  DHURATA_SELLING_LANGUAGE: "Përshkrimi i dhuratës duhet në gjuhën e duhur.",
  DHURATA_PHOTO_MISMATCH: "Fotot nuk përputhen me rregullat e dhuratës falas.",
  KERKOJ_PHOTO_REQUIRED: "Kërkesa kërkon të paktën një foto.",
  KERKOJ_PHOTO_LIMIT: "Kërkesa lejon vetëm numrin e lejuar të fotove.",
  KERKOJ_SELLING_LANGUAGE: "Përshkrimi i kërkesës duhet në gjuhën e duhur.",
  KERKOJ_ONE_ACTIVE: "Keni tashmë një kërkesë aktive në këtë kategori.",
  KERKOJ_PHOTO_MISMATCH: "Fotot nuk përputhen me rregullat e kërkesës.",
  RATE_LIMIT_POST_LISTING:
    "Shumë përpjekje për të postuar. Prisni pak (maks. 5 postime në orë) dhe provoni përsëri.",
  "Too many requests": "Shumë kërkesa në të njëjtën kohë. Prisni 1–2 minuta dhe provoni përsëri.",
};

const PACKAGE_ERRORS = new Set([
  "FREE_QUOTA_EXCEEDED",
  "LISTING_MONTHLY_CAP",
  "WALLET_INSUFFICIENT",
  "BUSINESS_QUOTA_EXCEEDED",
  "BUSINESS_MONTHLY_CAP",
]);

function formatApiValidationDetails(
  details: ListingPostApiBody["details"],
): string | null {
  if (!details?.length) return null;
  const parts = details.map((issue) => {
    const path = issue.path?.filter((p) => typeof p === "string").join(".") ?? "";
    const label = path ? (FIELD_LABELS_SQ[path.split(".")[0] ?? ""] ?? path) : "";
    const msg = issue.message?.trim();
    if (label && msg) return `${label}: ${msg}`;
    return msg ?? label;
  }).filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

function defaultForErrorCode(code: string | undefined): string | null {
  if (!code) return null;
  return ERROR_DEFAULTS_SQ[code] ?? ERROR_DEFAULTS_SQ[code.replace(/ /g, "_")] ?? null;
}

export function resolveListingPostApiError(
  body: ListingPostApiBody,
  status: number,
  fallback: string,
): { message: string; openPackages: boolean } {
  const code = body.error?.trim();
  const fromDetails = formatApiValidationDetails(body.details);
  const explicit =
    body.message?.trim() ||
    body.moderation_reason?.trim() ||
    body.reason?.trim() ||
    fromDetails ||
    defaultForErrorCode(code);

  if (explicit) {
    return {
      message: explicit,
      openPackages: !!(code && PACKAGE_ERRORS.has(code)),
    };
  }

  if (status === 401) {
    return {
      message: ERROR_DEFAULTS_SQ["Authentication required"]!,
      openPackages: false,
    };
  }
  if (status === 403 && code === "Account suspended") {
    return { message: ERROR_DEFAULTS_SQ["Account suspended"]!, openPackages: false };
  }
  if (status === 400) {
    return {
      message: fromDetails ?? "Plotësoni saktë të gjitha fushat e detyrueshme dhe provoni përsëri.",
      openPackages: false,
    };
  }
  if (status === 429) {
    return {
      message:
        defaultForErrorCode(code) ??
        "Shumë përpjekje. Prisni pak dhe provoni përsëri.",
      openPackages: false,
    };
  }

  return { message: fallback, openPackages: !!(code && PACKAGE_ERRORS.has(code)) };
}

/** Collect react-hook-form / Zod field messages for toast + banner. */
export function collectFormValidationMessages(
  errors: Record<string, unknown>,
): string[] {
  const out: string[] = [];
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const rec = node as Record<string, unknown>;
    if (typeof rec.message === "string" && rec.message.trim()) {
      out.push(rec.message.trim());
      return;
    }
    for (const val of Object.values(rec)) walk(val);
  };
  walk(errors);
  return [...new Set(out)];
}

export function formatFormValidationSummary(messages: string[], fallback: string): string {
  if (!messages.length) return fallback;
  if (messages.length === 1) return messages[0]!;
  return messages.slice(0, 4).join(" · ");
}
