'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/PageShell';
import { useAuthStore } from '@/store/authStore';
import { approveRestrictedAccess, createUser, fetchUsers, updateUser } from '@/lib/api';
import { AdminCreateUserInput, AdminUpdateUserInput, User, UserRole } from '@/types/auth';
import { Plus, Save, ShieldCheck, UserRoundPen, Users, X } from 'lucide-react';
import { RBAC_ROLE_POLICIES, TEAM_ROLES, canAssignTeamRole } from '@/lib/rbac';

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
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [assigningUserId, setAssigningUserId] = useState<string | null>(null);
  const [approvingUserId, setApprovingUserId] = useState<string | null>(null);
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
      setError('Please fill in all required fields.');
      return;
    }

    if (formMode === 'create' && formState.password.trim().length < 6) {
      setError('Password must be at least 6 characters for new users.');
      return;
    }

    if (formMode === 'edit' && !selectedUserId) {
      setError('Selected user was not found. Please retry.');
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
          setError('Selected user was not found. Please retry.');
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
      setError(err instanceof Error ? err.message : 'Unable to save user changes.');
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
      setError(err instanceof Error ? err.message : 'Failed to approve access.');
    } finally {
      setApprovingUserId(null);
    }
  };

  const assignTeamRole = async (targetUser: User, targetRole: UserRole) => {
    if (!user) return;
    if (!canAssignTeamRole(user.role, targetUser.role, targetRole)) {
      setError('You are not allowed to perform this assignment.');
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
      setError(err instanceof Error ? err.message : 'Failed to assign team role.');
    } finally {
      setAssigningUserId(null);
    }
  };

  return (
    <PageShell role="admin">
            <h2 className="page-heading">User Management</h2>
            <p className="page-subheading mb-6">Manage all registered users in PARIVESH 3.0.</p>

            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={startCreate}
                className="inline-flex items-center gap-2 rounded-lg bg-[#164e63] px-4 py-2 text-sm font-medium text-white hover:bg-[#0f4258] gov-action-btn"
              >
                <Plus size={16} />
                Add New User
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
                    {formMode === 'create' ? 'Add User Credentials' : `Edit Credentials - ${selectedUser?.name ?? ''}`}
                  </h3>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <X size={14} />
                    Close
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-gray-700">Name</span>
                    <input
                      type="text"
                      value={formState.name}
                      onChange={(event) => setFormState((previous) => ({ ...previous, name: event.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#164e63]"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-gray-700">Email (Login ID)</span>
                    <input
                      type="email"
                      value={formState.email}
                      onChange={(event) => setFormState((previous) => ({ ...previous, email: event.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#164e63]"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-gray-700">Role</span>
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
                    <span className="mb-1 block text-sm font-medium text-gray-700">Department</span>
                    <input
                      type="text"
                      value={formState.department}
                      onChange={(event) => setFormState((previous) => ({ ...previous, department: event.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#164e63]"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-gray-700">Designation</span>
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
                      {formMode === 'create' ? 'Initial Password' : 'Reset Password (optional)'}
                    </span>
                    <input
                      type="password"
                      value={formState.password}
                      onChange={(event) => setFormState((previous) => ({ ...previous, password: event.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#164e63]"
                      placeholder={formMode === 'create' ? 'Minimum 6 characters' : 'Leave blank to keep existing'}
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 md:col-span-2">
                    <span>
                      <span className="block text-sm font-medium text-gray-700">Account Status</span>
                      <span className="block text-xs text-gray-500">Allow user to access the portal.</span>
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
                      {isSaving ? 'Saving...' : formMode === 'create' ? 'Create User' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </section>
            ) : null}

            <section className="mb-5 glass-card-strong p-5 animate-gov-enter">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-800">Central RBAC Team Assignment</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Assign users to Scrutiny or MoM teams via centralized role-based access control.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {assignmentCandidates.length === 0 ? (
                  <p className="text-sm text-gray-500">No non-admin users available for assignment.</p>
                ) : assignmentCandidates.map((candidate) => (
                  <div key={candidate.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{candidate.name}</p>
                        <p className="text-xs text-gray-500">{candidate.email}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Current Role: <span className="font-medium text-gray-700">{RBAC_ROLE_POLICIES[candidate.role].label}</span>
                        </p>
                      </div>
                      {/* Portal access approval badge */}
                      {(candidate.role === 'scrutiny' || candidate.role === 'mom') && (
                        <div className="shrink-0">
                          {approvedIds.has(candidate.id) ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 text-cyan-700 text-[11px] font-semibold px-2 py-0.5">
                              <ShieldCheck size={11} /> Portal Access Granted
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={approvingUserId !== null}
                              onClick={() => handleApproveAccess(candidate)}
                              className="inline-flex items-center gap-1 rounded-full bg-cyan-100 text-cyan-700 border border-cyan-300 text-[11px] font-semibold px-2 py-0.5 hover:bg-cyan-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <ShieldCheck size={11} />
                              {approvingUserId === candidate.id ? 'Approving...' : 'Approve Portal Access'}
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
                            {isCurrent ? `${RBAC_ROLE_POLICIES[teamRole].label} Assigned` : `Assign to ${RBAC_ROLE_POLICIES[teamRole].label}`}
                          </button>
                        );
                      })}
                    </div>

                    {/* Warning for restricted-role users without portal access */}
                    {(candidate.role === 'scrutiny' || candidate.role === 'mom') && !approvedIds.has(candidate.id) && (
                      <p className="mt-2 text-[11px] text-cyan-700 bg-cyan-50 border border-cyan-100 rounded px-2 py-1">
                        ⚠ This user cannot sign in to the {RBAC_ROLE_POLICIES[candidate.role].label} portal until you grant portal access.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <div className="glass-card-strong overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                <Users size={16} className="text-[#164e63]" />
                <h3 className="font-semibold text-gray-700 text-sm">Registered Users</h3>
              </div>

              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-5 py-3">Name</th>
                    <th className="text-left px-5 py-3">Email</th>
                    <th className="text-left px-5 py-3">Role</th>
                    <th className="text-left px-5 py-3">Department</th>
                    <th className="text-left px-5 py-3">Designation</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-left px-5 py-3">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50 text-sm">
                  {isLoading ? (
                    <tr>
                      <td className="px-5 py-4 text-gray-500" colSpan={7}>Loading users...</td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td className="px-5 py-4 text-gray-500" colSpan={7}>No users found.</td>
                    </tr>
                  ) : users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-800">{u.name}</td>
                      <td className="px-5 py-3 text-gray-500">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-semibold bg-[#164e63]/10 text-[#164e63] px-2 py-0.5 rounded-full capitalize">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{u.department}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{u.designation}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            u.isActive ? 'bg-cyan-100 text-cyan-700' : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => startEdit(u)}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <UserRoundPen size={13} />
                          Edit
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
