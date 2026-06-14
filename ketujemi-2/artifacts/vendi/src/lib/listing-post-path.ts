export function isListingPostPath(pathname: string): boolean {
  return pathname.startsWith("/listings/new");
}

/** `/listings/42` — not edit, not new. */
export function isListingDetailPath(pathname: string): boolean {
  return /^\/listings\/\d+$/.test(pathname);
}

/** `/listings/42/edit` */
export function isListingEditPath(pathname: string): boolean {
  return /^\/listings\/\d+\/edit$/.test(pathname);
}

/** Post form, detail, and edit — skip auto-reload and blanket query invalidation. */
export function isListingFlowPath(pathname: string): boolean {
  return (
    isListingPostPath(pathname)
    || isListingDetailPath(pathname)
    || isListingEditPath(pathname)
  );
}
