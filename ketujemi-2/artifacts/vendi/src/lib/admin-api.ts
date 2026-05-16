const BASE = "/api/admin";

function getToken(): string {
  return sessionStorage.getItem("admin_token") ?? "";
}

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { ...authHeaders(), ...(opts.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function adminLogin(username: string, password: string): Promise<string> {
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Invalid credentials");
  const { token } = await res.json();
  sessionStorage.setItem("admin_token", token);
  return token;
}

export function adminLogout() {
  sessionStorage.removeItem("admin_token");
}

export function isAdminLoggedIn(): boolean {
  return !!sessionStorage.getItem("admin_token");
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
  return request<AdminUser[]>("/users");
}

export function getUserListings(phone: string) {
  return request<AdminListing[]>(`/users/${encodeURIComponent(phone)}/listings`);
}

export function getAdminCategories() {
  return request<AdminCategory[]>("/categories");
}

export function createAdminCategory(data: { name: string; slug?: string; icon?: string; parent_id?: number }) {
  return request<AdminCategory>("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateAdminCategory(id: number, data: { name?: string; slug?: string; icon?: string }) {
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

export interface AdminDashboard {
  total_listings: number;
  total_users: number;
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

export interface AdminUser {
  seller_phone: string;
  seller_name: string;
  listing_count: number;
  last_active: string;
}

export interface AdminCategory {
  id: number;
  name: string;
  slug?: string | null;
  icon: string;
  parent_id?: number | null;
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
