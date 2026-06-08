/** User-facing toast copy when listing photo analysis fails — no DevTools needed. */
export function listingPhotoAnalyzeFailureToast(
  status: number,
  tx: Record<string, string | undefined>,
): { title: string; description: string } {
  if (status === 401) {
    return {
      title: tx.photoAnalyzeLoginRequired ?? "Duhet të jesh i kyçur",
      description:
        tx.photoAnalyzeLoginRequiredHint ??
        "Hyni në llogari dhe provoni përsëri ngarkimin e fotos.",
    };
  }
  if (status === 503) {
    return {
      title: tx.photoAnalyzeUnavailable ?? "Analiza e fotos nuk është e disponueshme",
      description:
        tx.photoAnalyzeUnavailableHint ??
        "Plotësoni manualisht kategorinë, titullin dhe përshkrimin.",
    };
  }
  return {
    title: tx.photoAnalyzeFailed ?? "Nuk u plotësua automatikisht",
    description:
      tx.photoAnalyzeFailedHint ??
      "Vazhdoni manualisht me kategorinë, titullin dhe përshkrimin — ose provoni një foto më të qartë.",
  };
}
