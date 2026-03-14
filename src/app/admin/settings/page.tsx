'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Database, Settings, ShieldCheck } from 'lucide-react';
import PageShell from '@/components/PageShell';
import { useAuthStore } from '@/store/authStore';
import { useAdminSettingsStore } from '@/store/adminSettingsStore';
import { AdminSettingsSection } from '@/types/settings';
import { useLanguageStore } from '@/store/languageStore';
import { formatUiText, getUiText } from '@/lib/translations';

const tabConfig = [
  {
    id: 'security',
    labelKey: 'settingsTabSecurity',
    titleKey: 'settingsTitleSecurity',
    descKey: 'settingsDescSecurity',
    icon: ShieldCheck,
  },
  {
    id: 'notifications',
    labelKey: 'settingsTabNotifications',
    titleKey: 'settingsTitleNotifications',
    descKey: 'settingsDescNotifications',
    icon: Bell,
  },
  {
    id: 'data-audit',
    labelKey: 'settingsTabDataAudit',
    titleKey: 'settingsTitleDataAudit',
    descKey: 'settingsDescDataAudit',
    icon: Database,
  },
  {
    id: 'system-defaults',
    labelKey: 'settingsTabSystemDefaults',
    titleKey: 'settingsTitleSystemDefaults',
    descKey: 'settingsDescSystemDefaults',
    icon: Settings,
  },
] as const;

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-[#164e63]/25 ${
        checked ? 'bg-[#1a6b3c] border-[#1a6b3c]' : 'bg-slate-200 border-slate-300'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

function SettingRow({
  title,
  description,
  control,
}: {
  title: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 border-b border-[#164e63]/10 px-4 py-4 md:grid-cols-[1fr_auto] md:items-center md:px-5">
      <div>
        <p className="text-sm font-semibold text-[#0f2f45]">{title}</p>
        <p className="text-xs text-[#4d6a7f]">{description}</p>
      </div>
      <div className="md:justify-self-end">{control}</div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const router = useRouter();
  const { settings, isLoading, isSaving, error, fetchSettings, saveSection, clearError } = useAdminSettingsStore();
  const [activeTab, setActiveTab] = useState<AdminSettingsSection>('notifications');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const securityRef = useRef<HTMLElement | null>(null);
  const notificationsRef = useRef<HTMLElement | null>(null);
  const dataAuditRef = useRef<HTMLElement | null>(null);
  const systemDefaultsRef = useRef<HTMLElement | null>(null);
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
    }

    fetchSettings();
  }, [user, router, fetchSettings]);

  useEffect(() => {
    if (!settings) return;
    setSecurityForm(settings.security);
    setNotificationForm(settings.notifications);
    setDataAuditForm(settings['data-audit']);
    setSystemDefaultsForm(settings['system-defaults']);
  }, [settings]);

  useEffect(() => {
    if (!saveMessage) return;
    const timeout = window.setTimeout(() => setSaveMessage(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [saveMessage]);

  useEffect(() => {
    const refsBySection: Record<AdminSettingsSection, HTMLElement | null> = {
      security: securityRef.current,
      notifications: notificationsRef.current,
      'data-audit': dataAuditRef.current,
      'system-defaults': systemDefaultsRef.current,
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length === 0) return;

        const topEntry = visible[0];
        const matchedSection = (Object.keys(refsBySection) as AdminSettingsSection[]).find(
          (section) => refsBySection[section] === topEntry.target
        );

        if (matchedSection) {
          setActiveTab(matchedSection);
        }
      },
      {
        root: null,
        rootMargin: '-25% 0px -50% 0px',
        threshold: [0.2, 0.4, 0.6],
      }
    );

    (Object.values(refsBySection) as Array<HTMLElement | null>).forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  if (!user || user.role !== 'admin') return null;

  const sectionRefs: Record<AdminSettingsSection, React.RefObject<HTMLElement | null>> = {
    security: securityRef,
    notifications: notificationsRef,
    'data-audit': dataAuditRef,
    'system-defaults': systemDefaultsRef,
  };

  const handleSaveAll = async () => {
    clearError();
    try {
      await saveSection('security', securityForm);
      await saveSection('notifications', notificationForm);
      await saveSection('data-audit', dataAuditForm);
      await saveSection('system-defaults', systemDefaultsForm);
      setSaveMessage(getUiText('allSettingsUpdated', language));
    } catch {
      // Error state is handled by store.
    }
  };

  const handleTabClick = (section: AdminSettingsSection) => {
    setActiveTab(section);
    sectionRefs[section].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <PageShell role="admin">
      <h2 className="page-heading animate-gov-enter">{getUiText('navSettings', language)}</h2>
      <p className="page-subheading mb-4 animate-gov-enter" style={{ animationDelay: '0.05s' }}>
        {getUiText('settingsPageSubheading', language)}
      </p>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 animate-gov-enter" style={{ animationDelay: '0.08s' }}>
        <p className="text-xs text-gray-500">
          {settings ? formatUiText('lastUpdated', language, { value: new Date(settings.updatedAt).toLocaleString() }) : formatUiText('lastUpdated', language, { value: getUiText('loadingLabel', language) })}
        </p>
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isSaving || isLoading}
          className="rounded-md bg-[#164e63] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f3650] disabled:cursor-not-allowed disabled:bg-[#164e63]/60"
        >
          {isSaving ? getUiText('saving', language) : getUiText('saveAllSettings', language)}
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 gov-notice">
          {error}
        </div>
      ) : null}

      {saveMessage ? (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 gov-notice">
          {saveMessage}
        </div>
      ) : null}

      <section className="glass-card-strong overflow-hidden animate-gov-enter" style={{ animationDelay: '0.12s' }}>
        <div className="sticky top-0 z-20 border-b border-[#164e63]/12 bg-gradient-to-r from-[#f7fcff]/95 via-[#f1f9fe]/95 to-[#ecf7fd]/95 px-3 py-3 backdrop-blur md:px-4">
          <div className="flex gap-2 overflow-x-auto">
            {tabConfig.map((tab) => {
              const tabIsActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  className={`whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                    tabIsActive
                      ? 'border-[#1a6b3c]/35 bg-[#1a6b3c]/12 text-[#124e30]'
                      : 'border-[#164e63]/10 bg-white/70 text-[#4f6777] hover:border-[#164e63]/22 hover:text-[#164e63]'
                  }`}
                >
                  {getUiText(tab.labelKey, language)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 md:p-5">
          {tabConfig.map((section, idx) => {
            const Icon = section.icon;
            const sectionRef = sectionRefs[section.id];
            const sectionShadeClass = idx % 2 === 0 ? 'bg-[#f4f9fd]/85' : 'bg-[#ecf3fa]/88';
            const sectionHeaderShadeClass = idx % 2 === 0 ? 'bg-[#edf6fc]/72' : 'bg-[#e5eff8]/80';

            return (
              <section
                key={section.id}
                ref={sectionRef}
                className={`mb-6 scroll-mt-28 rounded-xl border border-[#164e63]/10 ${sectionShadeClass} last:mb-0`}
              >
                <div className={`border-b border-[#164e63]/10 px-4 py-4 md:px-5 ${sectionHeaderShadeClass}`}>
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 rounded-md bg-[#164e63]/10 p-2">
                      <Icon size={16} className="text-[#164e63]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#10364c]">{getUiText(section.titleKey, language)}</h3>
                      <p className="text-xs text-[#4d6a7f]">{getUiText(section.descKey, language)}</p>
                    </div>
                  </div>
                </div>

                {section.id === 'notifications' ? (
                  <>
                    <SettingRow
                      title={getUiText('settingEmailNotificationsTitle', language)}
                      description={getUiText('settingEmailNotificationsDesc', language)}
                      control={
                        <Toggle
                          checked={notificationForm.emailEnabled}
                          onChange={() => setNotificationForm((prev) => ({ ...prev, emailEnabled: !prev.emailEnabled }))}
                        />
                      }
                    />
                    <SettingRow
                      title={getUiText('settingSmsNotificationsTitle', language)}
                      description={getUiText('settingSmsNotificationsDesc', language)}
                      control={
                        <Toggle
                          checked={notificationForm.smsEnabled}
                          onChange={() => setNotificationForm((prev) => ({ ...prev, smsEnabled: !prev.smsEnabled }))}
                        />
                      }
                    />
                    <SettingRow
                      title={getUiText('settingReminderLeadTimeTitle', language)}
                      description={getUiText('settingReminderLeadTimeDesc', language)}
                      control={
                        <input
                          type="number"
                          min={1}
                          className="w-28 rounded-md border border-[#164e63]/18 bg-white px-3 py-1.5 text-sm text-[#0f2f45] outline-none focus:border-[#164e63]"
                          value={notificationForm.reminderHoursBeforeDeadline}
                          onChange={(event) =>
                            setNotificationForm((prev) => ({
                              ...prev,
                              reminderHoursBeforeDeadline: Number(event.target.value),
                            }))
                          }
                        />
                      }
                    />
                  </>
                ) : null}

                {section.id === 'security' ? (
                  <>
                    <SettingRow
                      title={getUiText('settingSessionTimeoutTitle', language)}
                      description={getUiText('settingSessionTimeoutDesc', language)}
                      control={
                        <input
                          type="number"
                          min={5}
                          className="w-28 rounded-md border border-[#164e63]/18 bg-white px-3 py-1.5 text-sm text-[#0f2f45] outline-none focus:border-[#164e63]"
                          value={securityForm.sessionTimeoutMinutes}
                          onChange={(event) =>
                            setSecurityForm((prev) => ({ ...prev, sessionTimeoutMinutes: Number(event.target.value) }))
                          }
                        />
                      }
                    />
                    <SettingRow
                      title={getUiText('settingPasswordRotationTitle', language)}
                      description={getUiText('settingPasswordRotationDesc', language)}
                      control={
                        <input
                          type="number"
                          min={30}
                          className="w-28 rounded-md border border-[#164e63]/18 bg-white px-3 py-1.5 text-sm text-[#0f2f45] outline-none focus:border-[#164e63]"
                          value={securityForm.passwordRotationDays}
                          onChange={(event) =>
                            setSecurityForm((prev) => ({ ...prev, passwordRotationDays: Number(event.target.value) }))
                          }
                        />
                      }
                    />
                    <SettingRow
                      title={getUiText('settingTwoFactorTitle', language)}
                      description={getUiText('settingTwoFactorDesc', language)}
                      control={
                        <Toggle
                          checked={securityForm.twoFactorRequired}
                          onChange={() =>
                            setSecurityForm((prev) => ({ ...prev, twoFactorRequired: !prev.twoFactorRequired }))
                          }
                        />
                      }
                    />
                  </>
                ) : null}

                {section.id === 'data-audit' ? (
                  <>
                    <SettingRow
                      title={getUiText('settingRetentionPeriodTitle', language)}
                      description={getUiText('settingRetentionPeriodDesc', language)}
                      control={
                        <input
                          type="number"
                          min={30}
                          className="w-28 rounded-md border border-[#164e63]/18 bg-white px-3 py-1.5 text-sm text-[#0f2f45] outline-none focus:border-[#164e63]"
                          value={dataAuditForm.retentionDays}
                          onChange={(event) =>
                            setDataAuditForm((prev) => ({ ...prev, retentionDays: Number(event.target.value) }))
                          }
                        />
                      }
                    />
                    <SettingRow
                      title={getUiText('settingExportFormatTitle', language)}
                      description={getUiText('settingExportFormatDesc', language)}
                      control={
                        <select
                          className="w-28 rounded-md border border-[#164e63]/18 bg-white px-3 py-1.5 text-sm text-[#0f2f45] outline-none focus:border-[#164e63]"
                          value={dataAuditForm.exportFormat}
                          onChange={(event) =>
                            setDataAuditForm((prev) => ({
                              ...prev,
                              exportFormat: event.target.value as 'pdf' | 'xlsx' | 'csv',
                            }))
                          }
                        >
                          <option value="pdf">PDF</option>
                          <option value="xlsx">XLSX</option>
                          <option value="csv">CSV</option>
                        </select>
                      }
                    />
                    <SettingRow
                      title={getUiText('settingAuditLoggingTitle', language)}
                      description={getUiText('settingAuditLoggingDesc', language)}
                      control={
                        <Toggle
                          checked={dataAuditForm.auditLoggingEnabled}
                          onChange={() =>
                            setDataAuditForm((prev) => ({
                              ...prev,
                              auditLoggingEnabled: !prev.auditLoggingEnabled,
                            }))
                          }
                        />
                      }
                    />
                  </>
                ) : null}

                {section.id === 'system-defaults' ? (
                  <>
                    <SettingRow
                      title={getUiText('settingDefaultLandingTitle', language)}
                      description={getUiText('settingDefaultLandingDesc', language)}
                      control={
                        <select
                          className="w-40 rounded-md border border-[#164e63]/18 bg-white px-3 py-1.5 text-sm text-[#0f2f45] outline-none focus:border-[#164e63]"
                          value={systemDefaultsForm.defaultLandingPage}
                          onChange={(event) =>
                            setSystemDefaultsForm((prev) => ({
                              ...prev,
                              defaultLandingPage: event.target.value as 'dashboard' | 'users' | 'settings',
                            }))
                          }
                        >
                          <option value="dashboard">Dashboard</option>
                          <option value="users">User Management</option>
                          <option value="settings">Settings</option>
                        </select>
                      }
                    />
                    <SettingRow
                      title={getUiText('settingDefaultWorkflowTitle', language)}
                      description={getUiText('settingDefaultWorkflowDesc', language)}
                      control={
                        <select
                          className="w-44 rounded-md border border-[#164e63]/18 bg-white px-3 py-1.5 text-sm text-[#0f2f45] outline-none focus:border-[#164e63]"
                          value={systemDefaultsForm.defaultWorkflowStatus}
                          onChange={(event) =>
                            setSystemDefaultsForm((prev) => ({
                              ...prev,
                              defaultWorkflowStatus: event.target.value as 'draft' | 'submitted' | 'under_scrutiny',
                            }))
                          }
                        >
                          <option value="draft">Draft</option>
                          <option value="submitted">Submitted</option>
                          <option value="under_scrutiny">Under Scrutiny</option>
                        </select>
                      }
                    />
                    <SettingRow
                      title={getUiText('settingRecordsPerPageTitle', language)}
                      description={getUiText('settingRecordsPerPageDesc', language)}
                      control={
                        <input
                          type="number"
                          min={10}
                          max={100}
                          className="w-28 rounded-md border border-[#164e63]/18 bg-white px-3 py-1.5 text-sm text-[#0f2f45] outline-none focus:border-[#164e63]"
                          value={systemDefaultsForm.recordsPerPage}
                          onChange={(event) =>
                            setSystemDefaultsForm((prev) => ({ ...prev, recordsPerPage: Number(event.target.value) }))
                          }
                        />
                      }
                    />
                  </>
                ) : null}
              </section>
            );
          })}
        </div>
      </section>

      {isLoading && !settings ? (
        <div className="mt-4 text-sm text-gray-500 animate-gov-enter">{getUiText('loadingSettings', language)}</div>
      ) : null}
    </PageShell>
  );
}
