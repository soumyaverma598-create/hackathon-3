import { AdminSettings, AdminSettingsSection, AdminSettingsSections } from '@/types/settings';

const defaultAdminSettings: AdminSettings = {
  security: {
    sessionTimeoutMinutes: 30,
    passwordRotationDays: 90,
    twoFactorRequired: true,
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    reminderHoursBeforeDeadline: 24,
  },
  'data-audit': {
    retentionDays: 365,
    exportFormat: 'pdf',
    auditLoggingEnabled: true,
  },
  'system-defaults': {
    defaultLandingPage: 'dashboard',
    defaultWorkflowStatus: 'submitted',
    recordsPerPage: 25,
  },
  updatedAt: new Date().toISOString(),
};

let adminSettingsState: AdminSettings = cloneSettings(defaultAdminSettings);

function cloneSettings(settings: AdminSettings): AdminSettings {
  return JSON.parse(JSON.stringify(settings)) as AdminSettings;
}

export function getAdminSettings(): AdminSettings {
  return cloneSettings(adminSettingsState);
}

export function getAdminSettingsSection<T extends AdminSettingsSection>(
  section: T
): AdminSettingsSections[T] {
  return cloneSettings(adminSettingsState)[section] as AdminSettingsSections[T];
}

export function updateAdminSettingsSection<T extends AdminSettingsSection>(
  section: T,
  patch: Partial<AdminSettingsSections[T]>
): AdminSettingsSections[T] {
  adminSettingsState = {
    ...adminSettingsState,
    [section]: {
      ...adminSettingsState[section],
      ...patch,
    },
    updatedAt: new Date().toISOString(),
  };

  return getAdminSettingsSection(section);
}
