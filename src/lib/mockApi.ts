/**
 * mockApi.ts — in-memory API simulation
 * All functions return the same shape as the real backend contract:
 * { success: true, data: T } | { success: false, error: string }
 */

import {
  MOCK_USERS,
  MOCK_PASSWORDS,
  MOCK_APPLICATIONS,
  MOCK_NOTIFICATIONS,
} from './mockData';
import { User } from '@/types/auth';
import {
  WorkflowApplication,
  WorkflowStatus,
  EDSQuery,
  GistContent,
  Notification,
} from '@/types/workflow';

// Mutable in-memory state
let users = [...MOCK_USERS];
let applications = [...MOCK_APPLICATIONS];
let notifications = [...MOCK_NOTIFICATIONS];

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

// ─── Auth ───────────────────────────────────────────────────────────────────

export async function mockLoginUser(
  email: string,
  password: string
): Promise<ApiResponse<{ token: string; user: User }>> {
  await delay();
  const user = users.find((u) => u.email === email);
  if (!user || MOCK_PASSWORDS[email] !== password) {
    return { success: false, error: 'Invalid email or password.' };
  }
  // Mock JWT — base64 encoded user id
  const token = `mock-jwt-${btoa(user.id + ':' + Date.now())}`;
  return { success: true, data: { token, user } };
}

export async function mockGetCurrentUser(token: string): Promise<ApiResponse<User>> {
  await delay();
  // Extract user id from mock token: mock-jwt-<base64(id:ts)>
  try {
    const payload = atob(token.replace('mock-jwt-', ''));
    const userId = payload.split(':')[0];
    const user = users.find((u) => u.id === userId);
    if (!user) return { success: false, error: 'User not found.' };
    return { success: true, data: user };
  } catch {
    return { success: false, error: 'Invalid token.' };
  }
}

// ─── Applications ────────────────────────────────────────────────────────────

export async function mockFetchAllApplications(): Promise<ApiResponse<WorkflowApplication[]>> {
  await delay();
  return { success: true, data: [...applications] };
}

export async function mockFetchMyApplications(
  email: string
): Promise<ApiResponse<WorkflowApplication[]>> {
  await delay();
  const result = applications.filter((a) => a.proponentEmail === email);
  return { success: true, data: result };
}

export async function mockFetchApplicationById(
  id: string
): Promise<ApiResponse<WorkflowApplication>> {
  await delay();
  const app = applications.find((a) => a.id === id);
  if (!app) return { success: false, error: 'Application not found.' };
  return { success: true, data: { ...app } };
}

export async function mockCreateApplication(
  data: Partial<WorkflowApplication>
): Promise<ApiResponse<WorkflowApplication>> {
  await delay();
  const id = `app${Date.now()}`;
  const now = new Date().toISOString();
  const count = applications.length + 1;
  const newApp: WorkflowApplication = {
    id,
    applicationNumber: `MoEFCC/EC/2026/${String(count).padStart(5, '0')}`,
    projectName: data.projectName ?? '',
    proponentName: data.proponentName ?? '',
    proponentEmail: data.proponentEmail ?? '',
    proponentPhone: data.proponentPhone ?? '',
    projectCategory: data.projectCategory ?? 'B1',
    projectSector: data.projectSector ?? '',
    stateUT: data.stateUT ?? '',
    district: data.district ?? '',
    projectCost: data.projectCost ?? 0,
    projectArea: data.projectArea ?? 0,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    edsQueries: [],
    paymentStatus: 'pending',
    documents: [],
  };
  applications = [...applications, newApp];
  return { success: true, data: newApp };
}

export async function mockUpdateApplicationStatus(
  id: string,
  status: WorkflowStatus,
  remarks?: string
): Promise<ApiResponse<WorkflowApplication>> {
  await delay();
  const idx = applications.findIndex((a) => a.id === id);
  if (idx === -1) return { success: false, error: 'Application not found.' };
  const now = new Date().toISOString();
  const updated: WorkflowApplication = {
    ...applications[idx],
    status,
    updatedAt: now,
    ...(remarks ? { remarks } : {}),
    ...(status === 'submitted' ? { submittedAt: now } : {}),
    ...(status === 'finalized' ? { finalizedAt: now } : {}),
  };
  applications = applications.map((a) => (a.id === id ? updated : a));
  return { success: true, data: updated };
}

// ─── Documents ───────────────────────────────────────────────────────────────

