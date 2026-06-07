import { useState, useEffect } from "react";
import {
  LayoutDashboard, FileText, Users, Tag, AlertTriangle, Settings,
  LogOut, Menu, X, Lock, ShieldCheck, Building2, CreditCard, Store, Share2, UserPlus, Instagram, Trash2,
} from "lucide-react";
import { adminLoginEmailStart, adminLoginEmailVerify, adminLogout, isAdminLoggedIn } from "@/lib/admin-api";
import { useMarket } from "@/lib/market-context";
import Dashboard from "./dashboard";
import AdminListings from "./listings";
import AdminUsers from "./users";
import AdminCategories from "./categories";
import AdminReports from "./reports";
import AdminSettings from "./settings";
import AdminModeration from "./moderation";
import AdminPartners from "./partners";
import AdminPayments from "./payments";
import AdminShops from "./shops";
import AdminSocialPosts from "./social-posts";
import AdminFollowers from "./followers";
import AdminShopSocialEnrichments from "./shop-social-enrichments";
import AdminDeletionFeedback from "./deletion-feedback";

type Section =
  | "dashboard"
  | "partners"
  | "payments"
  | "listings"
  | "users"
  | "categories"
  | "reports"
  | "moderation"
  | "settings"
  | "shops"
  | "social"
  | "followers"
  | "shop-social"
  | "deletion-feedback";

const NAV: { id: Section; icon: React.ElementType }[] = [
  { id: "dashboard", icon: LayoutDashboard },
  { id: "partners", icon: Building2 },
  { id: "shops", icon: Store },
  { id: "shop-social", icon: Instagram },
  { id: "deletion-feedback", icon: Trash2 },
  { id: "payments", icon: CreditCard },
  { id: "listings", icon: FileText },
  { id: "social", icon: Share2 },
  { id: "followers", icon: UserPlus },
  { id: "users", icon: Users },
  { id: "categories", icon: Tag },
  { id: "reports", icon: AlertTriangle },
  { id: "moderation", icon: ShieldCheck },
  { id: "settings", icon: Settings },
];

const NAV_TITLE_KEY: Record<Section, string> = {
  dashboard: "adm_nav_dash",
  partners: "adm_nav_partners",
  payments: "adm_nav_payments",
  listings: "adm_nav_list",
  social: "adm_nav_social",
  followers: "adm_nav_followers",
  users: "adm_nav_users",
  categories: "adm_nav_cats",
  reports: "adm_nav_reports",
  moderation: "adm_nav_mod",
  settings: "adm_nav_settings",
  shops: "adm_nav_shops",
  "shop-social": "adm_nav_shop_social",
  "deletion-feedback": "adm_nav_deletion",
};

// ─── Login page ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin }: { onLogin: () => void }) {
  const { t } = useMarket();
  const [code, setCode] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"idle" | "sent">("idle");

  async function sendCode() {
    setError("");
    setLoading(true);
    try {
      await adminLoginEmailStart();
      setStep("sent");
    } catch {
      setError(t.adm_emailLoginSendFail);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminLoginEmailVerify(code, rememberMe);
      onLogin();
    } catch {
      setError(t.adm_badLogin);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0F2B7F 0%, #1A4FCC 50%, #2563EB 100%)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm mb-4">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">{t.adm_loginTitle}</h1>
          <p className="text-blue-200 text-sm mt-1">{t.adm_loginSubtitle}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{t.adm_signInHeading}</h2>
          <p className="text-sm text-gray-600 mb-4">{t.adm_emailLoginHint}</p>
          {step === "idle" ? (
            <div className="space-y-4">
              <button
                type="button"
                disabled={loading}
                onClick={() => void sendCode()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl py-3 font-bold text-sm transition-colors"
              >
                {loading ? t.adm_signingIn : t.adm_emailLoginSend}
              </button>
              {error ? (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                  <Lock size={14} />
                  {error}
                </div>
              ) : null}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  {t.adm_emailLoginCodeLbl}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                  required
                />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">{t.adm_remember_device}</span>
              </label>

              {error ? (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                  <Lock size={14} />
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading || code.trim().length < 4}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl py-3 font-bold text-sm transition-colors"
              >
                {loading ? t.adm_signingIn : t.adm_signInBtn}
              </button>
              <button
                type="button"
                className="w-full text-sm text-gray-500 underline"
                onClick={() => {
                  setStep("idle");
                  setCode("");
                }}
              >
                {t.adm_emailLoginResend}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({
  active,
  onNav,
  onLogout,
  mobile,
  onClose,
}: {
  active: Section;
  onNav: (s: Section) => void;
  onLogout: () => void;
  mobile?: boolean;
  onClose?: () => void;
}) {
  const { t } = useMarket();
  return (
    <div className={`flex flex-col h-full bg-gray-900 ${mobile ? "w-64" : "w-56"}`}>
      {mobile ? <div className="mobile-safe-top md:hidden" aria-hidden="true" /> : null}
      {/* Brand */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-blue-400" />
            <span className="font-black text-white text-sm">{t.adm_sidebarTitle}</span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{t.adm_loginSubtitle}</div>
        </div>
        {mobile && (
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { onNav(id); onClose?.(); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              active === id
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <Icon size={16} />
            {t[NAV_TITLE_KEY[id]]}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
        >
          <FileText size={16} />
          {t.adm_viewSite}
        </a>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-all"
        >
          <LogOut size={16} />
          {t.adm_signOut}
        </button>
      </div>
    </div>
  );
}

// ─── Admin App ────────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const { t } = useMarket();
  const [loggedIn, setLoggedIn] = useState(isAdminLoggedIn());
  const [section, setSection] = useState<Section>("partners");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.title = t.adm_docTitle;
    return () => { document.title = t.adm_docAfter; };
  }, [t.adm_docTitle, t.adm_docAfter]);

  const handleLogout = () => {
    adminLogout();
    setLoggedIn(false);
  };

  if (!loggedIn) {
    return <LoginPage onLogin={() => setLoggedIn(true)} />;
  }

  const sectionLabel = t[NAV_TITLE_KEY[section]] ?? "";

  const SectionComponent = {
    dashboard:  Dashboard,
    partners:   AdminPartners,
    payments:   AdminPayments,
    listings:   AdminListings,
    social:     AdminSocialPosts,
    followers:  AdminFollowers,
    users:      AdminUsers,
    categories: AdminCategories,
    reports:    AdminReports,
    moderation: AdminModeration,
    settings:   AdminSettings,
    shops:      AdminShops,
    "shop-social": AdminShopSocialEnrichments,
    "deletion-feedback": AdminDeletionFeedback,
  }[section];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col flex-shrink-0">
        <Sidebar active={section} onNav={setSection} onLogout={handleLogout} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="flex-shrink-0">
            <Sidebar active={section} onNav={setSection} onLogout={handleLogout} mobile onClose={() => setMobileOpen(false)} />
          </div>
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar — safe-area spacer pushes hamburger below iOS status bar on mobile */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 flex-shrink-0">
          <div className="mobile-safe-top md:hidden" aria-hidden="true" />
          <div className="px-4 md:px-6 flex items-center gap-4 min-h-14">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden flex items-center justify-center min-h-11 min-w-11 p-2.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors touch-manipulation"
              aria-label={t.adm_sidebarTitle}
            >
              <Menu size={20} />
            </button>
            <h1 className="font-bold text-gray-900">{sectionLabel}</h1>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-gray-500 hidden sm:block">{t.adm_role}</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          <SectionComponent />
        </div>
      </div>
    </div>
  );
}
