'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/PageShell';
import { useAuthStore } from '@/store/authStore';
import { approveRestrictedAccess, createUser, fetchUsers, updateUser } from '@/lib/api';
import { AdminCreateUserInput, AdminUpdateUserInput, User, UserRole } from '@/types/auth';
import { Plus, Save, ShieldCheck, ShieldX, UserRoundPen, Users, X } from 'lucide-react';
import { RBAC_ROLE_POLICIES, TEAM_ROLES, canAssignTeamRole } from '@/lib/rbac';
import { useLanguageStore } from '@/store/languageStore';
import { formatUiText, getUiText } from '@/lib/translations';

type FormMode = 'create' | 'edit';

interface UserFormState {
  name: string;
  email: string;
  role: UserRole;
  department: string;
  designation: string;
  isActive: boolean;
  password: string;
}

const defaultForm: UserFormState = {
  name: '',
  email: '',
  role: 'applicant',
  department: '',
  designation: '',
  isActive: true,
  password: '',
};

export default function AdminUsersPage() {
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [assigningUserId, setAssigningUserId] = useState<string | null>(null);
  const [approvingUserId, setApprovingUserId] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(() => new Set(['u3', 'u4']));
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [formState, setFormState] = useState<UserFormState>(defaultForm);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId) ?? null,
    [selectedUserId, users]
  );

  const assignmentCandidates = useMemo(
    () => users.filter((u) => u.role !== 'admin'),
    [users]
  );

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role !== 'admin') {
      router.replace('/login');
      return;
    }

    loadUsers();
  }, [user, router]);

  if (!user || user.role !== 'admin') return null;

  const resetForm = () => {
    setFormState(defaultForm);
    setSelectedUserId(null);
    setFormMode('create');
    setShowForm(false);
  };

  const startCreate = () => {
    setError(null);
    setFormMode('create');
    setFormState(defaultForm);
    setSelectedUserId(null);
    setShowForm(true);
  };

  const startEdit = (target: User) => {
    setError(null);
    setFormMode('edit');
    setSelectedUserId(target.id);
    setFormState({
      name: target.name,
      email: target.email,
      role: target.role,
      department: target.department,
      designation: target.designation,
      isActive: target.isActive,
      password: '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!formState.name || !formState.email || !formState.department || !formState.designation) {
      setError(getUiText('fillRequiredFields', language));
      return;
    }

    if (formMode === 'create' && formState.password.trim().length < 6) {
      setError(getUiText('passwordMinCharsError', language));
      return;
    }

    if (formMode === 'edit' && !selectedUserId) {
      setError(getUiText('userNotFoundError', language));
      return;
    }

    setIsSaving(true);
    try {
      if (formMode === 'create') {
        const payload: AdminCreateUserInput = {
          name: formState.name,
          email: formState.email,
          role: formState.role,
          department: formState.department,
          designation: formState.designation,
          isActive: formState.isActive,
          password: formState.password,
        };
        const created = await createUser(payload);
        setUsers((previous) => [...previous, created]);
      } else {
        const editUserId = selectedUserId;
        if (!editUserId) {
          setError(getUiText('userNotFoundError', language));
          return;
        }

        const payload: AdminUpdateUserInput = {
          name: formState.name,
          email: formState.email,
          role: formState.role,
          department: formState.department,
          designation: formState.designation,
          isActive: formState.isActive,
          ...(formState.password.trim() ? { password: formState.password } : {}),
        };
        const updated = await updateUser(editUserId, payload);
        setUsers((previous) => previous.map((item) => (item.id === updated.id ? updated : item)));
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : getUiText('unableToSaveUser', language));
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveAccess = async (targetUser: User) => {
    if (!user) return;
    setError(null);
    setApprovingUserId(targetUser.id);
    try {
      await approveRestrictedAccess(targetUser.id);
      setApprovedIds((prev) => new Set([...prev, targetUser.id]));
    } catch (err) {
      setError(err instanceof Error ? err.message : getUiText('approvalFailed', language));
    } finally {
      setApprovingUserId(null);
    }
  };

  const handleRemoveAccess = async (targetUser: User) => {
    setError(null);
    setRemovingUserId(targetUser.id);
    try {
      setApprovedIds((prev) => {
        const next = new Set(prev);
        next.delete(targetUser.id);
        return next;
      });
    } finally {
      setRemovingUserId(null);
    }
  };

  const assignTeamRole = async (targetUser: User, targetRole: UserRole) => {
    if (!user) return;
    if (!canAssignTeamRole(user.role, targetUser.role, targetRole)) {
      setError(getUiText('notAllowedToAssign', language));
      return;
    }

    setError(null);
    setAssigningUserId(targetUser.id);
    try {
      const updated = await updateUser(targetUser.id, {
        role: targetRole,
        department:
          targetRole === 'scrutiny'
            ? 'Scrutiny Division'
            : targetRole === 'mom'
              ? 'MoM Secretariat'
              : targetUser.department,
      });
      setUsers((previous) => previous.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : getUiText('roleAssignFailed', language));
    } finally {
      setAssigningUserId(null);
    }
  };

  return (
    <PageShell role="admin">
            <h2 className="page-heading">{getUiText('navUserManagement', language)}</h2>
            <p className="page-subheading mb-6">{getUiText('manageRegisteredUsers', language)}</p>

            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={startCreate}
                className="inline-flex items-center gap-2 rounded-lg bg-[#164e63] px-4 py-2 text-sm font-medium text-white hover:bg-[#0f4258] gov-action-btn"
              >
                <Plus size={16} />
                {getUiText('addNewUser', language)}
              </button>
            </div>

            {error ? (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 gov-notice">
                {error}
              </div>
            ) : null}

            {showForm ? (
              <section className="mb-5 glass-card-strong p-5 animate-gov-enter">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-800">
                    {formMode === 'create' ? getUiText('addUserCredentials', language) : formatUiText('editCredentials', language, { name: selectedUser?.name ?? '' })}
                  </h3>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <X size={14} />
                    {getUiText('closeLabel', language)}
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-gray-700">{getUiText('nameLabel', language)}</span>
                    <input
                      type="text"
                      value={formState.name}
                      onChange={(event) => setFormState((previous) => ({ ...previous, name: event.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#164e63]"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-gray-700">{getUiText('emailLabel', language)}</span>
                    <input
                      type="email"
                      value={formState.email}
                      onChange={(event) => setFormState((previous) => ({ ...previous, email: event.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#164e63]"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-gray-700">{getUiText('roleLabel', language)}</span>
                    <select
                      value={formState.role}
                      onChange={(event) => setFormState((previous) => ({ ...previous, role: event.target.value as UserRole }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#164e63]"
                    >
                      <option value="admin">Admin</option>
                      <option value="applicant">Applicant</option>
                      <option value="scrutiny">Scrutiny</option>
                      <option value="mom">MoM</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-gray-700">{getUiText('departmentLabel', language)}</span>
                    <input
                      type="text"
                      value={formState.department}
                      onChange={(event) => setFormState((previous) => ({ ...previous, department: event.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#164e63]"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-gray-700">{getUiText('designationLabel', language)}</span>
                    <input
                      type="text"
                      value={formState.designation}
                      onChange={(event) => setFormState((previous) => ({ ...previous, designation: event.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#164e63]"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-gray-700">
                      {formMode === 'create' ? getUiText('initialPasswordLabel', language) : getUiText('resetPasswordLabel', language)}
                    </span>
                    <input
                      type="password"
                      value={formState.password}
                      onChange={(event) => setFormState((previous) => ({ ...previous, password: event.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#164e63]"
                      placeholder={formMode === 'create' ? getUiText('passwordMinCharsHint', language) : getUiText('passwordLeaveBlankHint', language)}
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 md:col-span-2">
                    <span>
                      <span className="block text-sm font-medium text-gray-700">{getUiText('accountStatusLabel', language)}</span>
                      <span className="block text-xs text-gray-500">{getUiText('accountStatusDesc', language)}</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={formState.isActive}
                      onChange={() => setFormState((previous) => ({ ...previous, isActive: !previous.isActive }))}
                      className="h-4 w-4 rounded border-gray-300 text-[#164e63] focus:ring-[#164e63]"
                    />
                  </label>

                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#164e63] px-4 py-2 text-sm font-medium text-white hover:bg-[#0f4258] disabled:opacity-60 disabled:cursor-not-allowed gov-action-btn"
                    >
                      <Save size={15} />
                      {isSaving ? getUiText('savingLabel', language) : formMode === 'create' ? getUiText('createUserLabel', language) : getUiText('saveChangesLabel', language)}
                    </button>
                  </div>
                </form>
              </section>
            ) : null}

            <section className="mb-5 glass-card-strong p-5 animate-gov-enter">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-800">{getUiText('rbacTeamAssignment', language)}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {getUiText('rbacTeamAssignmentDesc', language)}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {assignmentCandidates.length === 0 ? (
                  <p className="text-sm text-gray-500">{getUiText('noNonAdminUsers', language)}</p>
                ) : assignmentCandidates.map((candidate) => (
                  <div key={candidate.id} className="rounded-lg border border-[#d8e4ee] bg-[#edf2f6] p-4">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-800">{candidate.name}</p>
                          {(candidate.role === 'scrutiny' || candidate.role === 'mom') && approvedIds.has(candidate.id) && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 text-cyan-700 text-[11px] font-semibold px-2 py-0.5">
                              <ShieldCheck size={11} /> {getUiText('portalAccessGranted', language)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{candidate.email}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {getUiText('currentRoleLabel', language)}: <span className="font-medium text-gray-700">{RBAC_ROLE_POLICIES[candidate.role].label}</span>
                        </p>
                      </div>
                      {/* Portal access approval badge */}
                      {(candidate.role === 'scrutiny' || candidate.role === 'mom') && (
                        <div className="shrink-0 flex flex-col items-end gap-1.5">
                          {approvedIds.has(candidate.id) ? (
                            <button
                              type="button"
                              disabled={removingUserId !== null}
                              onClick={() => handleRemoveAccess(candidate)}
                              className="inline-flex items-center gap-1 rounded-full bg-cyan-100 text-cyan-700 border border-cyan-300 text-[11px] font-semibold px-2 py-0.5 hover:bg-cyan-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <ShieldX size={11} />
                              {removingUserId === candidate.id ? getUiText('removingLabel', language) : getUiText('removePortalAccess', language)}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={approvingUserId !== null}
                              onClick={() => handleApproveAccess(candidate)}
                              className="inline-flex items-center gap-1 rounded-full bg-cyan-100 text-cyan-700 border border-cyan-300 text-[11px] font-semibold px-2 py-0.5 hover:bg-cyan-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <ShieldCheck size={11} />
                              {approvingUserId === candidate.id ? getUiText('approvingLabel', language) : getUiText('approvePortalAccess', language)}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {TEAM_ROLES.map((teamRole) => {
                        const isCurrent = candidate.role === teamRole;
                        const disabled = assigningUserId !== null || !canAssignTeamRole(user.role, candidate.role, teamRole);
                        return (
                          <button
                            key={teamRole}
                            type="button"
                            disabled={disabled || isCurrent}
                            onClick={() => assignTeamRole(candidate, teamRole)}
                            className={`rounded-md px-3 py-1.5 text-xs font-semibold border transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                              isCurrent
                                ? 'bg-[#164e63] text-white border-[#164e63]'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-[#164e63] hover:text-[#164e63]'
                            }`}
                          >
                          {isCurrent ? `${RBAC_ROLE_POLICIES[teamRole].label} ${getUiText('roleAssignedLabel', language).replace('{role}', '')}`.trim() : formatUiText('assignToRoleLabel', language, { role: RBAC_ROLE_POLICIES[teamRole].label })}
                          </button>
                        );
                      })}
                    </div>

                    {/* Warning for restricted-role users without portal access */}
                    {(candidate.role === 'scrutiny' || candidate.role === 'mom') && !approvedIds.has(candidate.id) && (
                      <p className="mt-2 text-[11px] text-cyan-700 bg-cyan-50 border border-cyan-100 rounded px-2 py-1">
                        ⚠ {formatUiText('userNoSignInWarning', language, { role: RBAC_ROLE_POLICIES[candidate.role].label })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <div className="glass-card-strong overflow-hidden">
              <div className="px-5 py-3 ui-section-strip flex items-center gap-2">
                <Users size={16} className="text-[#164e63]" />
                <h3 className="font-semibold text-gray-700 text-sm">{getUiText('registeredUsers', language)}</h3>
              </div>

              <table className="w-full">
                <thead className="ui-table-head">
                  <tr>
                    <th className="text-left px-5 py-3 ui-col-a">{getUiText('nameLabel', language)}</th>
                    <th className="text-left px-5 py-3 ui-col-b">{getUiText('emailHeaderLabel', language)}</th>
                    <th className="text-left px-5 py-3 ui-col-a">{getUiText('roleLabel', language)}</th>
                    <th className="text-left px-5 py-3 ui-col-b">{getUiText('departmentLabel', language)}</th>
                    <th className="text-left px-5 py-3 ui-col-a">{getUiText('designationLabel', language)}</th>
                    <th className="text-left px-5 py-3 ui-col-b">{getUiText('statusLabel', language)}</th>
                    <th className="text-left px-5 py-3 ui-col-a">{getUiText('actionLabel', language)}</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50 text-sm">
                  {isLoading ? (
                    <tr>
                      <td className="px-5 py-4 text-gray-500" colSpan={7}>{getUiText('loadingUsersLabel', language)}</td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td className="px-5 py-4 text-gray-500" colSpan={7}>{getUiText('noUsersFound', language)}</td>
                    </tr>
                  ) : users.map((u) => (
                    <tr key={u.id} className="ui-row-hover">
                      <td className="px-5 py-3 font-medium text-gray-800 ui-col-a">{u.name}</td>
                      <td className="px-5 py-3 text-gray-500 ui-col-b">{u.email}</td>
                      <td className="px-5 py-3 ui-col-a">
                        <span className="text-xs font-semibold bg-[#164e63]/10 text-[#164e63] px-2 py-0.5 rounded-full capitalize">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs ui-col-b">{u.department}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs ui-col-a">{u.designation}</td>
                      <td className="px-5 py-3 ui-col-b">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            u.isActive ? 'bg-cyan-100 text-cyan-700' : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {u.isActive ? getUiText('activeLabel', language) : getUiText('inactiveLabel', language)}
                        </span>
                      </td>
                      <td className="px-5 py-3 ui-col-a">
                        <button
                          type="button"
                          onClick={() => startEdit(u)}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <UserRoundPen size={13} />
                          {getUiText('editLabel', language)}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
    </PageShell>
  );
}
