'use client';

import Link from 'next/link';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Database, Settings, ShieldCheck } from 'lucide-react';
import GovHeader from '@/components/GovHeader';
import Sidebar from '@/components/Sidebar';
import { useAuthStore } from '@/store/authStore';
import { useAdminSettingsStore } from '@/store/adminSettingsStore';
import { AdminSettingsSection } from '@/types/settings';

const sectionContent = {
  security: {
    title: 'Security',
    description: 'Manage access controls and account safety across the admin portal.',
    icon: ShieldCheck,
  },
  notifications: {
    title: 'Notifications',
    description: 'Control how operational alerts and workflow updates are delivered.',
    icon: Bell,
  },
  'data-audit': {
    title: 'Data & Audit',
    description: 'Monitor records, retention policy, and traceability for system actions.',
    icon: Database,
  },
  'system-defaults': {
    title: 'System Defaults',
    description: 'Set the default admin experience and workflow behavior across the portal.',
    icon: Settings,
  },
} as const;

type SectionKey = keyof typeof sectionContent;

export default function AdminSettingsDetailPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const params = useParams<{ section: string }>();
  const section = params.section as SectionKey;
  const config = sectionContent[section];
  const { settings, isLoading, isSaving, error, fetchSettings, saveSection, clearError } = useAdminSettingsStore();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [securityForm, setSecurityForm] = useState({
    sessionTimeoutMinutes: 30,
    passwordRotationDays: 90,
    twoFactorRequired: true,
  });
  const [notificationForm, setNotificationForm] = useState({
    emailEnabled: true,
    smsEnabled: false,
    reminderHoursBeforeDeadline: 24,
  });
  const [dataAuditForm, setDataAuditForm] = useState({
    retentionDays: 365,
    exportFormat: 'pdf' as 'pdf' | 'xlsx' | 'csv',
    auditLoggingEnabled: true,
  });
  const [systemDefaultsForm, setSystemDefaultsForm] = useState({
    defaultLandingPage: 'dashboard' as 'dashboard' | 'users' | 'settings',
    defaultWorkflowStatus: 'submitted' as 'draft' | 'submitted' | 'under_scrutiny',
    recordsPerPage: 25,
  });

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role !== 'admin') {
      router.replace('/login');
      return;
    }

    if (!config) {
      router.replace('/admin/settings');
      return;
    }

    fetchSettings();
  }, [config, fetchSettings, router, user]);

  useEffect(() => {
    if (!settings) return;

    setSecurityForm(settings.security);
    setNotificationForm(settings.notifications);
    setDataAuditForm(settings['data-audit']);
    setSystemDefaultsForm(settings['system-defaults']);
  }, [settings]);

  useEffect(() => {
    if (!saveMessage) return;

    const timeout = window.setTimeout(() => setSaveMessage(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [saveMessage]);

  if (!user || user.role !== 'admin' || !config) return null;

  const Icon = config.icon;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();

    let payload;
    if (section === 'security') payload = securityForm;
    else if (section === 'notifications') payload = notificationForm;
    else if (section === 'data-audit') payload = dataAuditForm;
    else payload = systemDefaultsForm;

    await saveSection(section as AdminSettingsSection, payload);
    setSaveMessage('Changes saved successfully.');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <GovHeader />
      <div className="flex flex-1">
        <Sidebar role="admin" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#1a6b3c] hover:text-[#14522e] animate-gov-enter"
            >
              <ArrowLeft size={16} />
              Back to Settings
            </Link>

            <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 animate-gov-enter gov-surface-hover" style={{ animationDelay: '0.06s' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#1a6b3c]/10 flex items-center justify-center">
                  <Icon size={18} className="text-[#1a6b3c] animate-pulse-soft" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{config.title}</h2>
                  <p className="text-sm text-gray-500">{config.description}</p>
                </div>
              </div>

              {error ? (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 gov-notice">
                  {error}
                </div>
              ) : null}

              {saveMessage ? (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 gov-notice">
                  {saveMessage}
                </div>
              ) : null}

              {isLoading && !settings ? (
                <div className="mt-6 text-sm text-gray-500 animate-gov-enter">Loading settings...</div>
              ) : (
                <form className="mt-6 space-y-5 animate-gov-enter" style={{ animationDelay: '0.1s' }} onSubmit={handleSubmit}>
                  {section === 'security' ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="block">
                          <span className="mb-1 block text-sm font-medium text-gray-700">Session timeout (minutes)</span>
                          <input
                            type="number"
                            min={5}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1a6b3c]"
                            value={securityForm.sessionTimeoutMinutes}
                            onChange={(event) => setSecurityForm((previous) => ({ ...previous, sessionTimeoutMinutes: Number(event.target.value) }))}
                          />
                        </label>

                        <label className="block">
                          <span className="mb-1 block text-sm font-medium text-gray-700">Password rotation (days)</span>
                          <input
                            type="number"
                            min={30}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1a6b3c]"
                            value={securityForm.passwordRotationDays}
                            onChange={(event) => setSecurityForm((previous) => ({ ...previous, passwordRotationDays: Number(event.target.value) }))}
                          />
                        </label>
                      </div>

                      <label className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                        <span>
                          <span className="block text-sm font-medium text-gray-700">Require two-factor authentication</span>
                          <span className="block text-xs text-gray-500">Enforce 2FA for all administrator accounts.</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={securityForm.twoFactorRequired}
                          onChange={() =>
                            setSecurityForm((previous) => ({
                              ...previous,
                              twoFactorRequired: !previous.twoFactorRequired,
                            }))
                          }
                          className="h-4 w-4 rounded border-gray-300 text-[#1a6b3c] focus:ring-[#1a6b3c]"
                        />
                      </label>
                    </>
                  ) : null}

                  {section === 'notifications' ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                          <span>
                            <span className="block text-sm font-medium text-gray-700">Email notifications</span>
                            <span className="block text-xs text-gray-500">Send workflow alerts to official email inboxes.</span>
                          </span>
                          <input
                            type="checkbox"
                            checked={notificationForm.emailEnabled}
                            onChange={() =>
                              setNotificationForm((previous) => ({
                                ...previous,
                                emailEnabled: !previous.emailEnabled,
                              }))
                            }
                            className="h-4 w-4 rounded border-gray-300 text-[#1a6b3c] focus:ring-[#1a6b3c]"
                          />
                        </label>

                        <label className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                          <span>
                            <span className="block text-sm font-medium text-gray-700">SMS notifications</span>
                            <span className="block text-xs text-gray-500">Send urgent reminder messages to assignees.</span>
                          </span>
                          <input
                            type="checkbox"
                            checked={notificationForm.smsEnabled}
                            onChange={() =>
                              setNotificationForm((previous) => ({
                                ...previous,
                                smsEnabled: !previous.smsEnabled,
                              }))
                            }
                            className="h-4 w-4 rounded border-gray-300 text-[#1a6b3c] focus:ring-[#1a6b3c]"
                          />
                        </label>
                      </div>

                      <label className="block">
                        <span className="mb-1 block text-sm font-medium text-gray-700">Reminder lead time (hours)</span>
                        <input
                          type="number"
                          min={1}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1a6b3c]"
                          value={notificationForm.reminderHoursBeforeDeadline}
                          onChange={(event) => setNotificationForm((previous) => ({ ...previous, reminderHoursBeforeDeadline: Number(event.target.value) }))}
                        />
                      </label>
                    </>
                  ) : null}

                  {section === 'data-audit' ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="block">
                          <span className="mb-1 block text-sm font-medium text-gray-700">Retention period (days)</span>
                          <input
                            type="number"
                            min={30}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1a6b3c]"
                            value={dataAuditForm.retentionDays}
                            onChange={(event) => setDataAuditForm((previous) => ({ ...previous, retentionDays: Number(event.target.value) }))}
                          />
                        </label>

                        <label className="block">
                          <span className="mb-1 block text-sm font-medium text-gray-700">Default export format</span>
                          <select
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1a6b3c]"
                            value={dataAuditForm.exportFormat}
                            onChange={(event: ChangeEvent<HTMLSelectElement>) => setDataAuditForm((previous) => ({ ...previous, exportFormat: event.target.value as 'pdf' | 'xlsx' | 'csv' }))}
                          >
                            <option value="pdf">PDF</option>
                            <option value="xlsx">XLSX</option>
                            <option value="csv">CSV</option>
                          </select>
                        </label>
                      </div>

                      <label className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                        <span>
                          <span className="block text-sm font-medium text-gray-700">Enable audit logging</span>
                          <span className="block text-xs text-gray-500">Track administrative changes and exports.</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={dataAuditForm.auditLoggingEnabled}
                          onChange={() =>
                            setDataAuditForm((previous) => ({
                              ...previous,
                              auditLoggingEnabled: !previous.auditLoggingEnabled,
                            }))
                          }
                          className="h-4 w-4 rounded border-gray-300 text-[#1a6b3c] focus:ring-[#1a6b3c]"
                        />
                      </label>
                    </>
                  ) : null}

                  {section === 'system-defaults' ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="block">
                          <span className="mb-1 block text-sm font-medium text-gray-700">Default landing page</span>
                          <select
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1a6b3c]"
                            value={systemDefaultsForm.defaultLandingPage}
                            onChange={(event: ChangeEvent<HTMLSelectElement>) => setSystemDefaultsForm((previous) => ({ ...previous, defaultLandingPage: event.target.value as 'dashboard' | 'users' | 'settings' }))}
                          >
                            <option value="dashboard">Dashboard</option>
                            <option value="users">User Management</option>
                            <option value="settings">Settings</option>
                          </select>
                        </label>

                        <label className="block">
                          <span className="mb-1 block text-sm font-medium text-gray-700">Default workflow status</span>
                          <select
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1a6b3c]"
                            value={systemDefaultsForm.defaultWorkflowStatus}
                            onChange={(event: ChangeEvent<HTMLSelectElement>) => setSystemDefaultsForm((previous) => ({ ...previous, defaultWorkflowStatus: event.target.value as 'draft' | 'submitted' | 'under_scrutiny' }))}
                          >
                            <option value="draft">Draft</option>
                            <option value="submitted">Submitted</option>
                            <option value="under_scrutiny">Under Scrutiny</option>
                          </select>
                        </label>
                      </div>

                      <label className="block">
                        <span className="mb-1 block text-sm font-medium text-gray-700">Records per page</span>
                        <input
                          type="number"
                          min={10}
                          max={100}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1a6b3c]"
                          value={systemDefaultsForm.recordsPerPage}
                          onChange={(event) => setSystemDefaultsForm((previous) => ({ ...previous, recordsPerPage: Number(event.target.value) }))}
                        />
                      </label>
                    </>
                  ) : null}

                  <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
                    <Link
                      href="/admin/settings"
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 gov-action-btn"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="rounded-lg bg-[#1a6b3c] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#14522e] disabled:cursor-not-allowed disabled:opacity-60 gov-action-btn"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
