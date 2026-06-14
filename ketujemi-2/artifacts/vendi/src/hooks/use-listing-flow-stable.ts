import { useEffect } from "react";
import { stabilizeListingFlowPage } from "@/lib/listing-post-stable-mode";

/** Run once on listing detail/edit mount — clears stale SW that causes refresh loops. */
export function useListingFlowStable() {
  useEffect(() => {
    void stabilizeListingFlowPage();
  }, []);
}
