'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useWorkflowStore } from '@/store/workflowStore';
import GovHeader from '@/components/GovHeader';
import Sidebar from '@/components/Sidebar';
import StatusBadge from '@/components/StatusBadge';
import SkeletonLoader from '@/components/SkeletonLoader';
import ErrorMessage from '@/components/ErrorMessage';
import EmptyState from '@/components/EmptyState';
import { MOCK_USERS } from '@/lib/mockData';
import { Users, Database, ShieldCheck, FileStack } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { applications, fetchAll, isLoading, error } = useWorkflowStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    if (user.role !== 'admin') { router.replace('/login'); return; }
    fetchAll();
  }, [user]);

  if (!user) return null;

  const byStatus = (s: string) => applications.filter((a) => a.status === s).length;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <GovHeader />
      <div className="flex flex-1">
        <Sidebar role="admin" />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Admin Dashboard</h2>
            <p className="text-gray-400 text-sm mb-6">System overview — PARIVESH 3.0</p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Users', value: MOCK_USERS.length, icon: <Users size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Total Applications', value: applications.length, icon: <FileStack size={20} />, color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'EC Granted', value: byStatus('finalized'), icon: <ShieldCheck size={20} />, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Active Cases', value: applications.filter((a) => !['draft', 'finalized'].includes(a.status)).length, icon: <Database size={20} />, color: 'text-orange-600', bg: 'bg-orange-50' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className={`w-9 h-9 ${s.bg} ${s.color} rounded-lg flex items-center justify-center mb-2`}>{s.icon}</div>
                  <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>

            {/* User Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
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
                    <th className="text-left px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {MOCK_USERS.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-800">{u.name}</td>
                      <td className="px-5 py-3 text-gray-500">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-semibold bg-[#1a6b3c]/10 text-[#1a6b3c] px-2 py-0.5 rounded-full capitalize">{u.role}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs max-w-40 truncate">{u.department}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                <FileStack size={16} className="text-[#1a6b3c]" />
                <h3 className="font-semibold text-gray-700 text-sm">All Applications</h3>
              </div>
              {isLoading ? <div className="p-4"><SkeletonLoader variant="table" /></div> :
               error ? <div className="p-4"><ErrorMessage message={error} /></div> :
               applications.length === 0 ? <EmptyState title="No applications" message="No applications submitted yet." /> : (
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-5 py-3">App No.</th>
                      <th className="text-left px-5 py-3">Project</th>
                      <th className="text-left px-5 py-3">Proponent</th>
                      <th className="text-left px-5 py-3">Status</th>
                      <th className="text-left px-5 py-3">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {applications.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs text-gray-500">{a.applicationNumber}</td>
                        <td className="px-5 py-3 font-medium text-gray-800 max-w-48 truncate">{a.projectName}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{a.proponentName}</td>
                        <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                        <td className="px-5 py-3">
                          <span className="text-xs font-semibold bg-[#f7941d]/10 text-[#f7941d] px-2 py-0.5 rounded-full">Cat. {a.projectCategory}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
               )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