export async function mockUploadDocuments(
  id: string,
  _formData: FormData
): Promise<ApiResponse<WorkflowApplication>> {
  await delay(600);
  const idx = applications.findIndex((a) => a.id === id);
  if (idx === -1) return { success: false, error: 'Application not found.' };
  const now = new Date().toISOString();
  const newDoc = {
    id: `doc${Date.now()}`,
    name: 'Uploaded_Document.pdf',
    type: 'application/pdf',
    size: 1024000,
    url: '#',
    uploadedAt: now,
    uploadedBy: applications[idx].proponentEmail,
  };
  const updated = {
    ...applications[idx],
    documents: [...applications[idx].documents, newDoc],
    updatedAt: now,
  };
  applications = applications.map((a) => (a.id === id ? updated : a));
  return { success: true, data: updated };
}

export async function mockGetDocuments(
  id: string
): Promise<ApiResponse<WorkflowApplication['documents']>> {
  await delay();
  const app = applications.find((a) => a.id === id);
  if (!app) return { success: false, error: 'Application not found.' };
  return { success: true, data: app.documents };
}

// ─── Payment ────────────────────────────────────────────────────────────────

export async function mockSubmitPayment(
  id: string,
  paymentData: { amount: number; transactionId: string }
): Promise<ApiResponse<WorkflowApplication>> {
  await delay(500);
  const idx = applications.findIndex((a) => a.id === id);
  if (idx === -1) return { success: false, error: 'Application not found.' };
  const updated = {
    ...applications[idx],
    paymentStatus: 'paid' as const,
    paymentAmount: paymentData.amount,
    paymentTransactionId: paymentData.transactionId,
    updatedAt: new Date().toISOString(),
  };
  applications = applications.map((a) => (a.id === id ? updated : a));
  return { success: true, data: updated };
}

// ─── EDS ─────────────────────────────────────────────────────────────────────

export async function mockGetEDSQueries(
  id: string
): Promise<ApiResponse<EDSQuery[]>> {
  await delay();
  const app = applications.find((a) => a.id === id);
  if (!app) return { success: false, error: 'Application not found.' };
  return { success: true, data: app.edsQueries };
}

export async function mockRaiseEDSQuery(
  id: string,
  queryData: { subject: string; description: string; raisedBy: string }
): Promise<ApiResponse<EDSQuery>> {
  await delay();
  const idx = applications.findIndex((a) => a.id === id);
  if (idx === -1) return { success: false, error: 'Application not found.' };
  const app = applications[idx];
  const qNum = `EDS-${String(app.edsQueries.length + 1).padStart(3, '0')}`;
  const newQuery: EDSQuery = {
    id: `eds${Date.now()}`,
    queryNumber: qNum,
    subject: queryData.subject,
    description: queryData.description,
    raisedAt: new Date().toISOString(),
    raisedBy: queryData.raisedBy,
    status: 'open',
  };
  const updated = {
    ...app,
    edsQueries: [...app.edsQueries, newQuery],
    status: 'eds_raised' as WorkflowStatus,
    updatedAt: new Date().toISOString(),
  };
  applications = applications.map((a) => (a.id === id ? updated : a));
  return { success: true, data: newQuery };
}

export async function mockRespondToEDS(
  id: string,
  queryId: string,
  data: { response: string }
): Promise<ApiResponse<EDSQuery>> {
  await delay();
  const idx = applications.findIndex((a) => a.id === id);
  if (idx === -1) return { success: false, error: 'Application not found.' };
  const app = applications[idx];
  const qIdx = app.edsQueries.findIndex((q) => q.id === queryId);
  if (qIdx === -1) return { success: false, error: 'Query not found.' };
  const updatedQuery: EDSQuery = {
    ...app.edsQueries[qIdx],
    response: data.response,
    respondedAt: new Date().toISOString(),
    status: 'responded',
  };
  const updatedQueries = app.edsQueries.map((q) =>
    q.id === queryId ? updatedQuery : q
  );
  const updatedApp = {
    ...app,
    edsQueries: updatedQueries,
    updatedAt: new Date().toISOString(),
  };
  applications = applications.map((a) => (a.id === id ? updatedApp : a));
  return { success: true, data: updatedQuery };
}

export async function mockCloseEDSQuery(
  id: string,
  queryId: string
): Promise<ApiResponse<EDSQuery>> {
  await delay();
  const idx = applications.findIndex((a) => a.id === id);
  if (idx === -1) return { success: false, error: 'Application not found.' };
  const app = applications[idx];
  const qIdx = app.edsQueries.findIndex((q) => q.id === queryId);
  if (qIdx === -1) return { success: false, error: 'Query not found.' };
  const updatedQuery: EDSQuery = { ...app.edsQueries[qIdx], status: 'closed' };
  const updatedQueries = app.edsQueries.map((q) =>
    q.id === queryId ? updatedQuery : q
  );
  applications = applications.map((a) =>
    a.id === id ? { ...app, edsQueries: updatedQueries } : a
  );
  return { success: true, data: updatedQuery };
}

