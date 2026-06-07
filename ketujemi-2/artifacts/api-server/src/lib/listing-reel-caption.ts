import { getCanonicalOrigin } from "./canonical-host";
import { pool } from "@workspace/db";

const HOOKS = [
  "Çfarë po kërkon sot? Ja disa oferta të reja tek ne 👇",
  "Shpallje të freskëta — shfleto dhe gjej ajo që të duhet ✨",
  "Bli & shit në Kosovë, Shqipëri, Maqedoni e Mali i Zi — gjithçka në një vend 🇦🇱",
  "Oferta që s'mund t'i humbësh sot në KetuJemi.com 🔥",
  "Ke diçka për të shitur? Posto falas. Ke nevojë? Kërko këtu 👇",
  "Marketplace shqiptar — shpallje të reja çdo ditë 🛒",
  "Scroll pak, gjej çfarë të duhet — pa humbur kohë ⏱️",
  "Zbrit poshtë për ofertat e fundit. Mos i humb! 👇",
  "Pse të kërkosh gjithandej? Shiko çfarë postuan përdoruesit tanë sot 📲",
  "Tregu yt dixhital — blerje dhe shitje në disa klikime 💙",
  "Dua diçka të përdorur apo të re? KetuJemi e ka — shiko 👀",
  "Ofertat e ditës janë këtu. Cila të pëlqen më shumë? 🤔",
] as const;

const LISTING_INTROS = [
  "Në këtë Reel:",
  "Sot te KetuJemi:",
  "Ofertat në vijim:",
  "Shiko çfarë kemi sot:",
  "Të zgjedhura për ty:",
] as const;

const CTAS = [
  "Hyr në KetuJemi.com — posto falas ose gjej ajo që kërkon.",
  "Regjistrohu dhe posto shpalljen tënde në pak minuta ⚡",
  "Shfletoni tani — linku poshtë 👇",
  "Bli & shit me besim. Falas për të gjithë.",
  "Vizito faqen dhe posto shpalljen tënde sot — pa pagesë.",
  "Gjej ofertën e duhur ose shit diçka që nuk ta duhet më 🔄",
  "Eksploro shpalljet live dhe posto tënden në minuta.",
  "Kliko linkun — marketplace-i yt shqiptar po të pret.",
] as const;

const HASHTAG_SETS = [
  "#ketujemi #shpallje #blerjeshitje #kosovo #albania",
  "#ketujemi #oferta #marketplace #kosova #shqipëri",
  "#ketujemi #blerjeshitje #tirane #prishtine #ofertë",
  "#ketujemi #shpallje #maqedoni #malizi #diaspora",
  "#ketujemi #ofertë #falas #blerje #shitje",
  "#ketujemi #marketplace #shqiptar #online #oferta",
] as const;

function hashSeed(seed: string | number): number {
  const s = String(seed);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickIndex(seed: string | number, salt: string, length: number): number {
  if (length <= 0) return 0;
  return hashSeed(`${seed}:${salt}`) % length;
}

function trimTitle(title: string, max = 42): string {
  const t = title.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function formatListings(titles: string[], formatIndex: number): string {
  const slice = titles.slice(0, 3).map((t) => trimTitle(t));
  if (slice.length === 0) return "";

  switch (formatIndex % 4) {
    case 0:
      return slice.map((t) => `• ${t}`).join("\n");
    case 1:
      return slice.map((t, i) => `${i + 1}. ${t}`).join("\n");
    case 2:
      return slice.map((t) => `«${t}»`).join(" · ");
    case 3:
    default:
      return slice.join("  |  ");
  }
}

function hookFromIndices(hookIndex: number, introIndex: number): string {
  const hook = HOOKS[hookIndex % HOOKS.length] ?? HOOKS[0];
  const intro = LISTING_INTROS[introIndex % LISTING_INTROS.length] ?? LISTING_INTROS[0];
  return `${hook}\n\n${intro}`;
}

/** Avoid repeating the same opening hook as the most recent reel caption. */
async function avoidRecentHookDuplicate(
  seed: string | number,
  hookIndex: number,
  introIndex: number,
): Promise<{ hookIndex: number; introIndex: number }> {
  try {
    const { rows } = await pool.query<{ caption: string | null }>(
      `SELECT caption FROM social_reel_posts
       WHERE caption IS NOT NULL AND trim(caption) <> ''
       ORDER BY created_at DESC
       LIMIT 1`,
    );
    const last = rows[0]?.caption?.trim() ?? "";
    if (!last) return { hookIndex, introIndex };

    const candidate = hookFromIndices(hookIndex, introIndex);
    const lastHookLine = last.split("\n")[0]?.trim() ?? "";
    const candidateHookLine = candidate.split("\n")[0]?.trim() ?? "";
    if (lastHookLine !== candidateHookLine) return { hookIndex, introIndex };

    return {
      hookIndex: (hookIndex + 1) % HOOKS.length,
      introIndex: (introIndex + 1) % LISTING_INTROS.length,
    };
  } catch {
    return { hookIndex, introIndex };
  }
}

export type ReelCaptionInput = {
  listingTitles: string[];
  /** Unique per run (e.g. batch timestamp) so captions vary each reel. */
  seed?: string | number;
};

/**
 * Build a varied Albanian Instagram/TikTok Reel caption.
 */
export async function buildReelCaption(input: ReelCaptionInput): Promise<string> {
  const { listingTitles, seed = Date.now() } = input;
  const origin = getCanonicalOrigin();

  let hookIndex = pickIndex(seed, "hook", HOOKS.length);
  let introIndex = pickIndex(seed, "intro", LISTING_INTROS.length);
  ({ hookIndex, introIndex } = await avoidRecentHookDuplicate(seed, hookIndex, introIndex));

  const formatIndex = pickIndex(seed, "format", 4);
  const ctaIndex = pickIndex(seed, "cta", CTAS.length);
  const tagIndex = pickIndex(seed, "tags", HASHTAG_SETS.length);

  const lines = [
    hookFromIndices(hookIndex, introIndex),
    formatListings(listingTitles, formatIndex),
    CTAS[ctaIndex],
    `🔗 ${origin}`,
    HASHTAG_SETS[tagIndex],
  ];

  return lines.filter((line) => line.trim().length > 0).join("\n\n");
}
