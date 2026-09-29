// FinEdge Admin API Service — connects React frontend to Spring Boot backend

const API_BASE = 'http://localhost:8080/admin-api';

// ---------- Token Management ----------
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('finedge_admin_token');
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('finedge_admin_refresh');
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('finedge_admin_token', accessToken);
  localStorage.setItem('finedge_admin_refresh', refreshToken);
  localStorage.setItem('adminToken', accessToken); // backward compat
}

export function clearTokens() {
  localStorage.removeItem('finedge_admin_token');
  localStorage.removeItem('finedge_admin_refresh');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('finedge_admin_user');
}

export function getStoredUser(): { username: string; roles: string[] } | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('finedge_admin_user');
  return raw ? JSON.parse(raw) : null;
}

// ---------- Authenticated Fetch Wrapper ----------
async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  
  // If 401/403, clear tokens (session expired)
  if (res.status === 401 || res.status === 403) {
    clearTokens();
  }
  
  return res;
}

// ---------- Auth API ----------
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  username: string;
  roles: string[];
  requires2fa: boolean;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Login failed');
  }
  
  const data: LoginResponse = await res.json();
  setTokens(data.accessToken, data.refreshToken);
  localStorage.setItem('finedge_admin_user', JSON.stringify({ username: data.username, roles: data.roles }));
  return data;
}

export function logout() {
  clearTokens();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// ---------- Users API ----------
export async function getUsers(page = 0, size = 10) {
  const res = await apiFetch(`/admin/users?page=${page}&size=${size}`);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function getUserById(id: string) {
  const res = await apiFetch(`/admin/users/${id}`);
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

export async function updateUserStatus(id: string, status: string, reason: string) {
  const res = await apiFetch(`/admin/users/${id}/status?status=${status}&reason=${encodeURIComponent(reason)}`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Failed to update user status');
  return res.json();
}

// ---------- Transactions API ----------
export async function getTransactions(page = 0, size = 10) {
  const res = await apiFetch(`/admin/transactions?page=${page}&size=${size}`);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

export async function getTransactionById(id: string) {
  const res = await apiFetch(`/admin/transactions/${id}`);
  if (!res.ok) throw new Error('Failed to fetch transaction');
  return res.json();
}

export async function flagTransaction(id: string) {
  const res = await apiFetch(`/admin/transactions/${id}/flag`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to flag transaction');
  return res.json();
}

export async function blockTransaction(id: string) {
  const res = await apiFetch(`/admin/transactions/${id}/block`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to block transaction');
  return res.json();
}

// ---------- Settings API ----------
export async function getSettings(category: string) {
  const res = await apiFetch(`/admin/settings/${category}`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateSetting(key: string, value: string, category: string) {
  const res = await apiFetch(`/admin/settings`, {
    method: 'PATCH',
    body: JSON.stringify({ key, value, category }),
  });
  if (!res.ok) throw new Error('Failed to update setting');
  return res.json();
}

// ---------- Reports API ----------
export async function exportTransactionsCsv(startDate?: string, endDate?: string, status?: string): Promise<{ blob: Blob; filename: string }> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (status) params.append('status', status);
  
  const res = await apiFetch(`/admin/reports/transactions/export?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to export report');
  
  const blob = await res.blob();
  const disposition = res.headers.get('content-disposition');
  const filename = disposition?.match(/filename="(.+)"/)?.[1] || `report_${new Date().toISOString().slice(0, 10)}.csv`;
  
  return { blob, filename };
}

// ---------- Health Check ----------
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/admin/auth/login`, { method: 'OPTIONS' });
    return res.ok || res.status === 403 || res.status === 405;
  } catch {
    return false;
  }
}
