/**
 * When the platform operator edits a listing (admin panel), the original poster
 * must not receive push/in-app/email notifications triggered by that action.
 */
export type ListingOwnerNotifySource =
  | "owner_self_service"
  | "admin_operator"
  | "system_cron"
  | "external_view";

export function mayNotifyListingOwner(source: ListingOwnerNotifySource): boolean {
  return source !== "admin_operator";
}
