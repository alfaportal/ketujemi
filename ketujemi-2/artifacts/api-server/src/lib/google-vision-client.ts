export type GoogleVisionLabel = {
  description: string;
  score: number;
};

export type GoogleVisionObject = {
  name: string;
  score: number;
};

export type GoogleVisionDetectResult = {
  labels: GoogleVisionLabel[];
  objects: GoogleVisionObject[];
};

export function getGoogleVisionApiKey(): string | undefined {
  const key = process.env.GOOGLE_VISION_API_KEY?.trim();
  return key || undefined;
}

export function isGoogleVisionConfigured(): boolean {
  return !!getGoogleVisionApiKey();
}

const GOOGLE_VISION_FETCH_TIMEOUT_MS = 12_000;

function stripBase64Prefix(data: string): string {
  return data.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "").trim();
}

/** Fast label + object detection via Google Cloud Vision API. */
export async function detectImageLabels(imageBase64: string): Promise<GoogleVisionDetectResult | null> {
  const key = getGoogleVisionApiKey();
  const content = stripBase64Prefix(imageBase64);
  if (!key || content.length < 100) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GOOGLE_VISION_FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          requests: [
            {
              image: { content },
              features: [
                { type: "LABEL_DETECTION", maxResults: 25 },
                { type: "OBJECT_LOCALIZATION", maxResults: 15 },
              ],
            },
          ],
        }),
      },
    );

    if (!res.ok) return null;

    const data = (await res.json()) as {
      responses?: Array<{
        labelAnnotations?: Array<{ description?: string; score?: number }>;
        localizedObjectAnnotations?: Array<{ name?: string; score?: number }>;
        error?: { message?: string };
      }>;
    };

    const response = data.responses?.[0];
    if (!response || response.error) return null;

    const labels: GoogleVisionLabel[] = (response.labelAnnotations ?? [])
      .map((row) => ({
        description: row.description?.trim() ?? "",
        score: Number(row.score) || 0,
      }))
      .filter((row) => row.description.length > 0);

    const objects: GoogleVisionObject[] = (response.localizedObjectAnnotations ?? [])
      .map((row) => ({
        name: row.name?.trim() ?? "",
        score: Number(row.score) || 0,
      }))
      .filter((row) => row.name.length > 0);

    if (labels.length === 0 && objects.length === 0) return null;

    return { labels, objects };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export function formatVisionDetectResult(result: GoogleVisionDetectResult): string {
  const labelLines = result.labels
    .slice(0, 20)
    .map((l) => `${l.description} (${Math.round(l.score * 100)}%)`);
  const objectLines = result.objects
    .slice(0, 12)
    .map((o) => `${o.name} (${Math.round(o.score * 100)}%)`);

  const parts: string[] = [];
  if (labelLines.length) parts.push(`Labels: ${labelLines.join(", ")}`);
  if (objectLines.length) parts.push(`Objects: ${objectLines.join(", ")}`);
  return parts.join("\n");
}
