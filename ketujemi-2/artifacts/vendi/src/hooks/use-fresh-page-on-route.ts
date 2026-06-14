import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { isListingFlowPath } from "@/lib/listing-post-path";
import { refreshBrowsingQueries } from "@/lib/query-refresh";
import { lastRouteChangeWasPop } from "@/lib/scroll-restoration";

/**
 * On route change (except back/forward and listing post/detail/edit): refresh list feeds only.
 */
export function useFreshPageOnRoute() {
  const [pathname] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!lastRouteChangeWasPop && !isListingFlowPath(pathname)) {
      refreshBrowsingQueries(queryClient);
    }
  }, [pathname, queryClient]);
}
