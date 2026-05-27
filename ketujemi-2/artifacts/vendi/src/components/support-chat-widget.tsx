import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, Mic } from "lucide-react";
import { useMarket } from "@/lib/market-context";
import { useSecretAdminTap } from "@/lib/secret-admin-tap";
import { cn } from "@/lib/utils";
import {
  isSecurePageContext,
  isWebSpeechAvailable,
  startWebSpeechRecognition,
  type WebSpeechController,
} from "@/lib/speech-recognition";
import {
  blobToDataUrl,
  isVoiceRecordingAvailable,
  startVoiceRecording,
  type VoiceRecordController,
} from "@/lib/voice-recorder";

type ChatMessage = { role: "user" | "assistant"; content: string };
type VoiceBackend = "whisper" | "webspeech";

const WELCOME: Record<string, string> = {
  ks: "Përshëndetje! Pyetni shkurt — do t'ju udhëzoj ku të shkoni në KetuJemi.",
  al: "Përshëndetje! Pyetni shkurt — do t'ju udhëzoj ku të shkoni në KetuJemi.",
  mk: "Здраво! Поставете кратко прашање — ќе ви кажам каде на KetuJemi.",
  me: "Zdravo! Kratko pitanje — reći ću vam gdje na KetuJemi.",
};

const FALLBACK_BUSY: Record<string, string> = {
  ks: "Nuk u lidh me serverin. Provoni përsëri.",
  al: "Nuk u lidh me serverin. Provoni përsëri.",
  mk: "Нема врска со серверот. Обидете се повторно.",
  me: "Nema veze sa serverom. Pokušajte ponovo.",
};

const VOICE_ERROR: Record<string, string> = {
  ks: "Mikrofoni nuk u aktivizua. Lejoni mikrofonin në shfletues dhe provoni përsëri.",
  al: "Mikrofoni nuk u aktivizua. Lejoni mikrofonin në shfletues dhe provoni përsëri.",
  mk: "Микрофонот не се активира. Дозволете пристап и обидете се повторно.",
  me: "Mikrofon se nije aktivirao. Dozvolite pristup i pokušajte ponovo.",
};

const VOICE_HTTPS_HINT: Record<string, string> = {
  ks: "Për zërin (🎤) hapni faqen me HTTPS: https://www.ketujemi.com",
  al: "Për zërin (🎤) hapni faqen me HTTPS: https://www.ketujemi.com",
  mk: "За глас (🎤) отворете https://www.ketujemi.com",
  me: "Za glas (🎤) otvorite https://www.ketujemi.com",
};

const VOICE_UNSUPPORTED: Record<string, string> = {
  ks: "Ky shfletues nuk mbështet zërin. Përdorni Chrome, Safari ose Edge.",
  al: "Ky shfletues nuk mbështet zërin. Përdorni Chrome, Safari ose Edge.",
  mk: "Овој прелистувач не поддржува глас. Користете Chrome, Safari или Edge.",
  me: "Ovaj pregledač ne podržava glas. Koristite Chrome, Safari ili Edge.",
};

const VOICE_MOBILE_NEEDS_SERVER: Record<string, string> = {
  ks: "Zëri në telefon kërkon OPENAI_API_KEY në server. Deri atëherë shkruani me tastierë.",
  al: "Zëri në telefon kërkon OPENAI_API_KEY në server. Deri atëherë shkruani me tastierë.",
  mk: "Гласот на телефон бара OPENAI_API_KEY на серверот. До тогаш пишете.",
  me: "Glas na telefonu traži OPENAI_API_KEY na serveru. Do tada pišite.",
};

const VOICE_TRANSCRIBE_FAIL: Record<string, string> = {
  ks: "Nuk kuptova zërin. Provoni përsëri ose shkruani me tastierë.",
  al: "Nuk kuptova zërin. Provoni përsëri ose shkruani me tastierë.",
  mk: "Не разбрав глас. Обидете се повторно или напишете.",
  me: "Nisam razumio glas. Pokušajte ponovo ili pišite.",
};

