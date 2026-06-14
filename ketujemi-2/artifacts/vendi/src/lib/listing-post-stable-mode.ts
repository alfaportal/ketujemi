/** Legacy hook — global bootstrap-app-stability clears stale SW once per deploy. */
export async function stabilizeListingFlowPage(): Promise<void> {
  return;
}

/** @deprecated Use stabilizeListingFlowPage */
export async function stabilizeListingPostPage(): Promise<void> {
  return stabilizeListingFlowPage();
}
