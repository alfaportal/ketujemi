import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
const BASE = "/api/admin";
const SESSION_KEY = "admin_token";
const REMEMBER_KEY = "admin_token_remember";
const REMEMBER_EXP_KEY = "admin_token_expires";

function readStoredToken(): string {
  const remembered = localStorage.getItem(REMEMBER_KEY);
  const rememberedExp = localStorage.getItem(REMEMBER_EXP_KEY);
  if (remembered && rememberedExp) {
    const exp = Date.parse(rememberedExp);
    if (Number.isFinite(exp) && Date.now() < exp) return remembered;
    localStorage.removeItem(REMEMBER_KEY);
    localStorage.removeItem(REMEMBER_EXP_KEY);
  }
  return sessionStorage.getItem(SESSION_KEY) ?? "";
}

function persistToken(token: string, expiresAt: string, rememberMe: boolean): void {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(REMEMBER_KEY);
  localStorage.removeItem(REMEMBER_EXP_KEY);
  if (rememberMe) {
    localStorage.setItem(REMEMBER_KEY, token);
    localStorage.setItem(REMEMBER_EXP_KEY, expiresAt);
  } else {
    sessionStorage.setItem(SESSION_KEY, token);
  }
}

function getToken(): string {
  return readStoredToken();
}

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetchWithTimeout(`${BASE}${path}`, {
    ...opts,
    headers: { ...authHeaders(), ...(opts.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const errBody = body as { error?: string; message?: string };
    throw new Error(errBody.message ?? errBody.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function adminLoginEmailStart(): Promise<void> {
  const res = await fetchWithTimeout(`${BASE}/login/email/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? "EMAIL_SEND_FAILED");
  }
}

/** Admin panel: verify email code sent to EMAIL_ADMIN. */
export async function adminLoginEmailVerify(code: string, rememberMe = false): Promise<string> {
  const res = await fetchWithTimeout(`${BASE}/login/email/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, remember_me: rememberMe }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? "Invalid credentials");
  }
  const data = (await res.json()) as {
    token: string;
    expires_at: string;
    remember_me?: boolean;
  };
  persistToken(data.token, data.expires_at, rememberMe || !!data.remember_me);
  return data.token;
}

/** Legacy password login (kept for scripts). */
export async function adminLogin(password: string, rememberMe = false): Promise<string> {
  const res = await fetchWithTimeout(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, remember_me: rememberMe }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? "Invalid credentials");
  }
  const data = (await res.json()) as {
    token: string;
    expires_at: string;
    remember_me?: boolean;
  };
  persistToken(data.token, data.expires_at, rememberMe || !!data.remember_me);
  return data.token;
}

export function adminLogout() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(REMEMBER_KEY);
  localStorage.removeItem(REMEMBER_EXP_KEY);
}

export function isAdminLoggedIn(): boolean {
  return !!readStoredToken();
}

