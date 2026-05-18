import { useEffect, useState } from "react";
import {
  getModerationState,
  updateModerationSettings,
  runModerationCommand,
  type ModerationState,
} from "@/lib/admin-api";
import { Bot, Loader2, Send, Shield } from "lucide-react";
import { useMarket } from "@/lib/market-context";

export default function AdminModeration() {
  const { t } = useMarket();
  const [state, setState] = useState<ModerationState | null>(null);
  const [command, setCommand] = useState("");
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getModerationState()
      .then(setState)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  const toggleEnabled = async () => {
    if (!state) return;
    const next = state.enabled === "true" ? "false" : "true";
    const updated = await updateModerationSettings({ enabled: next });
    setState(updated);
  };

  const savePrompt = async () => {
    if (!state) return;
    const updated = await updateModerationSettings({ system_prompt: state.system_prompt });
    setState(updated);
  };

  const submitCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setRunning(true);
    try {
      const { reply } = await runModerationCommand(command);
      setCommand("");
      const updated = await getModerationState();
      setState({ ...updated, last_reply: reply });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Command failed");
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-400">{t.adm_mod_loading}</p>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Bot size={24} className="text-violet-600" />
          {t.adm_mod_title}
        </h2>
        <p className="text-sm text-gray-400 mt-1">{t.adm_mod_intro}</p>
      </header>

      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Shield size={16} className="text-violet-500" />
            {t.adm_mod_enabled}
          </div>
          <button
            type="button"
            onClick={toggleEnabled}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              state?.enabled === "true"
                ? "bg-violet-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {state?.enabled === "true" ? t.adm_mod_on : t.adm_mod_off}
          </button>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
            {t.adm_mod_system}
          </label>
          <textarea
            value={state?.system_prompt ?? ""}
            onChange={(e) => setState((s) => (s ? { ...s, system_prompt: e.target.value } : s))}
            rows={5}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 font-mono"
          />
          <button
            type="button"
            onClick={savePrompt}
            className="mt-2 text-sm text-violet-600 font-semibold hover:text-violet-800"
          >
            {t.adm_mod_savePrompt}
          </button>
        </div>
      </section>

      <form onSubmit={submitCommand} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">
          {t.adm_mod_command}
        </label>
        <textarea
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder={t.adm_mod_commandPh}
          rows={4}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400"
          required
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={running || state?.enabled !== "true"}
          className="flex items-center justify-center gap-2 w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white rounded-xl py-3 font-bold text-sm"
        >
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
          {running ? t.adm_mod_running : t.adm_mod_run}
        </button>
      </form>

      {state?.last_reply ? (
        <section className="bg-gray-900 text-gray-100 rounded-2xl p-5 space-y-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide">{t.adm_mod_lastCmd}</p>
          <p className="text-sm text-violet-200 whitespace-pre-wrap">{state.last_command}</p>
          <p className="text-xs text-gray-400 uppercase tracking-wide pt-2 border-t border-gray-700">
            {t.adm_mod_lastReply}
          </p>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{state.last_reply}</p>
          {state.last_run_at ? (
            <p className="text-xs text-gray-500">{new Date(state.last_run_at).toLocaleString()}</p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

