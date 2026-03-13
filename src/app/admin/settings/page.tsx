'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, ShieldCheck, Bell, Database, ChevronRight } from 'lucide-react';
import GovHeader from '@/components/GovHeader';
import Sidebar from '@/components/Sidebar';
import { useAuthStore } from '@/store/authStore';
import { useAdminSettingsStore } from '@/store/adminSettingsStore';

export default function AdminSettingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { settings, isLoading, error, fetchSettings } = useAdminSettingsStore();

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

  if (!user || user.role !== 'admin') return null;

  const settingSections = [
    {
      href: '/admin/settings/security',
      title: 'Security',
      description: 'Role permissions and account security settings.',
      summary: settings
        ? `${settings.security.sessionTimeoutMinutes} min timeout • ${settings.security.passwordRotationDays} day rotation • ${settings.security.twoFactorRequired ? '2FA required' : '2FA optional'}`
        : 'Loading current security preferences.',
      icon: ShieldCheck,
    },
    {
      href: '/admin/settings/notifications',
      title: 'Notifications',
      description: 'Manage system alerts and notification rules.',
      summary: settings
        ? `Email ${settings.notifications.emailEnabled ? 'on' : 'off'} • SMS ${settings.notifications.smsEnabled ? 'on' : 'off'} • ${settings.notifications.reminderHoursBeforeDeadline}h reminders`
        : 'Loading current notification preferences.',
      icon: Bell,
    },
    {
      href: '/admin/settings/data-audit',
      title: 'Data & Audit',
      description: 'Data retention, logs, and audit preferences.',
      summary: settings
        ? `${settings['data-audit'].retentionDays} day retention • ${settings['data-audit'].exportFormat.toUpperCase()} exports • ${settings['data-audit'].auditLoggingEnabled ? 'audit logs on' : 'audit logs off'}`
        : 'Loading current data and audit preferences.',
      icon: Database,
    },
    {
      href: '/admin/settings/system-defaults',
      title: 'System Defaults',
      description: 'Default dashboard and workflow configuration.',
      summary: settings
        ? `${settings['system-defaults'].defaultLandingPage} landing • ${settings['system-defaults'].defaultWorkflowStatus.replace('_', ' ')} workflow • ${settings['system-defaults'].recordsPerPage} rows`
        : 'Loading current system defaults.',
      icon: Settings,
    },
  ] as const;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <GovHeader />
      <div className="flex flex-1">
        <Sidebar role="admin" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-1 animate-gov-enter">Settings</h2>
            <p className="text-gray-500 text-sm mb-6 animate-gov-enter" style={{ animationDelay: '0.05s' }}>Configure admin preferences for PARIVESH 3.0.</p>

            {settings ? (
              <p className="text-xs text-gray-400 mb-4 animate-gov-enter" style={{ animationDelay: '0.08s' }}>Last updated: {new Date(settings.updatedAt).toLocaleString()}</p>
            ) : null}

            {error ? (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 gov-notice">
                {error}
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {settingSections.map((section, idx) => {
                const Icon = section.icon;

                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    className="group bg-white rounded-xl border border-gray-100 shadow-sm p-5 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/20 animate-gov-enter gov-surface-hover"
                    style={{ animationDelay: `${0.1 + idx * 0.06}s` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon size={16} className="text-[#1a6b3c] transition-transform duration-200 group-hover:scale-105" />
                          <h3 className="font-semibold text-gray-800 text-sm">{section.title}</h3>
                        </div>
                        <p className="text-sm text-gray-500">{section.description}</p>
                        <p className="mt-3 text-xs text-gray-400">{section.summary}</p>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 transition-transform duration-200 group-hover:text-[#1a6b3c] group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {isLoading && !settings ? (
              <div className="mt-4 text-sm text-gray-500 animate-gov-enter" style={{ animationDelay: '0.2s' }}>Loading settings...</div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
