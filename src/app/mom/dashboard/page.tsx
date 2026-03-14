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
import { Calendar, CheckCircle, BookOpen } from 'lucide-react';

export default function MomDashboard() {
  const { user } = useAuthStore();
  const { applications, fetchAll, isLoading, error } = useWorkflowStore();
  const { startPolling, stopPolling } = useNotificationStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    if (user.role !== 'mom') { router.replace('/login'); return; }
    fetchAll();
    startPolling(user.id);
    return () => stopPolling();
  }, [user]);

  if (!user) return null;

  const referred = applications.filter((a) => a.status === 'referred');
  const momDraft = applications.filter((a) => a.status === 'mom_draft');
  const finalized = applications.filter((a) => a.status === 'finalized');

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <GovHeader />
      <div className="flex flex-1">
        <Sidebar role="mom" />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">MoM Secretariat Dashboard</h2>
            <p className="text-gray-400 text-sm mb-6">Manage appraisal minutes and issue Environmental Clearance certificates</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Pending EAC Appraisal', value: referred.length, icon: <Calendar size={20} />, color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'MoM In Draft', value: momDraft.length, icon: <BookOpen size={20} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'EC Granted', value: finalized.length, icon: <CheckCircle size={20} />, color: 'text-green-600', bg: 'bg-green-50' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className={`w-9 h-9 ${s.bg} ${s.color} rounded-lg flex items-center justify-center mb-2`}>{s.icon}</div>
                  <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>

            {isLoading ? <SkeletonLoader variant="table" /> :
             error ? <ErrorMessage message={error} onRetry={fetchAll} /> : (
              <div className="space-y-4">
                {/* Referred applications */}
                {referred.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 bg-purple-50">
                      <h3 className="font-semibold text-purple-800 text-sm">Referred — Awaiting EAC Appraisal</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {referred.map((a) => (
                        <Link key={a.id} href={`/mom/gist?id=${a.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors block">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{a.projectName}</p>
                            <p className="text-xs text-gray-400">{a.applicationNumber} &bull; {a.stateUT} &bull; Cat {a.projectCategory}</p>
                            {a.meetingDate && <p className="text-xs text-purple-600 font-semibold mt-0.5">EAC Meeting: {new Date(a.meetingDate).toLocaleDateString('en-IN')} &bull; {a.meetingNumber}</p>}
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusBadge status={a.status} />
                            <span className="text-xs font-semibold text-[#1a6b3c] hover:underline whitespace-nowrap">Generate Gist →</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* MoM draft */}
                {momDraft.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 bg-indigo-50">
                      <h3 className="font-semibold text-indigo-800 text-sm">MoM Draft — Pending Finalization</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {momDraft.map((a) => (
                        <Link key={a.id} href={`/mom/finalize?id=${a.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors block">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{a.projectName}</p>
                            <p className="text-xs text-gray-400">{a.applicationNumber}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusBadge status={a.status} />
                            <span className="text-xs font-semibold text-indigo-600 hover:underline whitespace-nowrap">Finalize →</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {referred.length === 0 && momDraft.length === 0 && (
                  <EmptyState title="No pending cases" message="All referred applications appear here. Check back after scrutiny refers cases to EAC." />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
