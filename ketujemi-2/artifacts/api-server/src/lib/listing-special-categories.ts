import { db, categoriesTable, listingsTable } from "@workspace/db";
import { and, eq, gt, isNull, or, sql } from "drizzle-orm";
import {
  countListingImages,
  DHURATA_PRICE_ZERO_MESSAGE,
  findKerkojBlockedWord,
  isDhurataFalasSlug,
  isKerkojTeBlejSlug,
  KERKOJ_ACTIVE_LIFETIME_DAYS,
  KERKOJ_MAX_ACTIVE_PER_USER,
  KERKOJ_MAX_PHOTOS,
  KERKOJ_TE_BLEJ_SLUG,
  splitListingImageUrls,
} from "../../../../lib/special-listing-categories.js";
import { claudeVisionJsonCompletion } from "./claude-client.js";
import { logListingModerationRejection } from "./listing-moderation-rejection-log.js";
import { sendAdminMonitorEmail, monitorEmailHtml } from "./admin-monitor-email.js";
import { expiresAtAfterListingLifetime } from "./listing-lifetime.js";

export {
  DHURATA_FALAS_SLUG,
  DHURATA_PRICE_ZERO_MESSAGE,
  KERKOJ_TE_BLEJ_SLUG,
  isDhurataFalasSlug,
  isKerkojTeBlejSlug,
} from "../../../../lib/special-listing-categories.js";

export type CategorySlugMeta = {
  id: number;
  name: string;
  slug: string | null;
  rootSlug: string | null;
};

export async function resolveCategorySlugMeta(categoryId: number): Promise<CategorySlugMeta | null> {
  const [cat] = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      parent_id: categoriesTable.parent_id,
    })
    .from(categoriesTable)
    .where(eq(categoriesTable.id, categoryId))
    .limit(1);

  if (!cat) return null;

  let rootSlug = cat.slug?.trim() ?? null;
  if (cat.parent_id) {
    const [parent] = await db
      .select({ slug: categoriesTable.slug, parent_id: categoriesTable.parent_id })
      .from(categoriesTable)
      .where(eq(categoriesTable.id, cat.parent_id))
      .limit(1);
    if (parent && !parent.parent_id) {
      rootSlug = parent.slug?.trim() ?? rootSlug;
    } else if (parent?.parent_id) {
      const [grand] = await db
        .select({ slug: categoriesTable.slug })
        .from(categoriesTable)
        .where(eq(categoriesTable.id, parent.parent_id))
        .limit(1);
      rootSlug = grand?.slug?.trim() ?? parent.slug?.trim() ?? rootSlug;
    }
  }

  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    rootSlug,
  };
}

export function expiresAtForCategoryRootSlug(rootSlug: string | null | undefined): Date {
  if (isKerkojTeBlejSlug(rootSlug)) {
    const d = new Date();
    d.setDate(d.getDate() + KERKOJ_ACTIVE_LIFETIME_DAYS);
    return d;
  }
  return expiresAtAfterListingLifetime();
}

async function notifyAdminSpecialListingIssue(opts: {
  subject: string;
  lines: string[];
  title: string;
  reason: string;
  categoryId: number;
  userId: number;
}): Promise<void> {
  void logListingModerationRejection({
    title: opts.title,
    reason: opts.reason,
    categoryId: opts.categoryId,
    userId: opts.userId,
  }).catch(() => undefined);

  void sendAdminMonitorEmail({
    subject: opts.subject,
    text: opts.lines.join("\n"),
    html: monitorEmailHtml(opts.subject, opts.lines),
  }).catch(() => undefined);
}

async function countActiveKerkojListingsForUser(userId: number, kerkojCategoryId: number): Promise<number> {
  const now = new Date();
  const [row] = await db
    .select({ total: sql<number>`cast(count(*) as int)` })
    .from(listingsTable)
    .where(
      and(
        eq(listingsTable.user_id, userId),
        eq(listingsTable.category_id, kerkojCategoryId),
        eq(listingsTable.status, "active"),
        gt(listingsTable.expires_at, now),
      ),
    );
  return row?.total ?? 0;
}

async function getKerkojCategoryId(): Promise<number | null> {
  const [row] = await db
    .select({ id: categoriesTable.id })
    .from(categoriesTable)
    .where(and(eq(categoriesTable.slug, KERKOJ_TE_BLEJ_SLUG), isNull(categoriesTable.parent_id)))
    .limit(1);
  return row?.id ?? null;
}

const PHOTO_MATCH_SYSTEM = `You are a visual moderator for KetuJemi.com buyer-request listings ("Kërkoj të Blej").
Reply with ONLY JSON: {"approved":boolean,"reason":"string"}
- approved true when the photo(s) reasonably match what the title/description ask to BUY or FIND (same product type/category).
- approved false when photos clearly show unrelated items, spam, or content that looks like a seller ad instead of a buyer request.
- reason in Albanian when rejected; empty when approved.`;