export function SupportChatWidget() {
  const { market } = useMarket();
  const { registerTap } = useSecretAdminTap();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [voiceNeedsHttps, setVoiceNeedsHttps] = useState(false);
  const [voiceBackend, setVoiceBackend] = useState<VoiceBackend>("webspeech");
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  const recordControllerRef = useRef<VoiceRecordController | null>(null);
  const webSpeechRef = useRef<WebSpeechController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);
  const busyRef = useRef(busy);
  const welcomeRef = useRef("");
  const inputRef = useRef(input);
  const voiceBackendRef = useRef(voiceBackend);

  const lang = market.code === "mk" ? "mk" : market.code === "mne" ? "me" : "sq";
  const welcome = WELCOME[market.code] ?? WELCOME.ks;
  welcomeRef.current = welcome;
  voiceBackendRef.current = voiceBackend;

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "assistant", content: welcome }]);
    }
  }, [open, messages.length, welcome]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    const canRecord = isVoiceRecordingAvailable();
    const canWebSpeech = isWebSpeechAvailable();
    const secure = isSecurePageContext();

    setVoiceNeedsHttps(!secure && (canRecord || canWebSpeech));

    void fetch("/api/ai/status")
      .then((r) => r.json().catch(() => ({})))
      .then((data: { whisper_configured?: boolean }) => {
        const whisper = Boolean(data.whisper_configured);
        let backend: VoiceBackend | null = null;
        if (whisper && canRecord) backend = "whisper";
        else if (canWebSpeech) backend = "webspeech";
        else if (canRecord) backend = "whisper";

        if (backend) {
          setVoiceBackend(backend);
          voiceBackendRef.current = backend;
        }
        setVoiceAvailable(Boolean(backend));
      })
      .catch(() => {
        const backend: VoiceBackend | null = canWebSpeech
          ? "webspeech"
          : canRecord
            ? "whisper"
            : null;
        if (backend) {
          setVoiceBackend(backend);
          voiceBackendRef.current = backend;
        }
        setVoiceAvailable(Boolean(backend));
      });
  }, []);

  const stopListening = useCallback(() => {
    recordControllerRef.current?.stop();
    recordControllerRef.current = null;
    webSpeechRef.current?.stop();
    webSpeechRef.current = null;
  }, []);

  const abortListening = useCallback(() => {
    recordControllerRef.current?.abort();
    recordControllerRef.current = null;
    webSpeechRef.current?.abort();
    webSpeechRef.current = null;
    setListening(false);
    setTranscribing(false);
  }, []);

  useEffect(() => {
    return () => {
      abortListening();
    };
  }, [abortListening]);

  const sendMessage = useCallback(
    async (textOverride?: string) => {
      const text = (textOverride ?? "").trim();
      if (!text || busyRef.current) return;

      const next: ChatMessage[] = [
        ...messagesRef.current,
        { role: "user", content: text },
      ];
      setMessages(next);
      setInput("");
      inputRef.current = "";
      setBusy(true);
      busyRef.current = true;

      try {
        const res = await fetch("/api/ai/support-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lang,
            messages: next.filter(
              (m) => m.role === "user" || m.content !== welcomeRef.current,
            ),
          }),
        });
        const data = await res.json().catch(() => ({}));
        const reply = (data as { reply?: string }).reply?.trim();
        if (!reply) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: FALLBACK_BUSY[market.code] ?? FALLBACK_BUSY.ks,
            },
          ]);
          return;
        }
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: FALLBACK_BUSY[market.code] ?? FALLBACK_BUSY.ks,
          },
        ]);
      } finally {
        setBusy(false);
        busyRef.current = false;
      }
    },
    [lang, market.code],
  );

  const startWebSpeech = useCallback(() => {
    const controller = startWebSpeechRecognition({
      marketCode: market.code,
      onStart: () => setListening(true),
      onInterim: (text) => {
        setInput(text);
        inputRef.current = text;
      },
      onError: (code) => {
        setListening(false);
        webSpeechRef.current = null;
        if (code === "not-allowed" || code === "service-not-allowed") {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: !isSecurePageContext()
                ? (VOICE_HTTPS_HINT[market.code] ?? VOICE_HTTPS_HINT.ks)
                : (VOICE_ERROR[market.code] ?? VOICE_ERROR.ks),
            },
          ]);
          return;
        }
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: VOICE_UNSUPPORTED[market.code] ?? VOICE_UNSUPPORTED.ks,
          },
        ]);
      },
      onEnd: (finalText) => {
        setListening(false);
        webSpeechRef.current = null;
        if (!finalText.trim() || busyRef.current) return;
        setInput(finalText);
        void sendMessage(finalText);
      },
    });

    if (!controller) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: VOICE_UNSUPPORTED[market.code] ?? VOICE_UNSUPPORTED.ks,
        },
      ]);
      return;
    }
    webSpeechRef.current = controller;
  }, [market.code, sendMessage]);

  const transcribeAndSend = useCallback(
    async (blob: Blob, mimeType: string) => {
      setTranscribing(true);
      try {
        const audioBase64 = await blobToDataUrl(blob);
        const res = await fetch("/api/ai/support-transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audioBase64, mimeType, lang }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          text?: string;
          fallback?: string;
        };

        if (data.fallback === "webspeech") {
          setVoiceBackend("webspeech");
          voiceBackendRef.current = "webspeech";
          if (isWebSpeechAvailable()) {
            startWebSpeech();
            return;
          }
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                VOICE_MOBILE_NEEDS_SERVER[market.code] ?? VOICE_MOBILE_NEEDS_SERVER.ks,
            },
          ]);
          return;
        }

        const text = data.text?.trim();
        if (!res.ok || !text) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: VOICE_TRANSCRIBE_FAIL[market.code] ?? VOICE_TRANSCRIBE_FAIL.ks,
            },
          ]);
          return;
        }
        setInput(text);
        await sendMessage(text);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: VOICE_TRANSCRIBE_FAIL[market.code] ?? VOICE_TRANSCRIBE_FAIL.ks,
          },
        ]);
      } finally {
        setTranscribing(false);
      }
    },
    [lang, market.code, sendMessage, startWebSpeech],
  );

  const startWhisperRecording = useCallback(async () => {
    if (!isVoiceRecordingAvailable() || busyRef.current || transcribing) return;

    const controller = await startVoiceRecording({
      onStart: () => setListening(true),
      onError: (code) => {
        setListening(false);
        if (code === "not-allowed") {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: !isSecurePageContext()
                ? (VOICE_HTTPS_HINT[market.code] ?? VOICE_HTTPS_HINT.ks)
                : (VOICE_ERROR[market.code] ?? VOICE_ERROR.ks),
            },
          ]);
          return;
        }
        if (isWebSpeechAvailable()) {
          setVoiceBackend("webspeech");
          voiceBackendRef.current = "webspeech";
          startWebSpeech();
          return;
        }
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: VOICE_UNSUPPORTED[market.code] ?? VOICE_UNSUPPORTED.ks,
          },
        ]);
      },
      onStop: (blob, mimeType) => {
        setListening(false);
        recordControllerRef.current = null;
        void transcribeAndSend(blob, mimeType);
      },
    });

    recordControllerRef.current = controller;
  }, [market.code, transcribing, transcribeAndSend, startWebSpeech]);

  function toggleVoiceInput() {
    if (!voiceAvailable || busy || transcribing) return;
    if (listening) {
      stopListening();
      return;
    }
    if (voiceBackendRef.current === "whisper") {
      void startWhisperRecording();
    } else {
      startWebSpeech();
    }
  }

  const voiceBusy = listening || transcribing;

  return (
    <>
      {open ? (
        <div
          className="fixed bottom-20 left-4 z-[60] w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-gray-200 bg-white shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: "min(420px, 70vh)" }}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-[#1A56A0] text-white">
            <span className="font-bold text-sm">💬 Ndihmë</span>
            <button
              type="button"
              className="p-1 rounded-lg hover:bg-white/15 min-h-9 min-w-9 flex items-center justify-center"
              onClick={() => {
                if (listening) stopListening();
                else if (transcribing) abortListening();
                setOpen(false);
              }}
              aria-label="Mbyll"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm bg-gray-50 min-h-[200px]">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-xl px-3 py-2 max-w-[92%]",
                  m.role === "user"
                    ? "ml-auto bg-[#1A56A0] text-white"
                    : "mr-auto bg-white border border-gray-100 text-gray-800",
                )}
              >
                {m.content}
              </div>
            ))}
            {voiceNeedsHttps ? (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
                {VOICE_HTTPS_HINT[market.code] ?? VOICE_HTTPS_HINT.ks}
              </p>
            ) : null}
            {busy ? (
              <div className="flex items-center gap-2 text-gray-500 text-xs px-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Duke shkruar…
              </div>
            ) : null}
            {listening ? (
              <div className="flex items-center gap-2 text-red-600 text-xs px-2 font-medium">
                <span className="inline-block h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                {voiceBackend === "whisper"
                  ? "Po dëgjoj… flisni, pastaj ndaloni (🎤)"
                  : "Po dëgjoj… flisni tani"}
              </div>
            ) : null}
            {transcribing ? (
              <div className="flex items-center gap-2 text-gray-600 text-xs px-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Po përpunohet zëri…
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>
          <form
            className="p-2 border-t border-gray-100 flex gap-2 bg-white"
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                listening
                  ? "Po regjistrohet zëri…"
                  : transcribing
                    ? "Po përpunohet…"
                    : "Shkruani pyetjen…"
              }
              className="flex-1 min-h-11 rounded-xl border border-gray-200 px-3 text-base sm:text-sm"
              disabled={busy || voiceBusy}
              readOnly={voiceBusy}
            />
            {voiceAvailable ? (
              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={busy || transcribing}
                data-testid="button-support-voice"
                className={cn(
                  "shrink-0 min-h-11 min-w-11 rounded-xl text-white flex items-center justify-center disabled:opacity-50 transition-colors",
                  listening
                    ? "bg-red-600 animate-pulse ring-2 ring-red-400 ring-offset-1"
                    : "bg-[#1A56A0] hover:bg-[#164a8c]",
                )}
                aria-label={listening ? "Ndalo dhe dërgo" : "Fol me zë"}
                aria-pressed={listening}
              >
                <Mic className={cn("h-4 w-4", listening && "scale-110")} />
              </button>
            ) : null}
            <button
              type="submit"
              disabled={busy || voiceBusy || !input.trim()}
              className="shrink-0 min-h-11 min-w-11 rounded-xl bg-[#1A56A0] text-white flex items-center justify-center disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          if (registerTap()) return;
          setOpen((v) => !v);
        }}
        className="fixed bottom-4 left-4 z-[60] flex items-center gap-2 rounded-full bg-[#1A56A0] text-white px-4 py-3 shadow-lg font-bold text-sm min-h-12 hover:bg-[#164a8c] transition-colors"
        data-testid="button-support-chat"
      >
        <MessageCircle className="h-5 w-5" />
        Ndihmë
      </button>
    </>
  );
}
