/** Web Speech API — desktop Chrome/Edge only (no server STT). */

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

export function isMobileUserAgent(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
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

export function isWebSpeechAvailable(): boolean {
  return Boolean(getSpeechRecognitionCtor()) && isSecurePageContext();
}

/** Mic works on desktop with Web Speech; mobile shows guidance only. */
export function isDesktopVoiceInputAvailable(): boolean {
  return isWebSpeechAvailable() && !isMobileUserAgent();
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

export type WebSpeechController = {
  stop: () => void;
  abort: () => void;
};

export function startWebSpeechRecognition(handlers: {
  marketCode: string;
  onStart?: () => void;
  onInterim: (text: string) => void;
  onError: (code: string) => void;
  onEnd: (finalText: string) => void;
}): WebSpeechController | null {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) return null;

  const recognition = new Ctor();
  let finalText = "";
  recognition.lang = speechLangForMarket(handlers.marketCode);
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => handlers.onStart?.();

  recognition.onresult = (event) => {
    const { interim, final } = transcriptFromEvent(event);
    if (final) finalText = final;
    const display = (final || interim).trim();
    if (display) handlers.onInterim(display);
  };

  recognition.onerror = (event) => {
    handlers.onError(event.error ?? "failed");
  };

  recognition.onend = () => {
    handlers.onEnd(finalText.trim());
  };

  try {
    recognition.start();
  } catch {
    return null;
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch {
        /* ignore */
      }
    },
    abort: () => {
      try {
        recognition.abort();
      } catch {
        /* ignore */
      }
    },
  };
}
