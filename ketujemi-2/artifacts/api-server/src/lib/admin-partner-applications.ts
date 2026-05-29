import { db, partnersTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { packageLabelFromTier } from "./partner-registration";
import { loadBusinessPartnerCategoryMap, setBusinessPartnerCategories, getBusinessPartnerCategoryIds } from "./business-partner-categories";

export type AdminPartnerRow = {
  id: number;
  user_id: number | null;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  iban: string;
  package: string;
  package_label: string;
  logo_url: string | null;
  link_url: string;
  link_type: string | null;
  status: string;
  payment_status: string;
  payment_label: string;
  rejected_reason: string | null;
  created_at: string;
  last_payment_at: string | null;
  suspended_at: string | null;
  accepted_terms: boolean;
  client_ip: string | null;
  category_ids: number[];
};

export function paymentLabel(status: string, pkg: string): string {
  if (status === "paid") return "Paguar";
  if (status === "pending") return "Pagesë në pritje";
  const eur = pkg === "vip" ? 50 : 30;
  return `Pa paguar (€${eur})`;
}

export async function listAdminPartnerApplications(): Promise<AdminPartnerRow[]> {
  const [rows, categoryMap] = await Promise.all([
    db.select().from(partnersTable).orderBy(desc(partnersTable.created_at)),
    loadBusinessPartnerCategoryMap(),
  ]);
  return rows.map((p) => ({
    id: p.id,
    user_id: p.user_id,
    business_name: p.business_name,
    contact_name: p.contact_name,
    email: p.email,
    phone: p.phone,
    iban: p.iban,
    package: p.package,
    package_label: packageLabelFromTier(p.package === "vip" ? "vip" : "standard"),
    logo_url: p.logo_url,
    link_url: p.link_url,
    link_type: p.link_type,
    status: p.status,
    payment_status: p.payment_status,
    payment_label: paymentLabel(p.payment_status, p.package),
    rejected_reason: p.rejected_reason,
    created_at: p.created_at.toISOString(),
    last_payment_at: p.last_payment_at?.toISOString() ?? null,
    suspended_at: p.suspended_at?.toISOString() ?? null,
    accepted_terms: p.accepted_terms,
    client_ip: p.client_ip,
    category_ids: p.user_id ? (categoryMap.get(p.user_id) ?? []) : [],
  }));
}

export async function updatePartnerApplicationCategories(
  partnerApplicationId: number,
  categoryIds: number[],
): Promise<{ category_ids: number[] } | null> {
  const [partner] = await db
    .select({ user_id: partnersTable.user_id })
    .from(partnersTable)
    .where(eq(partnersTable.id, partnerApplicationId))
    .limit(1);

  if (!partner?.user_id) return null;

  await setBusinessPartnerCategories(partner.user_id, categoryIds);
  const saved = await getBusinessPartnerCategoryIds(partner.user_id);
  return { category_ids: saved };
}

export function countByStatus(rows: AdminPartnerRow[]) {
  return {
    pending: rows.filter((r) => r.status === "pending" && r.payment_status !== "paid").length,
    active: rows.filter((r) => r.status === "active").length,
    suspended: rows.filter((r) => r.status === "suspended").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
  };
}
