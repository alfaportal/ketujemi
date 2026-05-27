import { parseUiLang, type UiLang } from "./claude-client";

const WHISPER_URL = "https://api.openai.com/v1/audio/transcriptions";
const MAX_BYTES = 2 * 1024 * 1024;

export function isWhisperConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function whisperLanguage(lang: UiLang): string | undefined {
  if (lang === "mk") return "mk";
  if (lang === "me") return "sr";
  return "sq";
}

function extensionForMime(mime: string): string {
  const m = mime.toLowerCase();
  if (m.includes("webm")) return "webm";
  if (m.includes("mp4") || m.includes("m4a")) return "m4a";
  if (m.includes("aac")) return "aac";
  if (m.includes("mpeg") || m.includes("mp3")) return "mp3";
  if (m.includes("wav")) return "wav";
  return "webm";
}

export async function transcribeSupportAudio(
  buffer: Buffer,
  mimeType: string,
  langRaw: unknown,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }
  if (buffer.length < 200) {
    throw new Error("Audio too short");
  }
  if (buffer.length > MAX_BYTES) {
    throw new Error("Audio too large");
  }

  const lang = parseUiLang(langRaw);
  const ext = extensionForMime(mimeType);
  const filename = `support-voice.${ext}`;

  const form = new FormData();
  const blob = new Blob([buffer], { type: mimeType || "application/octet-stream" });
  form.append("file", blob, filename);
  form.append("model", "whisper-1");
  form.append("response_format", "json");
  const whisperLang = whisperLanguage(lang);
  if (whisperLang) form.append("language", whisperLang);

  const res = await fetch(WHISPER_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  const data = (await res.json().catch(() => ({}))) as { text?: string; error?: { message?: string } };
  if (!res.ok) {
    const msg = data.error?.message ?? `Whisper HTTP ${res.status}`;
    throw new Error(msg);
  }

  const text = data.text?.trim() ?? "";
  if (!text) throw new Error("Empty transcription");
  return text;
}
