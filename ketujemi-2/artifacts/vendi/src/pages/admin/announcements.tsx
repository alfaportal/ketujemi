import { useCallback, useEffect, useState } from "react";
import { Loader2, Mail, Send } from "lucide-react";
import { useMarket } from "@/lib/market-context";
import {
  getAdminAnnouncementCampaigns,
  getAdminAnnouncementRecipientCount,
  sendAdminAnnouncement,
  type AdminAnnouncementCampaign,
} from "@/lib/admin-api";

export default function AdminAnnouncements() {
  const { t } = useMarket();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [campaigns, setCampaigns] = useState<AdminAnnouncementCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [countRes, campRes] = await Promise.all([
        getAdminAnnouncementRecipientCount(),
        getAdminAnnouncementCampaigns(),
      ]);
      setRecipientCount(countRes.count);
      setCampaigns(campRes.campaigns);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      setError(t.adm_ann_required);
      return;
    }
    const n = recipientCount ?? 0;
    if (n === 0) {
      setError(t.adm_ann_no_recipients);
      return;
    }
    const ok = window.confirm(
      t.adm_ann_confirm.replace("{count}", String(n)),
    );
    if (!ok) return;

    setSending(true);
    setError("");
    setSuccess("");
    try {
      const res = await sendAdminAnnouncement({ subject: subject.trim(), body: body.trim() });
      setSuccess(res.message ?? t.adm_ann_sent.replace("{count}", String(res.recipient_count)));
      setSubject("");
      setBody("");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t.adm_ann_send_fail);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Mail size={24} className="text-blue-600" />
          {t.adm_ann_head}
        </h2>
        <p className="text-sm text-gray-500 mt-1">{t.adm_ann_intro}</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Loader2 size={16} className="animate-spin" />
          {t.adm_ann_loading}
        </div>
      ) : (
        <p className="text-sm font-medium text-blue-800 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          {t.adm_ann_recipients.replace("{count}", String(recipientCount ?? 0))}
        </p>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="ann-subject">
            {t.adm_ann_subject}
          </label>
          <input
            id="ann-subject"
            type="text"
            maxLength={200}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t.adm_ann_subject_ph}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="ann-body">
            {t.adm_ann_body}
          </label>
          <textarea
            id="ann-body"
            rows={10}
            maxLength={50000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[12rem]"
            placeholder={t.adm_ann_body_ph}
          />
          <p className="text-xs text-gray-400 mt-1">{t.adm_ann_body_hint}</p>
        </div>

        {error ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
        ) : null}
        {success ? (
          <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-3 py-2">{success}</p>
        ) : null}

        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={sending || loading}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {sending ? t.adm_ann_sending : t.adm_ann_send_btn}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-gray-100 font-semibold text-gray-900 text-sm">
          {t.adm_ann_history}
        </div>
        {campaigns.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-400">{t.adm_ann_history_empty}</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {campaigns.map((c) => (
              <li key={c.id} className="px-5 py-3 text-sm">
                <div className="font-medium text-gray-900">{c.subject}</div>
                <div className="text-gray-500 mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                  <span>{new Date(c.created_at).toLocaleString()}</span>
                  <span>{c.recipient_count} {t.adm_ann_recipients_short}</span>
                  <span
                    className={
                      c.status === "sent"
                        ? "text-green-600"
                        : c.status === "failed"
                          ? "text-red-600"
                          : "text-amber-600"
                    }
                  >
                    {c.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
