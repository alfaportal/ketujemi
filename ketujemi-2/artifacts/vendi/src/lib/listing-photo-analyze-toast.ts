/** User-facing toast copy when listing photo analysis fails — no DevTools needed. */
export function listingPhotoAnalyzeFailureToast(
  status: number,
  tx: Record<string, string>,
): { title: string; description: string } {
  if (status === 401) {
    return {
      title: tx.photoAnalyzeLoginRequired,
      description: tx.photoAnalyzeLoginRequiredHint,
    };
  }
  if (status === 503) {
    return {
      title: tx.photoAnalyzeUnavailable,
      description: tx.photoAnalyzeUnavailableHint,
    };
  }
  return {
    title: tx.photoAnalyzeFailed,
    description: tx.photoAnalyzeFailedHint,
  };
}
