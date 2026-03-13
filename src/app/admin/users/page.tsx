'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import GovHeader from '@/components/GovHeader';
import Sidebar from '@/components/Sidebar';
import { useAuthStore } from '@/store/authStore';
import { createUser, fetchUsers, updateUser } from '@/lib/api';
import { AdminCreateUserInput, AdminUpdateUserInput, User, UserRole } from '@/types/auth';
import { Plus, Save, UserRoundPen, Users, X } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [formState, setFormState] = useState<UserFormState>(defaultForm);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId) ?? null,
    [selectedUserId, users]
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <GovHeader />
      <div className="flex flex-1">
        <Sidebar role="admin" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">User Management</h2>
            <p className="text-gray-500 text-sm mb-6">Manage all registered users in PARIVESH 3.0.</p>

            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={startCreate}
                className="inline-flex items-center gap-2 rounded-lg bg-[#1a6b3c] px-4 py-2 text-sm font-medium text-white hover:bg-[#14522e] gov-action-btn"
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
              <section className="mb-5 rounded-xl border border-gray-100 bg-white p-5 shadow-sm animate-gov-enter">
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
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1a6b3c]"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-gray-700">Email (Login ID)</span>
                    <input
                      type="email"
                      value={formState.email}
                      onChange={(event) => setFormState((previous) => ({ ...previous, email: event.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1a6b3c]"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-gray-700">Role</span>
                    <select
                      value={formState.role}
                      onChange={(event) => setFormState((previous) => ({ ...previous, role: event.target.value as UserRole }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1a6b3c]"
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
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1a6b3c]"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-gray-700">Designation</span>
                    <input
                      type="text"
                      value={formState.designation}
                      onChange={(event) => setFormState((previous) => ({ ...previous, designation: event.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1a6b3c]"
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
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1a6b3c]"
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
                      className="h-4 w-4 rounded border-gray-300 text-[#1a6b3c] focus:ring-[#1a6b3c]"
                    />
                  </label>

                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#1a6b3c] px-4 py-2 text-sm font-medium text-white hover:bg-[#14522e] disabled:opacity-60 disabled:cursor-not-allowed gov-action-btn"
                    >
                      <Save size={15} />
                      {isSaving ? 'Saving...' : formMode === 'create' ? 'Create User' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </section>
            ) : null}

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                <Users size={16} className="text-[#1a6b3c]" />
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
                        <span className="text-xs font-semibold bg-[#1a6b3c]/10 text-[#1a6b3c] px-2 py-0.5 rounded-full capitalize">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{u.department}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{u.designation}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
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
          </div>
        </main>
      </div>
    </div>
  );
}
