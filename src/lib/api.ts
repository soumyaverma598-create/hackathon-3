/**
 * api.ts — unified API client
 *
 * Set USE_MOCK = false (or NEXT_PUBLIC_USE_MOCK=false in .env.local)
 * when Dev-2's backend at http://localhost:3002 is ready.
 */

import { AdminCreateUserInput, AdminUpdateUserInput, User } from '@/types/auth';
import {
  WorkflowApplication,
  WorkflowStatus,
  EDSQuery,
  GistContent,
  Notification,
} from '@/types/workflow';
import {
  AdminSettings,
  AdminSettingsSection,
  AdminSettingsSections,
} from '@/types/settings';
import * as mock from './mockApi';

// ──────────────────────────────────────────────────────────────────────────────
// Feature flag — use real backend; set NEXT_PUBLIC_USE_MOCK=true for mock
// ──────────────────────────────────────────────────────────────────────────────
export const USE_MOCK = true;

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

// ──────────────────────────────────────────────────────────────────────────────
// Core fetch wrapper
// ──────────────────────────────────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('auth-token')
      : null;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  const json = await res.json();
  // Unwrap the standard { success, data } envelope
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data as T;
  }
  return json as T;
}

// Helper to unwrap mock responses (they return ApiResponse<T>)
async function fromMock<T>(
  promise: Promise<{ success: true; data: T } | { success: false; error: string }>
): Promise<T> {
  const res = await promise;
  if (!res.success) throw new Error(res.error);
  return res.data;
}

// ──────────────────────────────────────────────────────────────────────────────
// AUTH
// ──────────────────────────────────────────────────────────────────────────────

export async function loginUser(
  email: string,
  password: string
): Promise<{ token: string; user: User }> {
  if (USE_MOCK) {
    // TODO: remove mock fallback once /auth/login is live
    return fromMock(mock.mockLoginUser(email, password));
  }
  return apiFetch<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getCurrentUser(): Promise<User> {
  if (USE_MOCK) {
    // TODO: remove mock fallback once /auth/me is live
    const token = localStorage.getItem('auth-token') ?? '';
    return fromMock(mock.mockGetCurrentUser(token));
  }
  return apiFetch<User>('/auth/me');
}

export async function fetchUsers(): Promise<User[]> {
  if (USE_MOCK) {
    return fromMock(mock.mockFetchUsers());
  }
  return apiFetch<User[]>('/admin/users');
}

export async function createUser(payload: AdminCreateUserInput): Promise<User> {
  if (USE_MOCK) {
    return fromMock(mock.mockCreateUser(payload));
  }
  return apiFetch<User>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateUser(
  userId: string,
  payload: AdminUpdateUserInput
): Promise<User> {
  if (USE_MOCK) {
    return fromMock(mock.mockUpdateUser(userId, payload));
  }
  return apiFetch<User>(`/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// APPLICATIONS
// ──────────────────────────────────────────────────────────────────────────────

export async function fetchAllApplications(): Promise<WorkflowApplication[]> {
  if (USE_MOCK) {
    // TODO: remove mock fallback once GET /applications is live
    return fromMock(mock.mockFetchAllApplications());
  }
  return apiFetch<WorkflowApplication[]>('/applications');
}

export async function fetchMyApplications(
  email: string
): Promise<WorkflowApplication[]> {
  if (USE_MOCK) {
    // TODO: remove mock fallback once GET /applications?proponent= is live
    return fromMock(mock.mockFetchMyApplications(email));
  }
  return apiFetch<WorkflowApplication[]>('/applications');
}

export async function fetchApplicationById(
  id: string
): Promise<WorkflowApplication> {
  if (USE_MOCK) {
    // TODO: remove mock fallback once GET /applications/:id is live
    return fromMock(mock.mockFetchApplicationById(id));
  }
  return apiFetch<WorkflowApplication>(`/applications/${id}`);
}

export async function createApplication(
  data: Partial<WorkflowApplication>
): Promise<WorkflowApplication> {
  if (USE_MOCK) {
    // TODO: remove mock fallback once POST /applications is live
    return fromMock(mock.mockCreateApplication(data));
  }
  return apiFetch<WorkflowApplication>('/applications', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateApplicationStatus(
  id: string,
  status: WorkflowStatus,
  remarks?: string
): Promise<WorkflowApplication> {
  if (USE_MOCK) {
    // TODO: remove mock fallback once PUT /applications/:id/status is live
    return fromMock(mock.mockUpdateApplicationStatus(id, status, remarks));
  }
  return apiFetch<WorkflowApplication>(`/applications/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, remarks }),
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// DOCUMENTS
// ──────────────────────────────────────────────────────────────────────────────

export async function uploadDocuments(
  id: string,
  formData: FormData
): Promise<WorkflowApplication> {
  if (USE_MOCK) {
    // TODO: remove mock fallback once POST /applications/:id/documents is live
    return fromMock(mock.mockUploadDocuments(id, formData));
  }
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('auth-token')
      : null;
  const res = await fetch(`${BASE_URL}/applications/${id}/documents`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Don't set Content-Type — browser sets multipart boundary automatically
    },
    body: formData,
  });
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return json.data as WorkflowApplication;
}