async function verifyKerkojPhotoMatchesListing(input: {
  title: string;
  description: string;
  imageUrl: string | null;
}): Promise<{ approved: boolean; reason: string }> {
  const urls = splitListingImageUrls(input.imageUrl).slice(0, KERKOJ_MAX_PHOTOS);
  if (urls.length === 0) {
    return { approved: false, reason: "Duhet të ngarkoni të paktën një foto." };
  }

  const parsed = await claudeVisionJsonCompletion<{ approved: boolean; reason: string }>({
    system: PHOTO_MATCH_SYSTEM,
    userText: JSON.stringify({
      title: input.title.trim(),
      description: input.description.trim().slice(0, 3000),
      instruction: "Do these photos match what the user is looking to buy?",
    }),
    imageUrls: urls,
    maxTokens: 512,
  });

  if (!parsed || typeof parsed.approved !== "boolean") {
    return { approved: true, reason: "" };
  }

  return {
    approved: parsed.approved,
    reason: typeof parsed.reason === "string" ? parsed.reason.trim() : "",
  };
}

export type SpecialCategoryGateResult =
  | { ok: true; price: number }
  | { ok: false; error: string; message: string; reason: string };

/** Category-specific validation before standard moderation. */
export async function assertSpecialCategoryListingRules(input: {
  userId: number;
  categoryId: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
}): Promise<SpecialCategoryGateResult> {
  const meta = await resolveCategorySlugMeta(input.categoryId);
  const rootSlug = meta?.rootSlug ?? null;

  if (isDhurataFalasSlug(rootSlug)) {
    if (input.price > 0) {
      return {
        ok: false,
        error: "DHURATA_PRICE_ZERO",
        message: DHURATA_PRICE_ZERO_MESSAGE,
        reason: DHURATA_PRICE_ZERO_MESSAGE,
      };
    }
    return { ok: true, price: 0 };
  }

  if (!isKerkojTeBlejSlug(rootSlug)) {
    return { ok: true, price: input.price };
  }

  const imageCount = countListingImages(input.imageUrl);
  if (imageCount < 1) {
    const reason = "Duhet të ngarkoni të paktën një foto.";
    await notifyAdminSpecialListingIssue({
      subject: "Kërkoj të Blej — mungon foto",
      lines: [
        `Përdoruesi #${input.userId} u bllokua.`,
        `Titulli: ${input.title}`,
        reason,
      ],
      title: input.title,
      reason,
      categoryId: input.categoryId,
      userId: input.userId,
    });
    return { ok: false, error: "KERKOJ_PHOTO_REQUIRED", message: reason, reason };
  }
  if (imageCount > KERKOJ_MAX_PHOTOS) {
    const reason = `Maksimumi ${KERKOJ_MAX_PHOTOS} foto për kërkesa.`;
    return { ok: false, error: "KERKOJ_PHOTO_LIMIT", message: reason, reason };
  }

  const blocked = findKerkojBlockedWord(`${input.title}\n${input.description}`);
  if (blocked) {
    const reason = `Gjuha e shitjes nuk lejohet në "Kërkoj të Blej" (fjalë e ndaluar: "${blocked}").`;
    await notifyAdminSpecialListingIssue({
      subject: "Kërkoj të Blej — fjalë e ndaluar",
      lines: [
        `Përdoruesi #${input.userId} u bllokua automatikisht.`,
        `Titulli: ${input.title}`,
        reason,
      ],
      title: input.title,
      reason,
      categoryId: input.categoryId,
      userId: input.userId,
    });
    return { ok: false, error: "KERKOJ_SELLING_LANGUAGE", message: reason, reason };
  }

  const kerkojId = await getKerkojCategoryId();
  if (kerkojId) {
    const active = await countActiveKerkojListingsForUser(input.userId, kerkojId);
    if (active >= KERKOJ_MAX_ACTIVE_PER_USER) {
      const reason = "Ke tashmë një kërkesë aktive. Prit që të skadojë ose fshije para se të postosh një të re.";
      return { ok: false, error: "KERKOJ_ONE_ACTIVE", message: reason, reason };
    }
  }

  const photoCheck = await verifyKerkojPhotoMatchesListing({
    title: input.title,
    description: input.description,
    imageUrl: input.imageUrl,
  });
  if (!photoCheck.approved) {
    const reason =
      photoCheck.reason ||
      "Fotoja nuk përputhet me titullin ose përshkrimin e kërkesës.";
    await notifyAdminSpecialListingIssue({
      subject: "Kërkoj të Blej — foto e dyshimtë",
      lines: [
        `Përdoruesi #${input.userId} u bllokua automatikisht.`,
        `Titulli: ${input.title}`,
        reason,
      ],
      title: input.title,
      reason,
      categoryId: input.categoryId,
      userId: input.userId,
    });
    return { ok: false, error: "KERKOJ_PHOTO_MISMATCH", message: reason, reason };
  }

  return { ok: true, price: 0 };
}
