import { useEffect, useState } from "react";
import { getAdminUsers, getUserListings, type AdminUser, type AdminListing } from "@/lib/admin-api";
import { Search, ChevronDown, ChevronUp, User, Phone, FileText, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMarket } from "@/lib/market-context";
import { dateFnsLocale, fillPlaceholders } from "@/lib/app-extra-i18n";

export default function AdminUsers() {
  const { t, market } = useMarket();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [userListings, setUserListings] = useState<Record<string, AdminListing[]>>({});
  const [listingsLoading, setListingsLoading] = useState<string | null>(null);

  useEffect(() => {
    getAdminUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  const toggleExpand = async (phone: string) => {
    if (expanded === phone) {
      setExpanded(null);
      return;
    }
    setExpanded(phone);
    if (!userListings[phone]) {
      setListingsLoading(phone);
      try {
        const ls = await getUserListings(phone);
        setUserListings((prev) => ({ ...prev, [phone]: ls }));
      } finally {
        setListingsLoading(null);
      }
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return u.seller_name.toLowerCase().includes(q) || u.seller_phone.includes(q);
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-black text-gray-900">{t.adm_users_head}</h2>
        <p className="text-sm text-gray-400">{fillPlaceholders(t.adm_users_unique, { n: users.length.toLocaleString() })}</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder={t.adm_users_searchPh}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 bg-gray-50 focus:bg-white transition-all"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-16 text-center text-gray-400">{t.adm_users_none}</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((u) => (
              <div key={u.seller_phone}>
                <button
                  type="button"
                  onClick={() => toggleExpand(u.seller_phone)}
                  className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left min-h-[64px]"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                    <User size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800">{u.seller_name}</div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <Phone size={11} />
                      <span>{u.seller_phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-bold text-gray-700">{u.listing_count}</div>
                      <div className="text-xs text-gray-400">{t.adm_users_lc}</div>
                    </div>
                    <div className="text-right hidden md:block">
                      <div className="text-xs text-gray-400">{t.adm_users_last}</div>
                      <div className="text-xs font-medium text-gray-600">
                        {formatDistanceToNow(new Date(u.last_active), { addSuffix: true, locale: dateFnsLocale(market.code) })}
                      </div>
                    </div>
                    {expanded === u.seller_phone ? (
                      <ChevronUp size={16} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-400" />
                    )}
                  </div>
                </button>

                {expanded === u.seller_phone && (
                  <div className="px-5 pb-4 bg-blue-50/30">
                    {listingsLoading === u.seller_phone ? (
                      <div className="text-center py-6 text-sm text-gray-400">{t.adm_users_loading_listings}</div>
                    ) : (
                      <div className="space-y-2 pt-2">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                          {fillPlaceholders(t.adm_users_for, { name: u.seller_name })}
                        </div>
                        {(userListings[u.seller_phone] ?? []).map((l) => (
                          <div key={l.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                            {l.image_url ? (
                              <img src={l.image_url.split(",")[0]} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <FileText size={14} className="text-gray-300" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-gray-800 truncate">{l.title}</div>
                              <div className="text-xs text-gray-400">{l.location} · €{l.price.toLocaleString()}</div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                              <Clock size={11} />
                              {formatDistanceToNow(new Date(l.created_at), { addSuffix: true, locale: dateFnsLocale(market.code) })}
                            </div>
                          </div>
                        ))}
                        {(userListings[u.seller_phone] ?? []).length === 0 && (
                          <div className="text-center py-4 text-sm text-gray-400">{t.adm_users_noneL}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
