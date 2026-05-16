import { useEffect, useState } from "react";
import { getAdminSettings, updateAdminSettings } from "@/lib/admin-api";
import { Save, Globe, Mail, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useMarket } from "@/lib/market-context";

export default function AdminSettings() {
  const { t } = useMarket();
  const [settings, setSettings] = useState<Record<string, string>>({
    site_name: "KetuJemi.com",
    contact_email: "info@ketujemi.com",
    maintenance_mode: "false",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getAdminSettings().then(setSettings).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const updated = await updateAdminSettings(settings);
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string, value: string) => setSettings((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-black text-gray-900">{t.adm_set_head}</h2>
        <p className="text-sm text-gray-400">{t.adm_set_intro}</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-24 animate-pulse bg-gray-50" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Globe size={16} className="text-blue-600" />
              </div>
              <div>
                <div className="font-bold text-gray-900">{t.adm_set_siteTitle}</div>
                <div className="text-xs text-gray-400">{t.adm_set_siteHint}</div>
              </div>
            </div>
            <input
              value={settings.site_name ?? ""}
              onChange={(e) => set("site_name", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all min-h-[44px]"
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                <Mail size={16} className="text-green-600" />
              </div>
              <div>
                <div className="font-bold text-gray-900">{t.adm_set_mailTitle}</div>
                <div className="text-xs text-gray-400">{t.adm_set_mailHint}</div>
              </div>
            </div>
            <input
              type="email"
              value={settings.contact_email ?? ""}
              onChange={(e) => set("contact_email", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all min-h-[44px]"
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  settings.maintenance_mode === "true" ? "bg-red-50" : "bg-gray-50"
                }`}>
                  <AlertTriangle size={16} className={settings.maintenance_mode === "true" ? "text-red-500" : "text-gray-400"} />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-gray-900">{t.adm_set_maintTitle}</div>
                  <div className="text-xs text-gray-400">
                    {settings.maintenance_mode === "true"
                      ? t.adm_set_maintOn
                      : t.adm_set_maintOff}
                  </div>
                </div>
              </div>
              <button
                type="button"
                aria-pressed={settings.maintenance_mode === "true"}
                onClick={() => set("maintenance_mode", settings.maintenance_mode === "true" ? "false" : "true")}
                className={`relative w-12 h-6 rounded-full transition-colors shrink-0 self-center ${
                  settings.maintenance_mode === "true" ? "bg-red-500" : "bg-gray-300"
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings.maintenance_mode === "true" ? "translate-x-6" : "translate-x-0.5"
                }`} />
              </button>
            </div>
            {settings.maintenance_mode === "true" && (
              <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100 text-xs text-red-700">
                {t.adm_set_maintWarn}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-h-[44px]">
              {saved && (
                <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                  <CheckCircle2 size={16} /> {t.adm_set_saved}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] w-full sm:w-auto"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? t.saving : t.adm_set_btn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
