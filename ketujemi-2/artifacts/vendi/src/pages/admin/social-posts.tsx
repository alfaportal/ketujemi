import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAdminSocialPostListings,
  postAdminSocialListings,
  previewAdminSocialPost,
  runAdminListingReel,
  runAdminSocialScheduledPosts,
  type AdminSocialListing,
} from "@/lib/admin-api";
import { useMarket } from "@/lib/market-context";
import { fillPlaceholders } from "@/lib/app-extra-i18n";
import {
  ChevronLeft,
  ChevronRight,
  Facebook,
  Instagram,
  RefreshCw,
  Search,
  Send,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  Film,
} from "lucide-react";

type Filter = "all" | "pending_fb" | "pending_ig" | "posted";

function StatusBadge({ posted, label }: { posted: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        posted ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      {posted ? <CheckCircle2 size={12} /> : <Clock size={12} />}
      {label}
    </span>
  );
}

function formatAdminPrice(price: number, t: Record<string, string>): string {
  if (!Number.isFinite(price) || price <= 0) return t.adm_social_price_agreement;
  return `${price}€`;
}

function skipReasonLabel(code: string | null, t: Record<string, string>): string | null {
  if (!code) return null;
  const key = `adm_social_skip_${code}` as keyof typeof t;
  const label = t[key];
  return typeof label === "string" ? label : code;
}

/** FB dhe IG veç e veç — jo vetëm radha e parë (cron poston FB pastaj IG). */
function SocialQueueBadges({ listing, t }: { listing: AdminSocialListing; t: Record<string, string> }) {
  if (listing.skip_reason) {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
        {t.adm_social_queue_skip}
      </span>
    );
  }
  if (listing.fb_posted && listing.ig_posted) {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        {t.adm_social_queue_done}
      </span>
    );
  }
  return (
    <div className="flex flex-col gap-1 items-start">
      {!listing.fb_posted && (
        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {t.adm_social_queue_fb}
        </span>
      )}
      {!listing.ig_posted && (
        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
          {t.adm_social_queue_ig}
        </span>
      )}
    </div>
  );
}

