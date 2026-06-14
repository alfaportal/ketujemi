import type { QueryClient } from "@tanstack/react-query";
import {
  getGetFeaturedListingsQueryKey,
  getGetListingsQueryKey,
  getGetRecentListingsQueryKey,
} from "@workspace/api-client-react";

/** Refresh list feeds without invalidating auth, detail, or post-form state. */
export function refreshBrowsingQueries(client: QueryClient): void {
  void client.invalidateQueries({ queryKey: getGetListingsQueryKey() });
  void client.invalidateQueries({ queryKey: getGetRecentListingsQueryKey() });
  void client.invalidateQueries({ queryKey: getGetFeaturedListingsQueryKey() });
}
