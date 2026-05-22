import { useEffect, useState } from "react";
import {
  getAdminUsers,
  getRegisteredUsers,
  getAdminBusinesses,
  activateAdminBusiness,
  blockAdminBusiness,
  getUserListings,
  banRegisteredUser,
  unbanRegisteredUser,
  deleteRegisteredUser,
  banSellerPhone,
  unbanSellerPhone,
  type AdminSeller,
  type RegisteredUser,
  type AdminListing,
  type AdminBusinessAccount,
} from "@/lib/admin-api";
import { Search, ChevronDown, ChevronUp, User, Phone, Clock, Ban, Trash2, Building2, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMarket } from "@/lib/market-context";
import { dateFnsLocale, fillPlaceholders } from "@/lib/app-extra-i18n";

type Tab = "registered" | "sellers" | "businesses";

export default function AdminUsers() {
  const { t, market } = useMarket();
  const [tab, setTab] = useState<Tab>("businesses");
  const [sellers, setSellers] = useState<AdminSeller[]>([]);
  const [registered, setRegistered] = useState<RegisteredUser[]>([]);
  const [businesses, setBusinesses] = useState<AdminBusinessAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [userListings, setUserListings] = useState<Record<string, AdminListing[]>>({});
  const [listingsLoading, setListingsLoading] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const [s, r, b] = await Promise.all([
        getAdminUsers(),
        getRegisteredUsers(),
        getAdminBusinesses(),
      ]);
      setSellers(s);
      setRegistered(r);
      setBusinesses(b);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
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

  const q = search.toLowerCase();
  const filteredRegistered = registered.filter(
    (u) =>
      (u.display_name ?? "").toLowerCase().includes(q) ||
      (u.email ?? "").toLowerCase().includes(q) ||
      (u.phone_e164_digits ?? "").includes(q),
  );
  const filteredSellers = sellers.filter(
    (u) => u.seller_name.toLowerCase().includes(q) || u.seller_phone.includes(q),
  );
  const filteredBusinesses = businesses.filter(
    (b) =>
      (b.business_name ?? "").toLowerCase().includes(q) ||
      (b.email ?? "").toLowerCase().includes(q) ||
      (b.phone_e164_digits ?? "").includes(q),
  );
  const pendingCount = businesses.filter((b) => b.business_status === "pending").length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-black text-gray-900">{t.adm_users_head}</h2>
        <p className="text-sm text-gray-400">
          {fillPlaceholders(t.adm_users_counts, {
            reg: String(registered.length),
            sellers: String(sellers.length),
          })}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("registered")}
          className={`px-4 py-2 rounded-xl text-sm font-bold ${
            tab === "registered" ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600"
          }`}
        >
          {t.adm_users_tab_reg}
        </button>
        <button
          type="button"
          onClick={() => setTab("sellers")}
          className={`px-4 py-2 rounded-xl text-sm font-bold ${
            tab === "sellers" ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600"
          }`}
        >
          {t.adm_users_tab_sellers}
        </button>
        <button
          type="button"
          onClick={() => setTab("businesses")}
          className={`px-4 py-2 rounded-xl text-sm font-bold relative ${
            tab === "businesses" ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600"
          }`}
        >
          Bizneset / Partner
          {pendingCount > 0 ? (
            <span className="ml-1.5 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black">
              {pendingCount}
            </span>
          ) : null}
        </button>
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
          <div className="px-5 py-16 text-center text-gray-400">{t.adm_users_loading}</div>
        ) : tab === "businesses" ? (
          filteredBusinesses.length === 0 ? (
            <div className="px-5 py-16 text-center text-gray-400">Nuk ka llogari biznesi</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredBusinesses.map((b) => (
                <div key={b.id} className="px-5 py-4 flex flex-wrap items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1A56A0] to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Building2 size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800">
                      {b.business_name ?? "—"}
                      <span
                        className={`ml-2 text-xs font-bold uppercase ${
                          b.business_tier === "vip" ? "text-amber-700" : "text-[#1A56A0]"
                        }`}
                      >
                        {b.business_tier === "vip" ? "VIP" : "Partner"}
                      </span>
                      <span
                        className={`ml-2 text-xs font-bold uppercase ${
                          b.business_status === "active"
                            ? "text-green-700"
                            : b.business_status === "pending"
                              ? "text-amber-700"
                              : "text-red-600"
                        }`}
                      >
                        {b.business_status === "active"
                          ? "Aktiv"
                          : b.business_status === "pending"
                            ? "Në pritje"
                            : "Bllokuar"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {b.email ?? "—"} · {b.phone_e164_digits ?? "—"}
                      {b.partner_link_url ? ` · Link: ${b.partner_link_type}` : " · Pa link"}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {b.business_status === "pending" ? (
                      <button
                        type="button"
                        onClick={() => activateAdminBusiness(b.id).then(reload)}
                        className="text-xs font-bold text-green-800 px-3 py-1.5 rounded-lg bg-green-50 flex items-center gap-1"
                      >
                        <CheckCircle size={12} /> Aktivizo
                      </button>
                    ) : null}
                    {b.business_status !== "blocked" ? (
                      <button
                        type="button"
                        onClick={() => blockAdminBusiness(b.id).then(reload)}
                        className="text-xs font-bold text-red-700 px-3 py-1.5 rounded-lg bg-red-50 flex items-center gap-1"
                      >
                        <Ban size={12} /> Blloko
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => activateAdminBusiness(b.id).then(reload)}
                        className="text-xs font-bold text-green-700 px-3 py-1.5 rounded-lg bg-green-50"
                      >
                        Riaktivizo
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : tab === "registered" ? (
          filteredRegistered.length === 0 ? (
            <div className="px-5 py-16 text-center text-gray-400">{t.adm_users_none}</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredRegistered.map((u) => (
                <div key={u.id} className="px-5 py-4 flex flex-wrap items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center flex-shrink-0">
                    <User size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800">
                      {u.display_name ?? t.adm_users_anon}
                      {u.banned_at ? (
                        <span className="ml-2 text-xs font-bold text-red-600 uppercase">{t.adm_users_banned}</span>
                      ) : null}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {u.email ?? "—"} · {u.phone_e164_digits ?? u.contact_phone ?? "—"} · {u.listing_count}{" "}
                      {t.adm_users_lc}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {u.banned_at ? (
                      <button
                        type="button"
                        onClick={() => unbanRegisteredUser(u.id).then(reload)}
                        className="text-xs font-bold text-green-700 px-3 py-1.5 rounded-lg bg-green-50"
                      >
                        {t.adm_users_unban}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => banRegisteredUser(u.id).then(reload)}
                        className="text-xs font-bold text-red-700 px-3 py-1.5 rounded-lg bg-red-50 flex items-center gap-1"
                      >
                        <Ban size={12} /> {t.adm_users_ban}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(t.adm_users_delConfirm)) {
                          deleteRegisteredUser(u.id).then(reload);
                        }
                      }}
                      className="text-xs font-bold text-gray-600 px-3 py-1.5 rounded-lg bg-gray-100 flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : filteredSellers.length === 0 ? (
          <div className="px-5 py-16 text-center text-gray-400">{t.adm_users_none}</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredSellers.map((u) => (
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
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        banSellerPhone(u.seller_phone).then(reload);
                      }}
                      className="text-xs font-bold text-red-700 px-2 py-1 rounded-lg bg-red-50"
                    >
                      {t.adm_users_ban}
                    </button>
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
                        {(userListings[u.seller_phone] ?? []).map((l) => (
                          <div key={l.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-gray-800 truncate">{l.title}</div>
                              <div className="text-xs text-gray-400">{l.location} · €{l.price.toLocaleString()}</div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock size={11} />
                              {formatDistanceToNow(new Date(l.created_at), {
                                addSuffix: true,
                                locale: dateFnsLocale(market.code),
                              })}
                            </div>
                          </div>
                        ))}
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

