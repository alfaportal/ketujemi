/** Cross-platform voice capture via MediaRecorder (iOS Safari, Android, desktop). */

import { isSecurePageContext } from "@/lib/speech-recognition";

const MAX_RECORD_MS = 45_000;
const SILENCE_THRESHOLD = 0.014;
const SILENCE_STOP_MS = 1_800;
const LEVEL_CHECK_MS = 200;

export function isVoiceRecordingAvailable(): boolean {
  if (!isSecurePageContext()) return false;
  if (typeof navigator === "undefined") return false;
  if (!navigator.mediaDevices?.getUserMedia) return false;
  return typeof MediaRecorder !== "undefined";
}

export function pickRecordingMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/aac",
    "audio/mpeg",
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return "";
}

export type VoiceRecordController = {
  stop: () => void;
  abort: () => void;
};

export function startVoiceRecording(handlers: {
  onStart?: () => void;
  onStop: (blob: Blob, mimeType: string) => void;
  onError: (code: "not-allowed" | "unsupported" | "failed") => void;
}): Promise<VoiceRecordController> {
  return new Promise((resolve) => {
    let stream: MediaStream | null = null;
    let recorder: MediaRecorder | null = null;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let levelTimer: ReturnType<typeof setInterval> | null = null;
    let maxTimer: ReturnType<typeof setTimeout> | null = null;
    let finished = false;
    const chunks: Blob[] = [];
    let mimeType = pickRecordingMimeType();
    let hadSpeech = false;
    let silentSince = 0;

    const cleanup = () => {
      if (levelTimer) clearInterval(levelTimer);
      if (maxTimer) clearTimeout(maxTimer);
      levelTimer = null;
      maxTimer = null;
      stream?.getTracks().forEach((t) => t.stop());
      stream = null;
      void audioContext?.close().catch(() => undefined);
      audioContext = null;
      analyser = null;
    };

    const finish = (blob: Blob | null) => {
      if (finished) return;
      finished = true;
      cleanup();
      if (blob && blob.size > 0) {
        handlers.onStop(blob, mimeType || blob.type || "audio/webm");
      } else {
        handlers.onError("failed");
      }
    };

    const abort = () => {
      if (finished) return;
      finished = true;
      try {
        recorder?.stop();
      } catch {
        /* ignore */
      }
      cleanup();
    };

    const stop = () => {
      if (finished) return;
      try {
        if (recorder?.state === "recording") recorder.stop();
        else finish(null);
      } catch {
        finish(null);
      }
    };

    void (async () => {
      if (!isVoiceRecordingAvailable()) {
        handlers.onError("unsupported");
        resolve({ stop: () => undefined, abort: () => undefined });
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch {
        handlers.onError("not-allowed");
        resolve({ stop: () => undefined, abort: () => undefined });
        return;
      }

      try {
        recorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);
        mimeType = recorder.mimeType || mimeType || "audio/webm";
      } catch {
        handlers.onError("unsupported");
        cleanup();
        resolve({ stop: () => undefined, abort: () => undefined });
        return;
      }

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunks.push(ev.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        finish(blob);
      };
      recorder.onerror = () => finish(null);

      try {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (Ctx) {
          audioContext = new Ctx();
          analyser = audioContext.createAnalyser();
          analyser.fftSize = 512;
          const source = audioContext.createMediaStreamSource(stream);
          source.connect(analyser);
          const data = new Uint8Array(analyser.fftSize);

          levelTimer = setInterval(() => {
            if (!analyser || finished) return;
            analyser.getByteTimeDomainData(data);
            let sum = 0;
            for (let i = 0; i < data.length; i++) {
              const v = (data[i] - 128) / 128;
              sum += v * v;
            }
            const rms = Math.sqrt(sum / data.length);
            const now = Date.now();
            if (rms > SILENCE_THRESHOLD) {
              hadSpeech = true;
              silentSince = 0;
              return;
            }
            if (!hadSpeech) return;
            if (!silentSince) silentSince = now;
            if (now - silentSince >= SILENCE_STOP_MS) stop();
          }, LEVEL_CHECK_MS);
        }
      } catch {
        /* silence auto-stop optional */
      }

      recorder.start(250);
      handlers.onStart?.();
      maxTimer = setTimeout(stop, MAX_RECORD_MS);

      resolve({ stop, abort });
    })();
  });
}

export async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("read failed"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(blob);
  });
}
