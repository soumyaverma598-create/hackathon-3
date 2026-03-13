'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useWorkflowStore } from '@/store/workflowStore';
import { useNotificationStore } from '@/store/notificationStore';
import GovHeader from '@/components/GovHeader';
import Sidebar from '@/components/Sidebar';
import StatusBadge from '@/components/StatusBadge';
import SkeletonLoader from '@/components/SkeletonLoader';
import ErrorMessage from '@/components/ErrorMessage';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';
import { ClipboardList, AlertTriangle, Clock } from 'lucide-react';

export default function ScrutinyDashboard() {
  const { user } = useAuthStore();
  const { applications, fetchAll, isLoading, error } = useWorkflowStore();
  const { startPolling, stopPolling } = useNotificationStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    if (user.role !== 'scrutiny') { router.replace('/login'); return; }
    fetchAll();
    startPolling(user.id);
    return () => stopPolling();
  }, [user]);

  if (!user) return null;

  const active = applications.filter((a) => ['submitted', 'under_scrutiny', 'eds_raised'].includes(a.status));
  const edsOpen = applications.filter((a) => a.status === 'eds_raised' && a.edsQueries.some((q) => q.status === 'open'));
  const pending = applications.filter((a) => a.status === 'submitted');

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <GovHeader />
      <div className="flex flex-1">
        <Sidebar role="scrutiny" />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Scrutiny Dashboard</h2>
            <p className="text-gray-400 text-sm mb-6">Review and process Environmental Clearance applications</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Pending Review', value: pending.length, icon: <Clock size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Open EDS', value: edsOpen.length, icon: <AlertTriangle size={20} />, color: 'text-orange-600', bg: 'bg-orange-50' },
                { label: 'Active Cases', value: active.length, icon: <ClipboardList size={20} />, color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className={`w-9 h-9 ${s.bg} ${s.color} rounded-lg flex items-center justify-center mb-2`}>{s.icon}</div>
                  <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>

            {isLoading ? <SkeletonLoader variant="table" /> :
             error ? <ErrorMessage message={error} onRetry={fetchAll} /> :
             applications.length === 0 ? <EmptyState title="No applications" message="No applications to review." /> : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-700 text-sm">Application Queue</h3>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-5 py-3">App No.</th>
                      <th className="text-left px-5 py-3">Project</th>
                      <th className="text-left px-5 py-3">Category</th>
                      <th className="text-left px-5 py-3">Status</th>
                      <th className="text-left px-5 py-3">EDS Open</th>
                      <th className="text-left px-5 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {applications.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs text-gray-500">{a.applicationNumber}</td>
                        <td className="px-5 py-3 font-medium text-gray-800 max-w-48">
                          <p className="truncate">{a.projectName}</p>
                          <p className="text-xs text-gray-400">{a.stateUT}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs font-bold text-[#f7941d] bg-[#f7941d]/10 px-2 py-0.5 rounded-full">Cat {a.projectCategory}</span>
                        </td>
                        <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                        <td className="px-5 py-3 text-center">
                          {a.edsQueries.filter((q) => q.status === 'open').length > 0 ? (
                            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                              {a.edsQueries.filter((q) => q.status === 'open').length} open
                            </span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-5 py-3">
                          <Link href={`/scrutiny/review?id=${a.id}`} className="text-xs font-semibold text-[#1a6b3c] hover:underline">Review →</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
