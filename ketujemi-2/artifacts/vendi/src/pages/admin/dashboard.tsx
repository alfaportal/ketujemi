import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getDashboard, type AdminDashboard } from "@/lib/admin-api";
import { FileText, Users, Tag, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMarket } from "@/lib/market-context";
import { dateFnsLocale } from "@/lib/app-extra-i18n";

const COLORS = ["#3B82F6","#60A5FA","#93C5FD","#1D4ED8","#2563EB","#1E40AF","#BFDBFE","#DBEAFE","#EFF6FF","#172554"];

function StatCard({ icon: Icon, label, value, sub, color = "blue" }: {
  icon: React.ElementType; label: string; value: number | string; sub?: string; color?: string;
}) {
  const colorMap: Record<string, string> = {
    blue:   "bg-blue-50 text-blue-600",
    green:  "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    amber:  "bg-amber-50 text-amber-600",
    red:    "bg-red-50 text-red-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="text-3xl font-black text-gray-900 mb-1">{typeof value === "number" ? value.toLocaleString() : value}</div>
      <div className="text-sm font-semibold text-gray-700">{label}</div>
      {sub && <div className="text-sm text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { t, market } = useMarket();
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-32 animate-pulse bg-gray-50" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-gray-400">{t.adm_dash_fail}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900 mb-1">{t.adm_dash_title}</h2>
        <p className="text-sm text-gray-400">{t.adm_dash_sub}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={FileText} label={t.adm_stat_listings} value={data.total_listings} color="blue" />
        <StatCard icon={Users} label={t.adm_stat_users} value={data.total_users} color="green" />
        <StatCard icon={Tag} label={t.adm_stat_cats} value={data.total_categories} color="purple" />
        <StatCard icon={AlertTriangle} label={t.adm_stat_reports} value={data.total_reports} color="red" />
        <StatCard
          icon={TrendingUp}
          label={t.adm_stat_newToday}
          value={data.new_today}
          sub={t.adm_stat_newTodaySub}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">{t.adm_chart_cat}</h3>
          {data.per_category.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.per_category} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="category_name" tick={{ fontSize: 12 }} width={90} />
                <Tooltip formatter={(v: number) => [v, t.adm_chart_tooltip]} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {data.per_category.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-300 text-sm">{t.adm_chart_empty}</div>
          )}
        </div>

        {/* Recent listings */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-blue-500" />
            <h3 className="font-bold text-gray-900">{t.adm_recent_head}</h3>
          </div>
          {data.recent_listings.length > 0 ? (
            <div className="space-y-3">
              {data.recent_listings.map((l) => (
                <div key={l.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  {l.image_url ? (
                    <img
                      src={l.image_url.split(",")[0]}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <FileText size={16} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">{l.title}</div>
                    <div className="text-xs text-gray-400">{l.location} · €{l.price.toLocaleString()}</div>
                  </div>
                  <div className="text-xs text-gray-400 flex-shrink-0">
                    {formatDistanceToNow(new Date(l.created_at), { addSuffix: true, locale: dateFnsLocale(market.code) })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-300 text-sm">{t.adm_recent_empty}</div>
          )}
        </div>
      </div>
    </div>
  );
}