export async function getDocuments(
  id: string
): Promise<WorkflowApplication['documents']> {
  if (USE_MOCK) {
    // TODO: remove mock fallback once GET /applications/:id/documents is live
    return fromMock(mock.mockGetDocuments(id));
  }
  return apiFetch<WorkflowApplication['documents']>(
    `/applications/${id}/documents`
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// PAYMENT
// ──────────────────────────────────────────────────────────────────────────────

export async function submitPayment(
  id: string,
  paymentData: { amount: number; transactionId: string }
): Promise<WorkflowApplication> {
  if (USE_MOCK) {
    // TODO: remove mock fallback once POST /applications/:id/payment is live
    return fromMock(mock.mockSubmitPayment(id, paymentData));
  }
  return apiFetch(`/applications/${id}/payment`, {
    method: 'POST',
    body: JSON.stringify({ amount: paymentData.amount, paymentMethod: 'online' }),
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// EDS
// ──────────────────────────────────────────────────────────────────────────────

export async function getEDSQueries(id: string): Promise<EDSQuery[]> {
  if (USE_MOCK) {
    // TODO: remove mock fallback once GET /applications/:id/eds is live
    return fromMock(mock.mockGetEDSQueries(id));
  }
  return apiFetch<EDSQuery[]>(`/applications/${id}/eds`);
}

export async function raiseEDSQuery(
  id: string,
  queryData: { subject: string; description: string; raisedBy: string }
): Promise<EDSQuery> {
  if (USE_MOCK) {
    // TODO: remove mock fallback once POST /applications/:id/eds is live
    return fromMock(mock.mockRaiseEDSQuery(id, queryData));
  }
  return apiFetch<EDSQuery>(`/applications/${id}/eds`, {
    method: 'POST',
    body: JSON.stringify(queryData),
  });
}

export async function respondToEDS(
  id: string,
  queryId: string,
  data: { response: string }
): Promise<EDSQuery> {
  if (USE_MOCK) {
    // TODO: remove mock fallback once PUT /applications/:id/eds/:queryId is live
    return fromMock(mock.mockRespondToEDS(id, queryId, data));
  }
  return apiFetch<EDSQuery>(`/applications/${id}/eds/${queryId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function closeEDSQuery(
  id: string,
  queryId: string
): Promise<EDSQuery> {
  if (USE_MOCK) {
    // TODO: remove mock fallback once PUT /applications/:id/eds/:queryId/close is live
    return fromMock(mock.mockCloseEDSQuery(id, queryId));
  }
  return apiFetch<EDSQuery>(`/applications/${id}/eds/${queryId}/close`, {
    method: 'PUT',
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// GIST
// ──────────────────────────────────────────────────────────────────────────────

export async function generateGist(id: string): Promise<GistContent> {
  if (USE_MOCK) {
    // TODO: remove mock fallback once POST /applications/:id/gist is live
    return fromMock(mock.mockGenerateGist(id));
  }
  return apiFetch<GistContent>(`/applications/${id}/gist`, {
    method: 'POST',
  });
}

export async function getGist(id: string): Promise<GistContent | null> {
  if (USE_MOCK) {
    // TODO: remove mock fallback once GET /applications/:id/gist is live
    return fromMock(mock.mockGetGist(id));
  }
  return apiFetch<GistContent | null>(`/applications/${id}/gist`);
}

// ──────────────────────────────────────────────────────────────────────────────
// MoM
// ──────────────────────────────────────────────────────────────────────────────

export async function getMom(
  id: string
): Promise<{ momContent: string; meetingDate?: string; meetingNumber?: string }> {
  if (USE_MOCK) {
    // TODO: remove mock fallback once GET /applications/:id/mom is live
    return fromMock(mock.mockGetMom(id));
  }
  return apiFetch(`/applications/${id}/mom`);
}

export async function editMom(
  id: string,
  momData: { momContent: string; meetingDate?: string; meetingNumber?: string }
): Promise<WorkflowApplication> {
  if (USE_MOCK) {
    // TODO: remove mock fallback once PUT /applications/:id/mom is live
    return fromMock(mock.mockEditMom(id, momData));
  }
  return apiFetch<WorkflowApplication>(`/applications/${id}/mom`, {
    method: 'PUT',
    body: JSON.stringify(momData),
  });
}

export async function generateMomDoc(
  id: string
): Promise<{ message: string; url?: string }> {
  if (USE_MOCK) {
    return fromMock(mock.mockGenerateMomDoc(id));
  }
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
  const res = await fetch(`${BASE_URL}/applications/${id}/mom/generate`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }
  if (!res.ok) throw new Error(await res.text());
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/pdf') || contentType.includes('application/octet-stream')) {
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    return { message: 'MoM document generated.', url };
  }
  const json = await res.json();
  return json.data ?? { message: 'MoM document generated.' };
}

export async function finalizeMom(
  id: string
): Promise<WorkflowApplication> {
  if (USE_MOCK) {
    // TODO: remove mock fallback once POST /applications/:id/mom/finalize is live
    return fromMock(mock.mockFinalizeMom(id));
  }
  return apiFetch<WorkflowApplication>(`/applications/${id}/mom/finalize`, {
    method: 'POST',
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// EC CERTIFICATE
// ──────────────────────────────────────────────────────────────────────────────

export async function downloadCertificate(
  id: string
): Promise<{ url: string; filename: string }> {
  if (USE_MOCK) {
    return fromMock(mock.mockDownloadCertificate(id));
  }
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
  const res = await fetch(`${BASE_URL}/applications/${id}/certificate`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }
  if (!res.ok) throw new Error(await res.text());
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  return { url, filename: `EC_Certificate_${id}.pdf` };
}

// ──────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ──────────────────────────────────────────────────────────────────────────────

export async function fetchNotifications(userId: string): Promise<Notification[]> {
  if (USE_MOCK) {
    // TODO: remove mock fallback once GET /notifications is live
    return fromMock(mock.mockFetchNotifications(userId));
  }
  return apiFetch<Notification[]>('/notifications');
}

export async function markNotificationRead(
  notifId: string
): Promise<{ id: string }> {
  if (USE_MOCK) {
    // TODO: remove mock fallback once PUT /notifications/:id/read is live
    return fromMock(mock.mockMarkNotificationRead(notifId));
  }
  return apiFetch<{ id: string }>(`/notifications/${notifId}/read`, {
    method: 'PUT',
  });
}

export async function markAllNotificationsRead(
  userId: string
): Promise<{ count: number }> {
  if (USE_MOCK) {
    // TODO: remove mock fallback once PUT /notifications/read-all is live
    return fromMock(mock.mockMarkAllNotificationsRead(userId));
  }
  return apiFetch<{ count: number }>('/notifications/read-all', {
    method: 'PUT',
    body: JSON.stringify({ userId }),
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN SETTINGS
// ──────────────────────────────────────────────────────────────────────────────

async function internalApiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  const json = await res.json();
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data as T;
  }
  return json as T;
}

export async function fetchAdminSettings(): Promise<AdminSettings> {
  return internalApiFetch<AdminSettings>('/api/admin/settings');
}

export async function updateAdminSettingsSection<T extends AdminSettingsSection>(
  section: T,
  payload: Partial<AdminSettingsSections[T]>
): Promise<AdminSettingsSections[T]> {
  return internalApiFetch<AdminSettingsSections[T]>(`/api/admin/settings/${section}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// RBAC ACCESS CONTROL
// ──────────────────────────────────────────────────────────────────────────────

/** Grant a scrutiny/MoM user explicit login access (adds them to the approved set). */
export async function approveRestrictedAccess(
  userId: string
): Promise<{ approved: boolean }> {
  if (USE_MOCK) {
    return fromMock(mock.mockApproveRestrictedAccess(userId));
  }
  return apiFetch<{ approved: boolean }>(`/users/${userId}/approve-restricted`, {
    method: 'POST',
  });
}

/** Push an alert notification to all admin accounts. */
export async function pushAdminAlert(
  title: string,
  message: string
): Promise<{ pushed: number }> {
  if (USE_MOCK) {
    return fromMock(mock.mockPushAdminAlert(title, message));
  }
  return apiFetch<{ pushed: number }>('/notifications/admin-alert', {
    method: 'POST',
    body: JSON.stringify({ title, message }),
  });
}
