import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { useMarket } from "@/lib/market-context";
import { cn } from "@/lib/utils";

type ChatMessage = { role: "user" | "assistant"; content: string };

const WELCOME: Record<string, string> = {
  ks: "Përshëndetje! Si mund t'ju ndihmoj me KetuJemi.com?",
  al: "Përshëndetje! Si mund t'ju ndihmoj me KetuJemi.com?",
  mk: "Здраво! Како можам да ви помогнам со KetuJemi.com?",
  me: "Zdravo! Kako vam mogu pomoći sa KetuJemi.com?",
};

export function SupportChatWidget() {
  const { market } = useMarket();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const lang = market.code === "mk" ? "mk" : market.code === "mne" ? "me" : "sq";
  const welcome = WELCOME[market.code] ?? WELCOME.ks;

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "assistant", content: welcome }]);
    }
  }, [open, messages.length, welcome]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/ai/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          messages: next.filter((m) => m.role === "user" || m.content !== welcome),
        }),
      });
      const data = await res.json().catch(() => ({}));
      const reply =
        (data as { reply?: string }).reply ??
        "Për këtë çështje kontaktoni info.info@ketujemi.com";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Për këtë çështje kontaktoni info.info@ketujemi.com",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {open ? (
        <div
          className="fixed bottom-20 right-4 z-[60] w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-gray-200 bg-white shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: "min(420px, 70vh)" }}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-[#1A56A0] text-white">
            <span className="font-bold text-sm">💬 Ndihmë</span>
            <button
              type="button"
              className="p-1 rounded-lg hover:bg-white/15 min-h-9 min-w-9 flex items-center justify-center"
              onClick={() => setOpen(false)}
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
            {busy ? (
              <div className="flex items-center gap-2 text-gray-500 text-xs px-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Duke shkruar…
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>
          <form
            className="p-2 border-t border-gray-100 flex gap-2 bg-white"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Shkruani pyetjen…"
              className="flex-1 min-h-11 rounded-xl border border-gray-200 px-3 text-base sm:text-sm"
              disabled={busy}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="shrink-0 min-h-11 min-w-11 rounded-xl bg-[#1A56A0] text-white flex items-center justify-center disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-[60] flex items-center gap-2 rounded-full bg-[#1A56A0] text-white px-4 py-3 shadow-lg font-bold text-sm min-h-12 hover:bg-[#164a8c] transition-colors"
        data-testid="button-support-chat"
      >
        <MessageCircle className="h-5 w-5" />
        Ndihmë
      </button>
    </>
  );
}
