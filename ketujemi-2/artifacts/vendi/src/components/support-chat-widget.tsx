import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { MessageCircle, X, Send, Loader2, Mic } from "lucide-react";
import { useMarket } from "@/lib/market-context";
import { useSecretAdminTap } from "@/lib/secret-admin-tap";
import { cn } from "@/lib/utils";
import { getFetchErrorMessage } from "@/lib/fetch-with-timeout";
import { mergeSupportChatCopy } from "@/lib/support-chat-defaults";
import {
  isDesktopVoiceInputAvailable,
  isMobileUserAgent,
  isSecurePageContext,
  isWebSpeechAvailable,
  startWebSpeechRecognition,
  type WebSpeechController,
} from "@/lib/speech-recognition";

type ChatMessage = { role: "user" | "assistant"; content: string };

const MAX_SUPPORT_USER_QUESTIONS = 3;

function countUserMessages(messages: ChatMessage[]): number {
  return messages.filter((m) => m.role === "user").length;
}

function isBrowseLinkContent(content: string): boolean {
  const t = content.trim();
  return /^\/[\w\-%./?=&+]*$/.test(t) || /^https?:\/\/\S+$/i.test(t);
}

function SupportChatMessageBody({
  content,
  onOpenLink,
}: {
  content: string;
  onOpenLink: (href: string) => void;
}) {
  const trimmed = content.trim();
  if (isBrowseLinkContent(trimmed)) {
    const internal = trimmed.startsWith("/");
    return (
      <button
        type="button"
        className="text-left text-[#1A56A0] underline font-semibold break-all hover:text-[#164a8c]"
        onClick={() => {
          if (internal) onOpenLink(trimmed);
          else window.location.assign(trimmed);
        }}
      >
        {trimmed}
      </button>
    );
  }
  return <>{content}</>;
}

