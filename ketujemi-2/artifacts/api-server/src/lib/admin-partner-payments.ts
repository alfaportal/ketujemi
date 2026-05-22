import { db, businessPaymentsTable } from "@workspace/db";
import { desc, inArray } from "drizzle-orm";
import {
  expectedPackagePriceCents,
  PARTNER_PACKAGE_PRICE_EUR,
} from "./business-partner";

export type PartnerPaymentSummary = {
  status: "none" | "pending" | "paid" | "partial";
  label: string;
  expected_eur: number;
  latest_amount_eur: number | null;
  latest_purpose: string | null;
  paid_at: string | null;
};

export async function loadPaymentSummariesByUserIds(
  userIds: number[],
  tierByUserId: Map<number, string | null>,
): Promise<Map<number, PartnerPaymentSummary>> {
  const out = new Map<number, PartnerPaymentSummary>();
  if (userIds.length === 0) return out;

  for (const id of userIds) {
    const tier = tierByUserId.get(id) ?? "standard";
    const expected = tier === "vip" ? PARTNER_PACKAGE_PRICE_EUR.vip : PARTNER_PACKAGE_PRICE_EUR.partner;
    out.set(id, {
      status: "none",
      label: `Pa pagesë (€${expected} pritur)`,
      expected_eur: expected,
      latest_amount_eur: null,
      latest_purpose: null,
      paid_at: null,
    });
  }

  const rows = await db
    .select()
    .from(businessPaymentsTable)
    .where(inArray(businessPaymentsTable.user_id, userIds))
    .orderBy(desc(businessPaymentsTable.created_at));

  for (const id of userIds) {
    const tier = tierByUserId.get(id) ?? "standard";
    const expectedCents = expectedPackagePriceCents(tier);
    const userPayments = rows.filter((r) => r.user_id === id);
    if (userPayments.length === 0) continue;

    const paid = userPayments.find((p) => p.status === "paid");
    const pending = userPayments.find((p) => p.status === "pending");
    const latest = userPayments[0]!;

    if (paid) {
      const eur = paid.amount_cents / 100;
      const matchesPackage = paid.amount_cents >= expectedCents;
      out.set(id, {
        status: matchesPackage ? "paid" : "partial",
        label: matchesPackage ? `Paguar €${eur}` : `Paguar €${eur} (shumë tjetër)`,
        expected_eur: tier === "vip" ? PARTNER_PACKAGE_PRICE_EUR.vip : PARTNER_PACKAGE_PRICE_EUR.partner,
        latest_amount_eur: eur,
        latest_purpose: paid.purpose,
        paid_at: paid.paid_at?.toISOString() ?? null,
      });
    } else if (pending) {
      const eur = pending.amount_cents / 100;
      out.set(id, {
        status: "pending",
        label: `Në pritje €${eur}`,
        expected_eur: tier === "vip" ? PARTNER_PACKAGE_PRICE_EUR.vip : PARTNER_PACKAGE_PRICE_EUR.partner,
        latest_amount_eur: eur,
        latest_purpose: pending.purpose,
        paid_at: null,
      });
    } else {
      out.set(id, {
        status: "none",
        label: `Pagesa: ${latest.status}`,
        expected_eur: tier === "vip" ? PARTNER_PACKAGE_PRICE_EUR.vip : PARTNER_PACKAGE_PRICE_EUR.partner,
        latest_amount_eur: latest.amount_cents / 100,
        latest_purpose: latest.purpose,
        paid_at: latest.paid_at?.toISOString() ?? null,
      });
    }
  }

  return out;
}
