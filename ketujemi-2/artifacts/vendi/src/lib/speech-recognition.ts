/** Web Speech API helpers — requires HTTPS (secure context) in production. */

export type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

export type SpeechRecognitionResultEvent = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      length: number;
      [index: number]: { transcript: string };
    };
  };
};

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

/** True on https://, localhost, or 127.0.0.1 — required for mic + SpeechRecognition. */
export function isSecurePageContext(): boolean {
  if (typeof window === "undefined") return false;
  if (window.isSecureContext) return true;
  const { protocol, hostname } = window.location;
  return (
    protocol === "https:" ||
    hostname === "localhost" ||
    hostname === "127.0.0.1"
  );
}

export function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Chrome/Edge/Safari over HTTPS; not Firefox (no API). */
export function isVoiceInputAvailable(): boolean {
  return Boolean(getSpeechRecognitionCtor()) && isSecurePageContext();
}

export function speechLangForMarket(marketCode: string): string {
  if (marketCode === "mk") return "mk-MK";
  if (marketCode === "mne") return "sr-RS";
  return "sq-AL";
}

export function transcriptFromEvent(event: SpeechRecognitionResultEvent): {
  interim: string;
  final: string;
} {
  let interim = "";
  let final = "";
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const result = event.results[i];
    const piece = result?.[0]?.transcript ?? "";
    if (!piece) continue;
    if (result.isFinal) final += piece;
    else interim += piece;
  }
  return { interim: interim.trim(), final: final.trim() };
}
