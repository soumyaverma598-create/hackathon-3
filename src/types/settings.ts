export type AdminSettingsSection =
  | 'security'
  | 'notifications'
  | 'data-audit'
  | 'system-defaults';

export interface SecuritySettings {
  sessionTimeoutMinutes: number;
  passwordRotationDays: number;
  twoFactorRequired: boolean;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  reminderHoursBeforeDeadline: number;
}

export interface DataAuditSettings {
  retentionDays: number;
  exportFormat: 'pdf' | 'xlsx' | 'csv';
  auditLoggingEnabled: boolean;
}

export interface SystemDefaultSettings {
  defaultLandingPage: 'dashboard' | 'users' | 'settings';
  defaultWorkflowStatus: 'draft' | 'submitted' | 'under_scrutiny';
  recordsPerPage: number;
}

export interface AdminSettings {
  security: SecuritySettings;
  notifications: NotificationSettings;
  'data-audit': DataAuditSettings;
  'system-defaults': SystemDefaultSettings;
  updatedAt: string;
}

export interface AdminSettingsSections {
  security: SecuritySettings;
  notifications: NotificationSettings;
  'data-audit': DataAuditSettings;
  'system-defaults': SystemDefaultSettings;
}