// ─── Gist ────────────────────────────────────────────────────────────────────

export async function mockGenerateGist(id: string): Promise<ApiResponse<GistContent>> {
  await delay(800);
  const idx = applications.findIndex((a) => a.id === id);
  if (idx === -1) return { success: false, error: 'Application not found.' };
  const app = applications[idx];
  const now = new Date().toISOString();
  const gist: GistContent = {
    id: `gist${Date.now()}`,
    applicationId: id,
    projectBackground: `${app.projectName} is a ${app.projectCategory} category project in the ${app.projectSector} sector located in ${app.district}, ${app.stateUT}.`,
    proposalDetails: `Project cost: ₹${(app.projectCost / 10000000).toFixed(2)} Cr. Project area: ${app.projectArea} hectares. Proponent: ${app.proponentName}.`,
    environmentalImpact:
      'Detailed Environmental Impact Assessment has been carried out as per EIA Notification 2006.',
    mitigationMeasures:
      'Standard mitigation measures as per sector-specific guidelines of MoEFCC shall be adopted.',
    recommendation: 'Project is recommended for consideration of grant of Environmental Clearance.',
    generatedAt: now,
    isLocked: false,
  };
  const updated = { ...app, gist, updatedAt: now };
  applications = applications.map((a) => (a.id === id ? updated : a));
  return { success: true, data: gist };
}

export async function mockGetGist(id: string): Promise<ApiResponse<GistContent | null>> {
  await delay();
  const app = applications.find((a) => a.id === id);
  if (!app) return { success: false, error: 'Application not found.' };
  return { success: true, data: app.gist ?? null };
}

// ─── MoM ─────────────────────────────────────────────────────────────────────

export async function mockGetMom(
  id: string
): Promise<ApiResponse<{ momContent: string; meetingDate?: string; meetingNumber?: string }>> {
  await delay();
  const app = applications.find((a) => a.id === id);
  if (!app) return { success: false, error: 'Application not found.' };
  return {
    success: true,
    data: {
      momContent: app.momContent ?? '',
      meetingDate: app.meetingDate,
      meetingNumber: app.meetingNumber,
    },
  };
}

export async function mockEditMom(
  id: string,
  momData: { momContent: string; meetingDate?: string; meetingNumber?: string }
): Promise<ApiResponse<WorkflowApplication>> {
  await delay();
  const idx = applications.findIndex((a) => a.id === id);
  if (idx === -1) return { success: false, error: 'Application not found.' };
  const updated = {
    ...applications[idx],
    ...momData,
    status: 'mom_draft' as WorkflowStatus,
    updatedAt: new Date().toISOString(),
  };
  applications = applications.map((a) => (a.id === id ? updated : a));
  return { success: true, data: updated };
}

export async function mockGenerateMomDoc(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  await delay(1000);
  const app = applications.find((a) => a.id === id);
  if (!app) return { success: false, error: 'Application not found.' };
  return { success: true, data: { message: 'MoM document generated successfully.' } };
}

export async function mockFinalizeMom(id: string): Promise<ApiResponse<WorkflowApplication>> {
  await delay(500);
  return mockUpdateApplicationStatus(id, 'finalized', 'EC Certificate issued.');
}

// ─── EC Certificate ──────────────────────────────────────────────────────────

export async function mockDownloadCertificate(
  id: string
): Promise<ApiResponse<{ url: string; filename: string }>> {
  await delay(400);
  const app = applications.find((a) => a.id === id);
  if (!app) return { success: false, error: 'Application not found.' };
  if (app.status !== 'finalized') {
    return { success: false, error: 'Certificate is only available after finalization.' };
  }
  return {
    success: true,
    data: {
      url: `#`,
      filename: `EC_Certificate_${app.applicationNumber.replace(/\//g, '_')}.pdf`,
    },
  };
}

// ─── Notifications ───────────────────────────────────────────────────────────

export async function mockFetchNotifications(
  userId: string
): Promise<ApiResponse<Notification[]>> {
  await delay();
  const userNotifs = notifications.filter((n) => n.userId === userId);
  return { success: true, data: userNotifs };
}

export async function mockMarkNotificationRead(
  notifId: string
): Promise<ApiResponse<{ id: string }>> {
  await delay();
  notifications = notifications.map((n) =>
    n.id === notifId ? { ...n, isRead: true } : n
  );
  return { success: true, data: { id: notifId } };
}

export async function mockMarkAllNotificationsRead(
  userId: string
): Promise<ApiResponse<{ count: number }>> {
  await delay();
  let count = 0;
  notifications = notifications.map((n) => {
    if (n.userId === userId && !n.isRead) {
      count++;
      return { ...n, isRead: true };
    }
    return n;
  });
  return { success: true, data: { count } };
}
