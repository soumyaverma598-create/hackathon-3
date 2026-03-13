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
import EmptyState from '@/components/EmptyState';
import ErrorMessage from '@/components/ErrorMessage';
import Link from 'next/link';
import { FilePlus, FolderOpen, TrendingUp, Clock } from 'lucide-react';

export default function ApplicantDashboard() {
  const { user } = useAuthStore();
  const { applications, isLoading, error, fetchByProponent } = useWorkflowStore();
  const { startPolling, stopPolling } = useNotificationStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    if (user.role !== 'applicant') { router.replace('/login'); return; }
    fetchByProponent(user.email);
    startPolling(user.id);
    return () => stopPolling();
  }, [user]);

  if (!user) return null;

  const stats = {
    total: applications.length,
    active: applications.filter((a) => !['draft', 'finalized'].includes(a.status)).length,
    granted: applications.filter((a) => a.status === 'finalized').length,
    pending: applications.filter((a) => a.status === 'draft').length,
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <GovHeader />
      <div className="flex flex-1">
        <Sidebar role="applicant" />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">My Applications</h2>
                <p className="text-gray-500 text-sm mt-0.5">Track your Environmental Clearance applications</p>
              </div>
              <Link
                href="/applicant/apply"
                className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-lg shadow transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #1a6b3c, #256b45)' }}
              >
                <FilePlus size={16} /> New Application
              </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Applications', value: stats.total, icon: <FolderOpen size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Active', value: stats.active, icon: <TrendingUp size={20} />, color: 'text-orange-600', bg: 'bg-orange-50' },
                { label: 'EC Granted', value: stats.granted, icon: <FilePlus size={20} />, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Draft', value: stats.pending, icon: <Clock size={20} />, color: 'text-gray-600', bg: 'bg-gray-50' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className={`w-9 h-9 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center mb-2`}>
                    {stat.icon}
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Applications list */}
            {isLoading ? (
              <SkeletonLoader />
            ) : error ? (
              <ErrorMessage message={error} onRetry={() => user && fetchByProponent(user.email)} />
            ) : applications.length === 0 ? (
              <EmptyState
                title="No applications yet"
                message="Start by creating your first Environmental Clearance application."
                action={
                  <Link href="/applicant/apply" className="bg-[#1a6b3c] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0f4a2a] transition-colors">
                    Create Application
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div key={app.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-mono text-gray-400">{app.applicationNumber}</span>
                          <span className="text-xs text-gray-300">|</span>
                          <span className="text-xs font-semibold text-[#f7941d]">{app.projectCategory} Category</span>
                        </div>
                        <h3 className="font-semibold text-gray-800 truncate">{app.projectName}</h3>
                        <p className="text-sm text-gray-400 mt-0.5">{app.stateUT} &bull; {app.projectSector}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                      <div className="flex gap-4 text-xs text-gray-400">
                        <span>Applied: {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('en-IN') : 'Not submitted'}</span>
                        <span>
                          Payment:{' '}
                          <span className={app.paymentStatus === 'paid' || app.paymentStatus === 'verified' ? 'text-green-600 font-semibold' : 'text-orange-500 font-semibold'}>
                            {app.paymentStatus}
                          </span>
                        </span>
                        {app.edsQueries.filter((q) => q.status === 'open').length > 0 && (
                          <span className="text-orange-600 font-semibold">
                            {app.edsQueries.filter((q) => q.status === 'open').length} EDS open
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/applicant/eds?id=${app.id}`}
                        className="text-xs text-[#1a6b3c] font-semibold hover:underline"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