export function SupportChatWidget() {
  const [, navigate] = useLocation();
  const { market, t, uiLang } = useMarket();
  const copy = useMemo(() => mergeSupportChatCopy(uiLang, t), [uiLang, t]);
  const { registerTap } = useSecretAdminTap();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [voiceNeedsHttps, setVoiceNeedsHttps] = useState(false);
  const [showMobileVoiceHint, setShowMobileVoiceHint] = useState(false);
  const [listening, setListening] = useState(false);

  const webSpeechRef = useRef<WebSpeechController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);
  const busyRef = useRef(busy);
  const welcomeRef = useRef(copy.welcome);
  const inputRef = useRef(input);

  welcomeRef.current = copy.welcome;

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
    if (!open || !copy.welcome) return;
    setMessages((prev) => {
      if (prev.length === 0) {
        return [{ role: "assistant", content: copy.welcome }];
      }
      if (
        prev.length === 1 &&
        prev[0]?.role === "assistant" &&
        (!prev[0].content.trim() || prev[0].content === welcomeRef.current)
      ) {
        return [{ role: "assistant", content: copy.welcome }];
      }
      return prev;
    });
  }, [open, copy.welcome]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    const mobile = isMobileUserAgent();
    const canDesktop = isDesktopVoiceInputAvailable();
    setVoiceAvailable(mobile || canDesktop);
    setShowMobileVoiceHint(mobile);
    setVoiceNeedsHttps(
      !isSecurePageContext() && (isWebSpeechAvailable() || mobile),
    );
  }, []);

  const stopListening = useCallback(() => {
    webSpeechRef.current?.stop();
    webSpeechRef.current = null;
  }, []);

  const abortListening = useCallback(() => {
    webSpeechRef.current?.abort();
    webSpeechRef.current = null;
    setListening(false);
  }, []);

  useEffect(() => {
    return () => {
      abortListening();
    };
  }, [abortListening]);

  const sendMessage = useCallback(
    async (textOverride?: string) => {
      const text = (textOverride ?? inputRef.current).trim();
      if (!text || busyRef.current) return;

      if (countUserMessages(messagesRef.current) >= MAX_SUPPORT_USER_QUESTIONS) {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.content === copy.questionLimit) return prev;
          return [...prev, { role: "assistant", content: copy.questionLimit }];
        });
        return;
      }

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
        const res = await fetchWithTimeout("/api/ai/support-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lang: uiLang,
            ui_lang: uiLang,
            site_locale: uiLang,
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
              content: copy.busy,
            },
          ]);
          return;
        }
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: getFetchErrorMessage(e),
          },
        ]);
      } finally {
        setBusy(false);
        busyRef.current = false;
      }
    },
    [copy.busy, copy.questionLimit, uiLang, navigate],
  );

  const userQuestionCount = useMemo(
    () => countUserMessages(messages),
    [messages],
  );
  const questionLimitReached = userQuestionCount >= MAX_SUPPORT_USER_QUESTIONS;

  const openBrowseLink = useCallback(
    (href: string) => {
      setOpen(false);
      navigate(href);
    },
    [navigate],
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
                ? copy.voiceHttps
                : copy.voiceError,
            },
          ]);
          return;
        }
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: copy.voiceUnsupported,
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
          content: copy.voiceUnsupported,
        },
      ]);
      return;
    }
    webSpeechRef.current = controller;
  }, [copy.voiceError, copy.voiceHttps, copy.voiceUnsupported, market.code, sendMessage]);

  function toggleVoiceInput() {
    if (!voiceAvailable || busy) return;

    if (isMobileUserAgent()) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: copy.voiceMobile,
        },
      ]);
      return;
    }

    if (!isDesktopVoiceInputAvailable()) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: copy.voiceUnsupported,
        },
      ]);
      return;
    }

    if (listening) {
      stopListening();
      return;
    }
    startWebSpeech();
  }

  return (
    <>
      {open ? (
        <div
          className="fixed bottom-20 left-4 z-[60] w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-gray-200 bg-white shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: "min(420px, 70vh)" }}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-[#1A56A0] text-white">
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">💬 {copy.title}</p>
              <p className="text-[11px] text-white/85 truncate">{copy.subtitle}</p>
            </div>
            <button
              type="button"
              className="p-1 rounded-lg hover:bg-white/15 min-h-9 min-w-9 flex items-center justify-center shrink-0"
              onClick={() => {
                if (listening) stopListening();
                setOpen(false);
              }}
              aria-label={copy.closeAria}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm bg-gray-50 min-h-[200px]">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-xl px-3 py-2 max-w-[92%] whitespace-pre-wrap",
                  m.role === "user"
                    ? "ml-auto bg-[#1A56A0] text-white"
                    : "mr-auto bg-white border border-gray-100 text-gray-800",
                )}
              >
                {m.role === "assistant" ? (
                  <SupportChatMessageBody content={m.content} onOpenLink={openBrowseLink} />
                ) : (
                  m.content
                )}
              </div>
            ))}
            {voiceNeedsHttps ? (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
                {copy.voiceHttps}
              </p>
            ) : null}
            {showMobileVoiceHint ? (
              <p className="text-xs text-gray-600 bg-gray-100 border border-gray-200 rounded-lg px-2 py-1.5">
                {copy.voiceMobile}
              </p>
            ) : null}
            {busy ? (
              <div className="flex items-center gap-2 text-gray-500 text-xs px-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {copy.typing}
              </div>
            ) : null}
            {listening ? (
              <div className="flex items-center gap-2 text-red-600 text-xs px-2 font-medium">
                <span className="inline-block h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                {copy.listening}
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>
          <form
            className="p-2 border-t border-gray-100 flex flex-nowrap items-center gap-1.5 bg-white"
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage(input);
            }}
          >
            <input
              key={uiLang}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                questionLimitReached
                  ? copy.questionLimitPh
                  : listening
                    ? copy.listeningPh
                    : copy.inputPh
              }
              className="flex-1 min-w-0 w-0 min-h-10 sm:min-h-11 rounded-xl border border-gray-200 px-2.5 sm:px-3 text-sm"
              disabled={busy || listening || questionLimitReached}
              readOnly={listening}
            />
            {voiceAvailable ? (
              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={busy || questionLimitReached}
                data-testid="button-support-voice"
                className={cn(
                  "flex-none shrink-0 min-h-10 min-w-10 sm:min-h-11 sm:min-w-11 rounded-xl text-white flex items-center justify-center disabled:opacity-50 transition-colors",
                  listening
                    ? "bg-red-600 animate-pulse ring-2 ring-red-400 ring-offset-1"
                    : "bg-[#1A56A0] hover:bg-[#164a8c]",
                )}
                aria-label={listening ? copy.voiceStopAria : copy.voiceStartAria}
                aria-pressed={listening}
              >
                <Mic className={cn("h-4 w-4", listening && "scale-110")} />
              </button>
            ) : null}
            <button
              type="submit"
              disabled={busy || listening || questionLimitReached || !input.trim()}
              className="flex-none shrink-0 min-h-10 min-w-10 sm:min-h-11 sm:min-w-11 rounded-xl bg-[#1A56A0] text-white flex items-center justify-center disabled:opacity-50"
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
        {copy.fab}
      </button>
    </>
  );
}
