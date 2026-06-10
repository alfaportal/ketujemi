/** Client-side checks before POST /api/listings — re-exported with locale-aware i18n. */

export type { ListingPostPreflightInput } from "@/lib/listing-post-preflight-i18n";
export {
  collectListingPostPreflightIssues,
  formatFreeQuotaWarning,
} from "@/lib/listing-post-preflight-i18n";

export function formatPreflightSummary(issues: string[]): string {
  if (issues.length === 1) return issues[0]!;
  return issues.map((s, i) => `${i + 1}. ${s}`).join(" ");
}
