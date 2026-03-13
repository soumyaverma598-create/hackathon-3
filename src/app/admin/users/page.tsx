'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GovHeader from '@/components/GovHeader';
import Sidebar from '@/components/Sidebar';
import { useAuthStore } from '@/store/authStore';
import { MOCK_USERS } from '@/lib/mockData';
import { Users } from 'lucide-react';

export default function AdminUsersPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role !== 'admin') {
      router.replace('/login');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <GovHeader />
      <div className="flex flex-1">
        <Sidebar role="admin" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">User Management</h2>
            <p className="text-gray-500 text-sm mb-6">Manage all registered users in PARIVESH 3.0.</p>

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
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50 text-sm">
                  {MOCK_USERS.map((u) => (
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