function ImageCarousel({ urls, title }: { urls: string[]; title: string }) {
  const [idx, setIdx] = useState(0);
  if (urls.length === 0) {
    return (
      <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-sm text-gray-400">
        —
      </div>
    );
  }
  const current = urls[idx] ?? urls[0];
  return (
    <div className="relative">
      <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
        <img src={current} alt={title} className="w-full h-full object-contain" />
      </div>
      {urls.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIdx((i) => (i - 1 + urls.length) % urls.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70"
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setIdx((i) => (i + 1) % urls.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70"
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
          <div className="flex gap-1 justify-center mt-2 overflow-x-auto pb-1">
            {urls.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => setIdx(i)}
                className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 ${
                  i === idx ? "border-blue-500" : "border-transparent opacity-70"
                }`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-1">
            {idx + 1} / {urls.length}
          </p>
        </>
      )}
    </div>
  );
}

export default function AdminSocialPosts() {
  const { t } = useMarket();
  const [listings, setListings] = useState<AdminSocialListing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [previewTab, setPreviewTab] = useState<"facebook" | "instagram">("facebook");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<Awaited<ReturnType<typeof previewAdminSocialPost>> | null>(null);
  const [posting, setPosting] = useState(false);
  const [cronRunning, setCronRunning] = useState(false);
  const [reelRunning, setReelRunning] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [configured, setConfigured] = useState({ facebook: false, instagram: false });
  const [previewExpanded, setPreviewExpanded] = useState(false);

  const PAGE_SIZE = 20;

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminSocialPostListings({
        search: debouncedSearch || undefined,
        filter,
        page,
        limit: PAGE_SIZE,
      });
      setListings(data.listings);
      setTotal(data.total);
      setConfigured(data.configured);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filter, page]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filter]);

  const pendingCount = useMemo(
    () => listings.filter((l) => l.queue === "pending_fb" || l.queue === "pending_ig").length,
    [listings],
  );

  const loadPreview = useCallback(async (id: number) => {
    setPreviewId(id);
    setPreviewLoading(true);
    setPreviewData(null);
    try {
      const data = await previewAdminSocialPost(id);
      setPreviewData(data);
    } catch {
      setMessage({ type: "err", text: t.adm_social_preview_fail });
    } finally {
      setPreviewLoading(false);
    }
  }, [t.adm_social_preview_fail]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === listings.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(listings.map((l) => l.id)));
    }
  };

  const runPost = async (ids: number[]) => {
    if (ids.length === 0) {
      setMessage({ type: "err", text: t.adm_social_select_one });
      return;
    }
    if (!configured.facebook && !configured.instagram) {
      setMessage({ type: "err", text: t.adm_social_not_configured });
      return;
    }
    setPosting(true);
    setMessage(null);
    try {
      const { results } = await postAdminSocialListings(ids);
      const failed = results.filter((r) => r.ok === false || r.facebook?.ok === false || r.instagram?.ok === false);
      if (failed.length === 0) {
        setMessage({ type: "ok", text: t.adm_social_post_success });
        setSelected(new Set());
        await fetchList();
        if (previewId && ids.includes(previewId)) {
          await loadPreview(previewId);
        }
      } else {
        setMessage({ type: "err", text: `${t.adm_social_post_fail} (${failed.length})` });
        await fetchList();
      }
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : t.adm_social_post_fail });
    } finally {
      setPosting(false);
    }
  };

  const handlePost = () => runPost([...selected]);

  const handleRunScheduledCron = useCallback(async () => {
    setCronRunning(true);
    setMessage(null);
    try {
      const result = await runAdminSocialScheduledPosts();
      const parts: string[] = [];
      if (result.facebook.posted) {
        parts.push(
          fillPlaceholders(t.adm_social_cron_fb_ok ?? "FB: posted #{id}.", {
            id: String(result.facebook.listingId ?? ""),
          }),
        );
      } else if (
        result.facebook.reason === "no_pending" ||
        result.facebook.reason === "no_eligible"
      ) {
        parts.push(t.adm_social_cron_fb_empty ?? "FB: no pending listings.");
      } else {
        parts.push(
          fillPlaceholders(t.adm_social_cron_fb_fail ?? "FB failed: {detail}", {
            detail: result.facebook.graphError ?? result.facebook.reason ?? "failed",
          }),
        );
      }
      if (result.instagram.posted) {
        parts.push(
          fillPlaceholders(t.adm_social_cron_ig_ok ?? "IG: posted #{id}.", {
            id: String(result.instagram.listingId ?? ""),
          }),
        );
      } else if (
        result.instagram.reason === "no_pending" ||
        result.instagram.reason === "no_eligible"
      ) {
        parts.push(t.adm_social_cron_ig_empty ?? "IG: no pending listings.");
      } else if (result.instagram.reason !== "not_configured") {
        parts.push(
          fillPlaceholders(t.adm_social_cron_ig_fail ?? "IG failed: {detail}", {
            detail: result.instagram.graphError ?? result.instagram.reason ?? "failed",
          }),
        );
      }
      const anyPosted = result.facebook.posted || result.instagram.posted;
      const anyHardFail =
        !anyPosted &&
        result.facebook.reason !== "no_pending" &&
        result.facebook.reason !== "no_eligible" &&
        result.facebook.reason !== "not_configured";
      setMessage({
        type: anyPosted || !anyHardFail ? "ok" : "err",
        text: parts.join(" "),
      });
      await fetchList();
    } catch (e) {
      setMessage({
        type: "err",
        text: e instanceof Error ? e.message : (t.adm_social_cron_fail ?? "Scheduled cron failed"),
      });
    } finally {
      setCronRunning(false);
    }
  }, [fetchList, t]);

  const handleRunListingReel = useCallback(async () => {
    setReelRunning(true);
    setMessage(null);
    try {
      const result = await runAdminListingReel();
      if (result.posted) {
        setMessage({
          type: "ok",
          text: fillPlaceholders(t.adm_social_reel_ok ?? "Reel posted ({count} listings).", {
            count: String(result.listingIds?.length ?? 0),
          }),
        });
      } else if (result.reason === "not_enough_listings") {
        setMessage({ type: "ok", text: t.adm_social_reel_empty ?? "Not enough listings for a reel." });
      } else {
        setMessage({
          type: "err",
          text: fillPlaceholders(t.adm_social_reel_fail ?? "Reel failed: {detail}", {
            detail: result.error ?? result.reason ?? "failed",
          }),
        });
      }
    } catch (e) {
      setMessage({
        type: "err",
        text: e instanceof Error ? e.message : (t.adm_social_reel_fail ?? "Reel failed"),
      });
    } finally {
      setReelRunning(false);
    }
  }, [t]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: t.adm_social_filter_all },
    { id: "pending_fb", label: t.adm_social_filter_fb },
    { id: "pending_ig", label: t.adm_social_filter_ig },
    { id: "posted", label: t.adm_social_filter_posted },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{t.adm_social_intro}</p>
          {!configured.facebook && !configured.instagram && (
            <p className="text-sm text-amber-700 mt-1 flex items-center gap-1">
              <AlertCircle size={14} />
              {t.adm_social_not_configured}
            </p>
          )}
          {configured.facebook && !configured.instagram && (
            <p className="text-sm text-amber-700 mt-1 flex items-center gap-1">
              <AlertCircle size={14} />
              {t.adm_social_ig_not_configured}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fetchList()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {t.adm_social_refresh}
          </button>
          <button
            type="button"
            onClick={() => void handleRunScheduledCron()}
            disabled={cronRunning || (!configured.facebook && !configured.instagram)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-blue-200 bg-blue-50 text-sm font-semibold text-blue-800 hover:bg-blue-100 disabled:opacity-50"
          >
            <Clock size={14} className={cronRunning ? "animate-pulse" : ""} />
            {cronRunning
              ? (t.adm_social_cron_running ?? "Running cron…")
              : (t.adm_social_cron_now ?? "Run FB + IG crons now")}
          </button>
          <button
            type="button"
            onClick={() => void handleRunListingReel()}
            disabled={reelRunning}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-orange-200 bg-orange-50 text-sm font-semibold text-orange-800 hover:bg-orange-100 disabled:opacity-50"
          >
            <Film size={14} className={reelRunning ? "animate-pulse" : ""} />
            {reelRunning
              ? (t.adm_social_reel_running ?? "Generating reel…")
              : (t.adm_social_reel_now ?? "Post listing reel")}
          </button>
          <button
            type="button"
            onClick={handlePost}
            disabled={posting || selected.size === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            <Send size={14} />
            {posting ? t.adm_social_posting : t.adm_social_post_now}
            {selected.size > 0 ? ` (${selected.size})` : ""}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl text-sm ${
            message.type === "ok" ? "bg-green-50 text-green-800 border border-green-100" : "bg-red-50 text-red-800 border border-red-100"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === f.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.adm_social_search_ph}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        checked={listings.length > 0 && selected.size === listings.length}
                        onChange={toggleAll}
                        aria-label="Select all"
                      />
                    </th>
                    <th className="p-3">{t.adm_social_col_listing}</th>
                    <th className="p-3 min-w-[108px]">{t.adm_social_col_queue}</th>
                    <th className="p-3 w-20">
                      <div className="flex flex-col items-center gap-0.5" title="Facebook / Instagram">
                        <Facebook size={14} className="inline" />
                        <Instagram size={14} className="inline" />
                      </div>
                    </th>
                    <th className="p-3 w-24" />
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400">
                        {t.adm_social_loading}
                      </td>
                    </tr>
                  )}
                  {!loading && listings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400">
                        {t.adm_social_empty}
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    listings.map((l) => (
                      <tr
                        key={l.id}
                        className={`border-t border-gray-50 hover:bg-gray-50/80 ${
                          previewId === l.id ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selected.has(l.id)}
                            onChange={() => toggleSelect(l.id)}
                            disabled={!!l.skip_reason}
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-3 min-w-[200px]">
                            {l.image_urls[0] ? (
                              <img
                                src={l.image_urls[0]}
                                alt=""
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 truncate">{l.title}</div>
                              <div className="text-xs text-gray-500 truncate">
                                {l.shop_name ?? l.seller_name} · {formatAdminPrice(l.price, t as Record<string, string>)} · {l.location}
                              </div>
                              {l.skip_reason && (
                                <div className="text-xs text-red-600">
                                  {skipReasonLabel(l.skip_reason, t as Record<string, string>)}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 align-top">
                          <SocialQueueBadges listing={l} t={t as Record<string, string>} />
                        </td>
                        <td className="p-3 align-top">
                          <div className="flex flex-col gap-1">
                            <StatusBadge posted={l.fb_posted} label={l.fb_posted ? "FB ✓" : "FB —"} />
                            <StatusBadge posted={l.ig_posted} label={l.ig_posted ? "IG ✓" : "IG —"} />
                          </div>
                        </td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => loadPreview(l.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50"
                          >
                            <Eye size={12} />
                            {t.adm_social_preview}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
                <span className="text-gray-500">
                  {fillPlaceholders(t.adm_social_page_info, { page: String(page), total: String(totalPages) })}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="p-1.5 rounded-lg border disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 rounded-lg border disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {filter === "all" && pendingCount > 0 && (
            <p className="text-xs text-gray-500">
              {fillPlaceholders(t.adm_social_pending_hint, { count: String(pendingCount) })}
            </p>
          )}
        </div>

        <div className="w-full lg:w-[min(520px,42vw)] flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-4 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="font-bold text-gray-900">{t.adm_social_preview_title}</h3>
              {previewData && !previewLoading && (
                <button
                  type="button"
                  onClick={() => setPreviewExpanded(true)}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  {t.adm_social_preview_expand}
                </button>
              )}
            </div>
            {!previewId && (
              <p className="text-sm text-gray-400">{t.adm_social_preview_pick}</p>
            )}
            {previewId && previewLoading && (
              <p className="text-sm text-gray-400">{t.adm_social_loading}</p>
            )}
            {previewData && !previewLoading && (
              <div className="space-y-3">
                <ImageCarousel urls={previewData.listing.image_urls} title={previewData.listing.title} />
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("facebook")}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold ${
                      previewTab === "facebook" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Facebook size={12} />
                    {t.adm_social_preview_fb}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("instagram")}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold ${
                      previewTab === "instagram" ? "bg-pink-600 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Instagram size={12} />
                    {t.adm_social_preview_ig}
                  </button>
                </div>
                <pre className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 rounded-xl p-4 min-h-[280px] max-h-[min(60vh,520px)] overflow-y-auto font-sans leading-relaxed border border-gray-100">
                  {previewTab === "facebook" ? previewData.preview.facebook : previewData.preview.instagram}
                </pre>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="px-2 py-0.5 bg-gray-100 rounded">{previewData.preview.theme}</span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded">{previewData.preview.caption_source}</span>
                  <StatusBadge
                    posted={previewData.listing.fb_posted}
                    label={previewData.listing.fb_posted ? "FB ✓" : "FB —"}
                  />
                  <StatusBadge
                    posted={previewData.listing.ig_posted}
                    label={previewData.listing.ig_posted ? "IG ✓" : "IG —"}
                  />
                </div>
                <button
                  type="button"
                  disabled={posting || !!previewData.listing.skip_reason}
                  onClick={() => runPost([previewData.listing.id])}
                  className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {posting ? t.adm_social_posting : t.adm_social_post_now}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {previewExpanded && previewData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setPreviewExpanded(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{t.adm_social_preview_title}</h3>
              <button
                type="button"
                onClick={() => setPreviewExpanded(false)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-1 px-5 pt-3">
              <button
                type="button"
                onClick={() => setPreviewTab("facebook")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                  previewTab === "facebook" ? "bg-blue-600 text-white" : "bg-gray-100"
                }`}
              >
                Facebook
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("instagram")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                  previewTab === "instagram" ? "bg-pink-600 text-white" : "bg-gray-100"
                }`}
              >
                Instagram
              </button>
            </div>
            <pre className="flex-1 overflow-y-auto m-5 p-4 text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 rounded-xl leading-relaxed font-sans">
              {previewTab === "facebook" ? previewData.preview.facebook : previewData.preview.instagram}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
