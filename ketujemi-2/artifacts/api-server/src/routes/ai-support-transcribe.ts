import type { Request, Response } from "express";
import { parseUiLang } from "../lib/claude-client";
import { isWhisperConfigured, transcribeSupportAudio } from "../lib/whisper-transcribe";

type TranscribeBody = {
  audioBase64?: string;
  mimeType?: string;
  lang?: string;
};

function decodeAudioPayload(body: TranscribeBody): { buffer: Buffer; mimeType: string } | null {
  const raw = typeof body.audioBase64 === "string" ? body.audioBase64.trim() : "";
  if (!raw) return null;

  let mimeType =
    typeof body.mimeType === "string" && body.mimeType.trim()
      ? body.mimeType.trim()
      : "audio/webm";
  let base64 = raw;

  const dataUrl = /^data:([^;]+);base64,(.+)$/i.exec(raw);
  if (dataUrl) {
    mimeType = dataUrl[1] ?? mimeType;
    base64 = dataUrl[2] ?? "";
  }

  try {
    const buffer = Buffer.from(base64, "base64");
    return { buffer, mimeType };
  } catch {
    return null;
  }
}

export async function handleSupportTranscribe(req: Request, res: Response): Promise<void> {
  if (!isWhisperConfigured()) {
    res.status(200).json({
      fallback: "webspeech",
      text: "",
      message: "Whisper not configured — client should use Web Speech API.",
    });
    return;
  }

  const decoded = decodeAudioPayload(req.body as TranscribeBody);
  if (!decoded) {
    res.status(400).json({ error: "Invalid audio payload" });
    return;
  }

  const lang = parseUiLang((req.body as TranscribeBody).lang);

  try {
    const text = await transcribeSupportAudio(decoded.buffer, decoded.mimeType, lang);
    res.json({ text, lang });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transcription failed";
    res.status(422).json({ error: "transcription_failed", message });
  }
}
