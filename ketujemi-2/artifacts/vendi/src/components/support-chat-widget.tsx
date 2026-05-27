import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, Mic } from "lucide-react";
import { useMarket } from "@/lib/market-context";
import { useSecretAdminTap } from "@/lib/secret-admin-tap";
import { cn } from "@/lib/utils";
import {
  getSpeechRecognitionCtor,
  isSecurePageContext,
  isVoiceInputAvailable,
  speechLangForMarket,
  transcriptFromEvent,
  type SpeechRecognitionInstance,
} from "@/lib/speech-recognition";

type ChatMessage = { role: "user" | "assistant"; content: string };

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

export function SupportChatWidget() {
  const { market } = useMarket();
  const { registerTap } = useSecretAdminTap();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [voiceNeedsHttps, setVoiceNeedsHttps] = useState(false);
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);
  const busyRef = useRef(busy);
  const welcomeRef = useRef("");
  const voiceFinalRef = useRef("");
  const voiceAutoSendRef = useRef(false);
  const inputRef = useRef(input);

  const lang = market.code === "mk" ? "mk" : market.code === "mne" ? "me" : "sq";
  const welcome = WELCOME[market.code] ?? WELCOME.ks;
  welcomeRef.current = welcome;

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
    const hasApi = Boolean(getSpeechRecognitionCtor());
    setVoiceAvailable(isVoiceInputAvailable());
    setVoiceNeedsHttps(hasApi && !isSecurePageContext());
  }, []);

  const stopRecognition = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      voiceAutoSendRef.current = false;
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    };
  }, []);

  const sendMessage = useCallback(
    async (textOverride?: string) => {
      const text = (textOverride ?? inputRef.current).trim();
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

  const finishVoiceAndMaybeSend = useCallback(() => {
    setListening(false);
    recognitionRef.current = null;

    const text =
      voiceFinalRef.current.trim() || inputRef.current.trim();
    voiceFinalRef.current = "";

    if (!voiceAutoSendRef.current || !text || busyRef.current) {
      voiceAutoSendRef.current = false;
      return;
    }
    voiceAutoSendRef.current = false;
    setInput(text);
    void sendMessage(text);
  }, [sendMessage]);

  const startVoiceInput = useCallback(() => {
    if (!isVoiceInputAvailable() || busyRef.current) return;

    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    try {
      recognitionRef.current?.abort();
    } catch {
      /* ignore */
    }

    voiceFinalRef.current = "";
    voiceAutoSendRef.current = true;

    const recognition = new Ctor();
    recognition.lang = speechLangForMarket(market.code);
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const { interim, final } = transcriptFromEvent(event);
      if (final) voiceFinalRef.current = final;
      const display = (final || interim).trim();
      if (display) {
        setInput(display);
        inputRef.current = display;
      }
    };

    recognition.onerror = (event) => {
      voiceAutoSendRef.current = false;
      setListening(false);
      recognitionRef.current = null;
      const code = event.error ?? "";
      if (
        code === "not-allowed" ||
        code === "service-not-allowed" ||
        code === "network"
      ) {
        const needsHttps = !isSecurePageContext();
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: needsHttps
              ? (VOICE_HTTPS_HINT[market.code] ?? VOICE_HTTPS_HINT.ks)
              : (VOICE_ERROR[market.code] ?? VOICE_ERROR.ks),
          },
        ]);
      }
    };

    recognition.onend = () => {
      finishVoiceAndMaybeSend();
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      voiceAutoSendRef.current = false;
      setListening(false);
      recognitionRef.current = null;
    }
  }, [market.code, finishVoiceAndMaybeSend]);

  function toggleVoiceInput() {
    if (!voiceAvailable || busy) return;
    if (listening) {
      stopRecognition();
      return;
    }
    startVoiceInput();
  }

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
                if (listening) stopRecognition();
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
                Po dëgjoj… flisni tani
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>
          <form
            className="p-2 border-t border-gray-100 flex gap-2 bg-white"
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                listening ? "Po dëgjohet zëri…" : "Shkruani pyetjen…"
              }
              className="flex-1 min-h-11 rounded-xl border border-gray-200 px-3 text-base sm:text-sm"
              disabled={busy || listening}
              readOnly={listening}
            />
            {voiceAvailable ? (
              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={busy}
                data-testid="button-support-voice"
                className={cn(
                  "shrink-0 min-h-11 min-w-11 rounded-xl text-white flex items-center justify-center disabled:opacity-50 transition-colors",
                  listening
                    ? "bg-red-600 animate-pulse ring-2 ring-red-400 ring-offset-1"
                    : "bg-[#1A56A0] hover:bg-[#164a8c]",
                )}
                aria-label={listening ? "Ndalo dëgjimin" : "Fol me zë"}
                aria-pressed={listening}
              >
                <Mic className={cn("h-4 w-4", listening && "scale-110")} />
              </button>
            ) : null}
            <button
              type="submit"
              disabled={busy || listening || !input.trim()}
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