/** Bearer headers for admin-panel API calls from the public site (e.g. admin post form). */
export function adminAuthHeaders(): HeadersInit {
  const token = readStoredToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export function getDashboard() {
  return request<AdminDashboard>("/dashboard");
}

export function getAdminListings(params?: { search?: string; category_id?: number; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.category_id) qs.set("category_id", String(params.category_id));
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  return request<{ total: number; page: number; listings: AdminListing[] }>(`/listings?${qs}`);
}

export function createAdminListing(data: Partial<AdminListing> & Pick<AdminListing, "title" | "description" | "price" | "category_id" | "location" | "seller_name" | "seller_phone" | "condition">) {
  return request<AdminListing>("/listings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateAdminListing(id: number, data: Partial<AdminListing>) {
  return request<AdminListing>(`/listings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteAdminListing(id: number) {
  return request<{ success: boolean }>(`/listings/${id}`, { method: "DELETE" });
}

export function getAdminUsers() {
  return request<AdminSeller[]>("/users");
}

export function getRegisteredUsers() {
  return request<RegisteredUser[]>("/registered-users");
}

export function banRegisteredUser(id: number, reason?: string) {
  return request<{ id: number; banned_at: string | null }>(`/registered-users/${id}/ban`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function unbanRegisteredUser(id: number) {
  return request<{ id: number }>(`/registered-users/${id}/unban`, { method: "POST" });
}

export function deleteRegisteredUser(id: number) {
  return request<{ success: boolean }>(`/registered-users/${id}`, { method: "DELETE" });
}

export interface PartnerPaymentSummary {
  status: "none" | "pending" | "paid" | "partial";
  label: string;
  expected_eur: number;
  latest_amount_eur: number | null;
  latest_purpose: string | null;
  paid_at: string | null;
}

export interface AdminBusinessAccount {
  id: number;
  email: string | null;
  phone_e164_digits: string | null;
  business_name: string | null;
  business_tier: string | null;
  package_label?: string | null;
  business_status: string | null;
  partner_link_url: string | null;
  partner_link_type: string | null;
  partner_logo_url: string | null;
  partner_activation_code?: string | null;
  partner_activation_sent_at?: string | null;
  banned_at: string | null;
  vip_expires_at: string | null;
  is_vip_active: boolean;
  created_at: string;
  payment?: PartnerPaymentSummary | null;
}

export function getAdminBusinesses() {
  return request<AdminBusinessAccount[]>("/businesses");
}

export interface AdminPartnerApplication {
  id: number;
  user_id: number | null;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  iban: string;
  package: string;
  package_label: string;
  logo_url: string | null;
  link_url: string;
  link_type: string | null;
  status: string;
  payment_status: string;
  payment_label: string;
  rejected_reason: string | null;
  created_at: string;
  last_payment_at: string | null;
  suspended_at: string | null;
  accepted_terms: boolean;
  client_ip: string | null;
  category_ids?: number[];
}

export interface AdminPartnerApplicationsResponse {
  applications: AdminPartnerApplication[];
  stats: {
    pending: number;
    active: number;
    suspended: number;
    rejected: number;
  };
}

export function getAdminPartnerApplications() {
  return request<AdminPartnerApplicationsResponse>("/partner-applications");
}

export function rejectAdminPartner(id: number, reason: string) {
  return request<{ ok: boolean; id: number; status: string }>(`/partner-applications/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function suspendAdminPartner(id: number) {
  return request<{ ok: boolean; id: number; status: string }>(`/partner-applications/${id}/suspend`, {
    method: "POST",
  });
}

export function reactivateAdminPartner(id: number) {
  return request<{ ok: boolean; id: number; status: string }>(
    `/partner-applications/${id}/reactivate`,
    { method: "POST" },
  );
}

export interface AdminListingPackagePurchase {
  id: number;
  user_id: number;
  user_email: string | null;
  user_name: string | null;
  package: string;
  package_label: string;
  amount_eur: number;
  extra_slots: number;
  activation_code: string;
  status: string;
  purchased_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export function getAdminListingPackagePurchases(packageFilter?: "s" | "m" | "l") {
  const qs = packageFilter ? `?package=${packageFilter}` : "";
  return request<{
    purchases: AdminListingPackagePurchase[];
    revenue_month_eur: number;
    stats: { total: number; paid: number; by_package: { s: number; m: number; l: number } };
  }>(`/listing-package-purchases${qs}`);
}

export function changeAdminPartnerPackage(id: number, pkg: "standard" | "vip") {
  return request<{ ok: boolean; id: number; package: string; package_label: string }>(
    `/partner-applications/${id}/package`,
    { method: "PATCH", body: JSON.stringify({ package: pkg }) },
  );
}

export function updateAdminPartnerCategories(id: number, category_ids: number[]) {
  return request<{ ok: boolean; id: number; category_ids: number[] }>(
    `/partner-applications/${id}/categories`,
    { method: "PATCH", body: JSON.stringify({ category_ids }) },
  );
}

export type AdminPartnerProfileFields = {
  address?: string;
  facebook_url?: string;
  instagram_url?: string;
  whatsapp_number?: string;
  tiktok_url?: string;
  website_url?: string;
};

export interface AdminHomepagePartner extends AdminPartnerProfileFields {
  id: number;
  business_name: string;
  logo_url: string;
  link_url: string;
  tier: "vip" | "standard" | string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  category_ids?: number[];
}

export function getAdminHomepagePartners() {
  return request<{ partners: AdminHomepagePartner[] }>("/homepage-partners");
}

export function createAdminHomepagePartner(
  data: AdminPartnerProfileFields & {
    business_name: string;
    logo_url: string;
    link_url?: string;
    tier: "vip" | "standard";
    sort_order?: number;
    category_ids?: number[];
  },
) {
  return request<{ partner: AdminHomepagePartner }>("/homepage-partners", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateAdminHomepagePartner(
  id: number,
  data: AdminPartnerProfileFields & {
    business_name?: string;
    logo_url?: string;
    link_url?: string;
    tier?: "vip" | "standard";
    category_ids?: number[];
  },
) {
  return request<{ partner: AdminHomepagePartner }>(`/homepage-partners/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteAdminHomepagePartner(id: number) {
  return request<{ ok: boolean; id: number }>(`/homepage-partners/${id}`, {
    method: "DELETE",
  });
}

export function activateAdminBusiness(id: number) {
  return request<{
    id: number;
    business_status: string | null;
    partner_activation_code?: string;
    email_sent?: boolean;
    email_error?: string | null;
  }>(`/businesses/${id}/activate`, {
    method: "POST",
  });
}

export function deactivateAdminBusiness(id: number) {
  return request<{ id: number; business_status: string }>(`/businesses/${id}/deactivate`, {
    method: "POST",
  });
}

export function blockAdminBusiness(id: number, reason?: string) {
  return request<{ id: number; business_status: string }>(`/businesses/${id}/block`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function banSellerPhone(phone: string) {
  return request<{ success: boolean }>(`/sellers/${encodeURIComponent(phone)}/ban`, { method: "POST" });
}

export function unbanSellerPhone(phone: string) {
  return request<{ success: boolean }>(`/sellers/${encodeURIComponent(phone)}/unban`, { method: "POST" });
}

export function getUserListings(phone: string) {
  return request<AdminListing[]>(`/users/${encodeURIComponent(phone)}/listings`);
}

export function getAdminCategories() {
  return request<AdminCategory[]>("/categories");
}

export function createAdminCategory(data: {
  name: string;
  slug?: string;
  icon?: string;
  parent_id?: number;
  image_url?: string | null;
}) {
  return request<AdminCategory>("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateAdminCategory(
  id: number,
  data: { name?: string; slug?: string; icon?: string; image_url?: string | null },
) {
  return request<AdminCategory>(`/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteAdminCategory(id: number) {
  return request<{ success: boolean }>(`/categories/${id}`, { method: "DELETE" });
}

export function getAdminReports() {
  return request<AdminReport[]>("/reports");
}

export function updateAdminReport(id: number, status: string) {
  return request<AdminReport>(`/reports/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deleteAdminReport(id: number) {
  return request<{ success: boolean }>(`/reports/${id}`, { method: "DELETE" });
}

export function getAdminSettings() {
  return request<Record<string, string>>("/settings");
}

export function updateAdminSettings(data: Record<string, string>) {
  return request<Record<string, string>>("/settings", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function getModerationState() {
  return request<ModerationState>("/moderation");
}

export function updateModerationSettings(data: { enabled?: string; system_prompt?: string }) {
  return request<ModerationState>("/moderation", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function runModerationCommand(command: string, lang?: string) {
  return request<{ reply: string }>("/moderation/command", {
    method: "POST",
    body: JSON.stringify({ command, ...(lang ? { lang } : {}) }),
  });
}

export interface ModerationState {
  enabled: string;
  system_prompt: string;
  last_command: string;
  last_reply: string;
  last_run_at: string;
}

export interface AdminDashboard {
  total_listings: number;
  total_users: number;
  total_sellers?: number;
  total_categories: number;
  total_reports: number;
  new_today: number;
  per_category: { category_id: number; category_name: string; count: number }[];
  recent_listings: AdminListing[];
}

export interface AdminListing {
  id: number;
  title: string;
  description: string;
  price: number;
  category_id: number;
  category_name?: string | null;
  location: string;
  seller_name: string;
  seller_phone: string;
  condition: string;
  views: number;
  is_featured: boolean;
  image_url?: string | null;
  created_at: string;
  expires_at?: string | null;
}

export interface AdminSeller {
  seller_phone: string;
  seller_name: string;
  listing_count: number;
  last_active: string;
}

export interface RegisteredUser {
  id: number;
  email: string | null;
  phone_e164_digits: string | null;
  display_name: string | null;
  contact_phone: string | null;
  banned_at: string | null;
  ban_reason: string | null;
  created_at: string;
  listing_count: number;
}

export interface AdminCategory {
  id: number;
  name: string;
  slug?: string | null;
  icon: string;
  parent_id?: number | null;
  image_url?: string | null;
  listing_count?: number;
}

export interface AdminReport {
  id: number;
  listing_id: number;
  listing_title: string;
  reason: string;
  reporter_name: string;
  status: string;
  created_at: string;
}

export interface AdminShopApplication {
  id: number;
  user_id: number;
  shop_name: string;
  logo_url: string;
  description: string;
  category: string;
  category_id: number | null;
  directory_category_slug: string | null;
  directory_subcategory_slug: string | null;
  directory_category_id: number | null;
  directory_subcategory_id: number | null;
  country: string;
  city: string;
  region: string;
  address: string;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  whatsapp: string | null;
  website: string | null;
  contact_name: string;
  phone: string;
  email: string;
  status: string;
  shop_id: number | null;
  listing_count?: number;
  rejected_reason: string | null;
  admin_notes: string | null;
  created_at: string;
}

export function getAdminShopApplications() {
  return request<{
    applications: AdminShopApplication[];
    stats: { pending: number; approved: number; rejected: number };
  }>("/shop-applications");
}

export function approveAdminShopApplication(
  id: number,
  payload?: {
    directory_category_slug?: string;
    directory_subcategory_slug?: string;
    directory_category_id?: number;
    directory_subcategory_id?: number;
  },
) {
  return request<{ ok: boolean; shop_id: number }>(`/shop-applications/${id}/approve`, {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
}

export function rejectAdminShopApplication(id: number, reason?: string) {
  return request<{ ok: boolean }>(`/shop-applications/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason: reason ?? "" }),
  });
}

export function updateAdminShop(id: number, data: Record<string, unknown>) {
  return request<{ ok: boolean }>(`/shops/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function updateAdminShopApplication(id: number, data: Record<string, unknown>) {
  return request<{ ok: boolean }>(`/shop-applications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteAdminShop(id: number) {
  return request<{ ok: boolean }>(`/shops/${id}`, { method: "DELETE" });
}

export interface AdminSocialListing {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  seller_name: string;
  shop_name: string | null;
  category_name: string | null;
  image_urls: string[];
  fb_posted: boolean;
  ig_posted: boolean;
  status: string;
  moderation_status: string;
  skip_reason: string | null;
  queue: "pending_fb" | "pending_ig" | "done" | "ineligible";
  created_at: string;
}

export function getAdminSocialPostListings(params?: {
  search?: string;
  filter?: "all" | "pending_fb" | "pending_ig" | "posted";
  page?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.filter) qs.set("filter", params.filter);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  return request<{
    total: number;
    page: number;
    listings: AdminSocialListing[];
    configured: { facebook: boolean; instagram: boolean };
  }>(`/social-posts/listings?${qs}`);
}

export function previewAdminSocialPost(listingId: number) {
  return request<{
    listing: AdminSocialListing;
    preview: {
      facebook: string;
      instagram: string;
      theme: string;
      caption_source: string;
      market: string;
      primary_image: string | null;
    };
  }>("/social-posts/preview", {
    method: "POST",
    body: JSON.stringify({ listing_id: listingId }),
  });
}

export function runAdminFacebookScheduledPost() {
  return request<{
    ok: boolean;
    posted: boolean;
    listingId?: number;
    reason?: string;
    graphError?: string;
    graphStatus?: number;
  }>("/social/trigger-facebook-cron", {
    method: "POST",
    body: "{}",
  });
}

export function runAdminSocialScheduledPosts() {
  return request<{
    ok: boolean;
    facebook: {
      posted: boolean;
      listingId?: number;
      reason?: string;
      graphError?: string;
      graphStatus?: number;
    };
    instagram: {
      posted: boolean;
      listingId?: number;
      reason?: string;
      graphError?: string;
    };
  }>("/social/trigger-social-crons", {
    method: "POST",
    body: "{}",
  });
}

export function runAdminListingReel() {
  return request<{
    ok: boolean;
    posted: boolean;
    reelId?: number;
    listingIds?: number[];
    reason?: string;
    igMediaId?: string | null;
    tiktokPublishId?: string | null;
    videoUrl?: string;
    error?: string;
  }>("/social/trigger-listing-reel", {
    method: "POST",
    body: "{}",
  });
}

export function postAdminSocialListings(
  listingIds: number[],
  opts?: { facebook?: boolean; instagram?: boolean },
) {
  return request<{
    results: Array<{
      listing_id: number;
      ok?: boolean;
      error?: string;
      facebook?: { ok: boolean; post_id?: string | null; error?: string };
      instagram?: { ok: boolean; media_id?: string | null; error?: string };
    }>;
  }>("/social-posts/post", {
    method: "POST",
    body: JSON.stringify({
      listing_ids: listingIds,
      facebook: opts?.facebook !== false,
      instagram: opts?.instagram !== false,
    }),
  });
}

export type SocialFollowerPlatform = "instagram" | "facebook" | "tiktok";

export type AdminSocialFollowerRow = {
  id: number;
  platform: string;
  follower_username: string;
  follower_id: string | null;
  followed_at: string;
  unfollowed_at: string | null;
  is_active: boolean;
};

export type AdminSocialFollowersStats = Record<
  SocialFollowerPlatform,
  {
    active: number;
    unfollowed: number;
    unfollowed_this_month: number;
    api_count: number | null;
    api_synced_at: string | null;
  }
>;

export type SocialFollowersManualPlatform = "tiktok" | "facebook_personal";

export type AdminSocialFollowersManualStats = Record<
  SocialFollowersManualPlatform,
  { count: number | null; updated_at: string | null }
>;

export type AdminFollowersSyncResult = {
  instagram: {
    ok: boolean;
    platform: SocialFollowerPlatform;
    listSynced: boolean;
    totalCount: number | null;
    added: number;
    reactivated: number;
    unfollowed: number;
    message: string;
  };
  facebook: AdminFollowersSyncResult["instagram"];
  tiktok: AdminFollowersSyncResult["instagram"];
};

export function getAdminFollowersStats() {
  return request<{ stats: AdminSocialFollowersStats; manual: AdminSocialFollowersManualStats }>(
    "/followers/stats",
  );
}

export function saveAdminFollowersManualCount(
  platform: SocialFollowersManualPlatform,
  count: number,
) {
  return request<{
    ok: boolean;
    platform: SocialFollowersManualPlatform;
    count: number;
    updated_at: string;
  }>("/followers/manual-count", {
    method: "POST",
    body: JSON.stringify({ platform, count }),
  });
}

export function getAdminFollowersList(params?: {
  platform?: SocialFollowerPlatform | "all";
  status?: "active" | "unfollowed" | "all";
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.platform) qs.set("platform", params.platform);
  if (params?.status) qs.set("status", params.status);
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  return request<{
    total: number;
    page: number;
    limit: number;
    rows: AdminSocialFollowerRow[];
  }>(`/followers?${qs}`);
}

export function syncAdminFollowers() {
  return request<AdminFollowersSyncResult>("/followers/sync", {
    method: "POST",
    body: "{}",
  });
}

export type AdminShopSocialRow = {
  id: number;
  shop_id: number;
  shop_name: string;
  platform: string;
  handle: string;
  display_name: string | null;
  follower_count: number | null;
  link_valid: boolean;
  oauth_verified: boolean;
  fetch_status: string;
  fetched_at: string | null;
};

export function getAdminShopSocialEnrichments(params?: { page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  return request<{
    rows: AdminShopSocialRow[];
    total: number;
    page: number;
    limit: number;
  }>(`/shop-social-enrichments?${qs}`);
}

export function syncAdminShopSocialEnrichments() {
  return request<{ processed: number; errors: number; total: number }>(
    "/shop-social-enrichments/sync",
    { method: "POST", body: "{}" },
  );
}

export type AdminDeletionFeedbackRow = {
  id: number;
  user_id: number;
  entity_type: string;
  shop_id: number | null;
  shop_name: string | null;
  reason: string;
  reason_label: string;
  custom_text: string | null;
  additional_feedback: string | null;
  deleted_at: string;
};

export function getAdminDeletionFeedback(params?: { page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  return request<{
    rows: AdminDeletionFeedbackRow[];
    total: number;
    stats: Array<{ reason: string; reason_label: string; count: number }>;
  }>(`/deletion-feedback?${qs}`);
}

export function importAdminInstagramFollowers(data: unknown) {
  return request<{
    ok: boolean;
    parsed: number;
    added: number;
    reactivated: number;
    unfollowed: number;
  }>("/followers/import-instagram", {
    method: "POST",
    body: JSON.stringify({ data }),
  });
}

export async function downloadAdminFollowersCsv(params: {
  platform: SocialFollowerPlatform;
  status?: "active" | "unfollowed" | "all";
  from?: string;
  to?: string;
}): Promise<void> {
  const qs = new URLSearchParams();
  qs.set("platform", params.platform);
  if (params.status) qs.set("status", params.status);
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);

  const res = await fetchWithTimeout(`${BASE}/followers/export?${qs}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ketujemi-${params.platform}-followers.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export type AdminAnnouncementCampaign = {
  id: number;
  subject: string;
  recipient_count: number;
  recipient_mode: "all" | "selected";
  status: string;
  sent_by_admin_id: number | null;
  created_at: string;
};

export type AdminAnnouncementEligibleUser = {
  id: number;
  display_name: string | null;
  email: string;
};

export async function getAdminAnnouncementRecipientCount(): Promise<{ count: number }> {
  return request<{ count: number }>("/announcements/recipient-count");
}

export async function getAdminAnnouncementEligibleUsers(): Promise<{
  users: AdminAnnouncementEligibleUser[];
}> {
  return request<{ users: AdminAnnouncementEligibleUser[] }>("/announcements/recipients");
}

export async function getAdminAnnouncementCampaigns(): Promise<{
  campaigns: AdminAnnouncementCampaign[];
}> {
  return request<{ campaigns: AdminAnnouncementCampaign[] }>("/announcements/campaigns");
}

export async function sendAdminAnnouncement(payload: {
  subject: string;
  body: string;
  recipient_user_ids?: string[];
}): Promise<{
  ok: boolean;
  campaign_id: number;
  recipient_count: number;
  recipient_mode: "all" | "selected";
  status: string;
  message?: string;
}> {
  return request("/announcements/send", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
