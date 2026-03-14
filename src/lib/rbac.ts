import { UserRole } from '@/types/auth';

export interface RolePolicy {
  key: UserRole;
  label: string;
  canAccessAdminModules: boolean;
}

export const RBAC_ROLE_POLICIES: Record<UserRole, RolePolicy> = {
  admin: {
    key: 'admin',
    label: 'Admin',
    canAccessAdminModules: true,
  },
  applicant: {
    key: 'applicant',
    label: 'Applicant',
    canAccessAdminModules: false,
  },
  scrutiny: {
    key: 'scrutiny',
    label: 'Scrutiny Team',
    canAccessAdminModules: false,
  },
  mom: {
    key: 'mom',
    label: 'MoM Team',
    canAccessAdminModules: false,
  },
};

export const TEAM_ROLES: UserRole[] = ['scrutiny', 'mom'];

export const canAssignTeamRole = (
  actorRole: UserRole,
  currentRole: UserRole,
  targetRole: UserRole
): boolean => {
  if (actorRole !== 'admin') return false;
  if (!TEAM_ROLES.includes(targetRole)) return false;
  if (currentRole === 'admin') return false;
  return true;
};
