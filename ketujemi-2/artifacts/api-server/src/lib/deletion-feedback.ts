import {
  db,
  deletionFeedbackTable,
  DELETION_REASONS,
  type DeletionEntityType,
  type DeletionReason,
  shopsTable,
} from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";

export { DELETION_REASONS, type DeletionReason, type DeletionEntityType };

const REASON_LABELS_SQ: Record<DeletionReason, string> = {
  unsatisfied_service: "Nuk jam i kënaqur me shërbimin",
  not_found: "Nuk gjeta çfarë kërkoja",
  too_annoying: "Po më bezdis shumë",
  better_platform: "Gjeta një platformë tjetër më të mirë",
  no_longer_need: "Nuk kam më nevojë",
  other: "Tjetër",
};

export function deletionReasonLabel(reason: string): string {
  if (DELETION_REASONS.includes(reason as DeletionReason)) {
    return REASON_LABELS_SQ[reason as DeletionReason];
  }
  return reason;
}

export type DeletionSurveyPayload = {
  reason: DeletionReason;
  custom_text?: string | null;
  additional_feedback?: string | null;
};

export function parseDeletionSurveyBody(
  body: Record<string, unknown>,
): { ok: true; data: DeletionSurveyPayload } | { ok: false; message: string } {
  const reasonRaw = typeof body.reason === "string" ? body.reason.trim() : "";
  if (!DELETION_REASONS.includes(reasonRaw as DeletionReason)) {
    return { ok: false, message: "Zgjidhni një arsye para se të vazhdoni." };
  }
  const reason = reasonRaw as DeletionReason;
  const custom_text =
    typeof body.custom_text === "string" ? body.custom_text.trim().slice(0, 2000) : null;
  if (reason === "other" && !custom_text) {
    return { ok: false, message: "Shpjegoni arsyen kur zgjidhni «Tjetër»." };
  }
  const additional_feedback =
    typeof body.additional_feedback === "string"
      ? body.additional_feedback.trim().slice(0, 4000) || null
      : null;
  return { ok: true, data: { reason, custom_text, additional_feedback } };
}

export async function saveDeletionFeedback(opts: {
  userId: number;
  entityType: DeletionEntityType;
  shopId?: number | null;
  reason: DeletionReason;
  customText?: string | null;
  additionalFeedback?: string | null;
}): Promise<number> {
  const [row] = await db
    .insert(deletionFeedbackTable)
    .values({
      user_id: opts.userId,
      entity_type: opts.entityType,
      shop_id: opts.shopId ?? null,
      reason: opts.reason,
      custom_text: opts.customText ?? null,
      additional_feedback: opts.additionalFeedback ?? null,
    })
    .returning({ id: deletionFeedbackTable.id });
  return row.id;
}

export async function listDeletionFeedbackForAdmin(opts: {
  page?: number;
  limit?: number;
}): Promise<{
  rows: Array<{
    id: number;
    user_id: number;
    entity_type: string;
    shop_id: number | null;
    shop_name: string | null;
    reason: string;
    reason_label: string;
    custom_text: string | null;
    additional_feedback: string | null;
    deleted_at: string;
  }>;
  total: number;
  stats: Array<{ reason: string; reason_label: string; count: number }>;
}> {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(100, Math.max(1, opts.limit ?? 50));
  const offset = (page - 1) * limit;

  const [countRow] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(deletionFeedbackTable);

  const statsRows = await db
    .select({
      reason: deletionFeedbackTable.reason,
      count: sql<number>`count(*)::int`,
    })
    .from(deletionFeedbackTable)
    .groupBy(deletionFeedbackTable.reason)
    .orderBy(desc(sql`count(*)`));

  const rows = await db
    .select({
      id: deletionFeedbackTable.id,
      user_id: deletionFeedbackTable.user_id,
      entity_type: deletionFeedbackTable.entity_type,
      shop_id: deletionFeedbackTable.shop_id,
      reason: deletionFeedbackTable.reason,
      custom_text: deletionFeedbackTable.custom_text,
      additional_feedback: deletionFeedbackTable.additional_feedback,
      deleted_at: deletionFeedbackTable.deleted_at,
      shop_name: shopsTable.shop_name,
    })
    .from(deletionFeedbackTable)
    .leftJoin(shopsTable, eq(deletionFeedbackTable.shop_id, shopsTable.id))
    .orderBy(desc(deletionFeedbackTable.deleted_at))
    .limit(limit)
    .offset(offset);

  return {
    total: countRow?.total ?? 0,
    stats: statsRows.map((s) => ({
      reason: s.reason,
      reason_label: deletionReasonLabel(s.reason),
      count: s.count,
    })),
    rows: rows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      entity_type: r.entity_type,
      shop_id: r.shop_id,
      shop_name: r.shop_name,
      reason: r.reason,
      reason_label: deletionReasonLabel(r.reason),
      custom_text: r.custom_text,
      additional_feedback: r.additional_feedback,
      deleted_at: r.deleted_at.toISOString(),
    })),
  };
}

export function formatDeletionFeedbackForAdminEmail(opts: {
  entityType: DeletionEntityType;
  userId: number;
  shopId?: number | null;
  shopName?: string | null;
  reason: DeletionReason;
  customText?: string | null;
  additionalFeedback?: string | null;
}): string[] {
  const lines = [
    `Lloji: ${opts.entityType === "user" ? "Llogari" : "Dyqan"}`,
    `User ID: ${opts.userId}`,
  ];
  if (opts.shopId) lines.push(`Shop ID: ${opts.shopId}`);
  if (opts.shopName) lines.push(`Dyqani: ${opts.shopName}`);
  lines.push(`Arsyeja: ${deletionReasonLabel(opts.reason)}`);
  if (opts.customText) lines.push(`Tjetër (detaje): ${opts.customText}`);
  if (opts.additionalFeedback) lines.push(`Feedback shtesë: ${opts.additionalFeedback}`);
  return lines;
}
