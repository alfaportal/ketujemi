/** Client-side checks before POST /api/listings — every blocker must have a clear Albanian reason. */

export type ListingPostPreflightInput = {
  parentCategoryId: number;
  categoryId: number;
  brandCategoryId: number;
  hasBrands: boolean;
  subcategoryCount: number;
  title: string;
  description: string;
  price: number;
  priceAgreement: boolean;
  location: string;
  sellerName: string;
  sellerPhone: string;
  imageCount: number;
  isKerkoj: boolean;
  isDhurata: boolean;
  isUploading: boolean;
};

export function collectListingPostPreflightIssues(input: ListingPostPreflightInput): string[] {
  const issues: string[] = [];

  if (!input.parentCategoryId || input.parentCategoryId < 1) {
    issues.push("Zgjidhni kategorinë kryesore.");
  }
  if (input.subcategoryCount > 1 && (!input.categoryId || input.categoryId < 1)) {
    if (input.title.trim().length < 5) {
      issues.push("Shkruani titullin (min. 5 karaktere) për të caktuar nënkategorinë.");
    } else {
      issues.push("Zgjidhni nënkategorinë nga lista.");
    }
  }
  if (input.hasBrands && (!input.brandCategoryId || input.brandCategoryId < 1)) {
    issues.push("Zgjidhni markën / modelin e produktit.");
  }
  const title = input.title.trim();
  if (title.length < 5) {
    issues.push("Titulli duhet të ketë të paktën 5 karaktere.");
  }
  const desc = input.description.trim();
  if (desc.length < 15) {
    issues.push("Përshkrimi duhet të ketë të paktën 15 karaktere.");
  }
  if (!input.location.trim()) {
    issues.push("Zgjidhni qytetin (vendndodhja).");
  }
  if (input.sellerName.trim().length < 2) {
    issues.push("Shkruani emrin e shitësit.");
  }
  if (input.sellerPhone.replace(/\D/g, "").length < 5) {
    issues.push("Telefoni duhet të ketë të paktën 5 shifra.");
  }
  if (input.isUploading) {
    issues.push("Prisni derisa të përfundojë ngarkimi i fotove.");
  }
  if (input.imageCount < 1) {
    issues.push("Shtoni të paktën një foto.");
  }

  return issues;
}

export function formatPreflightSummary(issues: string[]): string {
  if (issues.length === 1) return issues[0]!;
  return issues.map((s, i) => `${i + 1}. ${s}`).join(" ");
}

export function formatFreeQuotaWarning(
  used: number,
  limit: number,
  remaining: number,
  canPostWithWallet?: boolean,
): string {
  if (remaining > 0) {
    return `Postime falas këtë muaj për këtë kategori: ${used}/${limit} (mbeten ${remaining}).`;
  }
  if (canPostWithWallet) {
    return `Postimet falas (${used}/${limit}) për këtë muaj janë shpenzuar. Mund të postoni ende — €0.30/shpallje nga portofoli.`;
  }
  return `Postimet falas (${used}/${limit}) për këtë muaj janë shpenzuar. Postimi i radhës: €0.30 — mbushni portofolin nga Profili.`;
}
