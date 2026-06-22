import {
  db,
  ensureShopSchema,
  pool,
  shopApplicationsTable,
  shopsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";

export type AdminShopInsertValues = {
  shop_name: string;
  logo_url: string;
  description: string;
  category: string;
  category_id: null;
  directory_category_slug: string;
  directory_subcategory_slug: string;
  directory_category_id: number | null;
  directory_subcategory_id: number | null;
  country: string;
  city: string;
  region: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  whatsapp: string | null;
  website: string | null;
  contact_name: string;
  phone: string;
  email: string;
  admin_notes: string | null;
};

function pgErrorCode(err: unknown): string | undefined {
  const e = err as { code?: string; cause?: { code?: string } };
  return e.code ?? e.cause?.code;
}

function pgErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

let shopSchemaReadyOnce: Promise<void> | null = null;

async function ensureShopTablesReady(): Promise<void> {
  if (!shopSchemaReadyOnce) {
    shopSchemaReadyOnce = ensureShopSchema(pool).catch((err) => {
      shopSchemaReadyOnce = null;
      throw err;
    });
  }
  await shopSchemaReadyOnce;
}

async function insertAdminShopPair(
  adminUserId: number,
  shopValues: AdminShopInsertValues,
): Promise<{ application: typeof shopApplicationsTable.$inferSelect; shop: typeof shopsTable.$inferSelect }> {
  const [application] = await db
    .insert(shopApplicationsTable)
    .values({
      user_id: adminUserId,
      ...shopValues,
      status: "approved",
    })
    .returning();

  if (!application) {
    throw new Error("Aplikimi i dyqanit nuk u krijua.");
  }

  const [shop] = await db
    .insert(shopsTable)
    .values({
      user_id: adminUserId,
      application_id: application.id,
      ...shopValues,
      is_active: true,
    })
    .returning();

  if (!shop) {
    throw new Error("Dyqani nuk u krijua në bazën e të dhënave.");
  }

  await db
    .update(shopApplicationsTable)
    .set({ shop_id: shop.id })
    .where(eq(shopApplicationsTable.id, application.id));

  return { application, shop };
}

/** Fast path: slug-only directory fields, no taxonomy seed, no transaction wrapper. */
export async function persistAdminShopCreate(
  adminUserId: number,
  shopValues: AdminShopInsertValues,
): Promise<{ application: typeof shopApplicationsTable.$inferSelect; shop: typeof shopsTable.$inferSelect }> {
  try {
    return await insertAdminShopPair(adminUserId, shopValues);
  } catch (err) {
    const code = pgErrorCode(err);
    const msg = pgErrorMessage(err).toLowerCase();

    if (code === "42703" || msg.includes("does not exist")) {
      await ensureShopTablesReady();
      return insertAdminShopPair(adminUserId, shopValues);
    }

    throw err;
  }
}

export function formatAdminShopSaveError(err: unknown): string {
  const msg = pgErrorMessage(err);
  const lower = msg.toLowerCase();
  const code = pgErrorCode(err);

  if (code === "23503" || lower.includes("foreign key")) {
    return "Të dhënat nuk u lidhën me bazën. Rifreskoni faqen dhe provoni përsëri.";
  }
  if (code === "42703" || lower.includes("does not exist")) {
    return "Mungon struktura e bazës për dyqanet. Prisni 1–2 min pas deploy-it dhe provoni përsëri.";
  }
  if (lower.includes("connection") || lower.includes("econnrefused") || lower.includes("timeout")) {
    return "Lidhja me bazën e të dhënave vonoi. Provoni përsëri pas disa sekondash.";
  }
  if (msg.length > 0 && msg.length < 280) {
    return `Dyqani nuk u ruajt: ${msg}`;
  }
  return "Dyqani nuk u ruajt. Provoni përsëri ose kontaktoni supportin.";
}
