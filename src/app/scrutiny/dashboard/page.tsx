'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useWorkflowStore } from '@/store/workflowStore';
import PageShell from '@/components/PageShell';
import StatusBadge from '@/components/StatusBadge';
import SkeletonLoader from '@/components/SkeletonLoader';
import ErrorMessage from '@/components/ErrorMessage';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';
import { ClipboardList, AlertTriangle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
} satisfies import('framer-motion').Variants;

export default function ScrutinyDashboard() {
  const { user } = useAuthStore();
  const { applications, fetchAll, isLoading, error } = useWorkflowStore();

  useEffect(() => {
    if (user && user.role === 'scrutiny') {
      fetchAll();
    }
  }, [user, fetchAll]);

  if (!user) return null;

  const active = applications.filter((a) => ['submitted', 'under_scrutiny', 'eds_raised'].includes(a.status));
  const edsOpen = applications.filter((a) => a.status === 'eds_raised' && a.edsQueries.some((q) => q.status === 'open'));
  const pending = applications.filter((a) => a.status === 'submitted');

  const statCards = [
    { label: 'Pending Review', value: pending.length, icon: <Clock size={20} />, gradient: 'from-blue-500 to-indigo-600' },
    { label: 'Open EDS', value: edsOpen.length, icon: <AlertTriangle size={20} />, gradient: 'from-sky-500 to-cyan-600' },
    { label: 'Active Cases', value: active.length, icon: <ClipboardList size={20} />, gradient: 'from-purple-500 to-violet-600' },
  ];

  return (
    <PageShell role="scrutiny">
      {/* Page heading */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="page-heading">Scrutiny Dashboard</h2>
        <p className="page-subheading">Review and process Environmental Clearance applications</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-3 gap-4 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {statCards.map((stat) => (
          <motion.div key={stat.label} variants={itemVariants} className="stat-card group">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
              {stat.icon}
            </div>
            <p className="text-3xl font-extrabold text-gray-800 mb-0.5">{stat.value}</p>
            <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Applications table */}
      {isLoading ? <SkeletonLoader variant="table" /> :
        error ? <ErrorMessage message={error} onRetry={fetchAll} /> :
        applications.length === 0 ? <EmptyState title="No applications" message="No applications to review." /> : (
        <motion.div
          className="glass-card-strong overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="px-5 py-4 ui-section-strip">
            <h3 className="font-semibold text-gray-700 text-sm">Application Queue</h3>
          </div>
          <table className="w-full">
            <thead className="ui-table-head">
              <tr>
                <th className="text-left px-5 py-3 ui-col-a">App No.</th>
                <th className="text-left px-5 py-3 ui-col-b">Project</th>
                <th className="text-left px-5 py-3 ui-col-a">Category</th>
                <th className="text-left px-5 py-3 ui-col-b">Status</th>
                <th className="text-left px-5 py-3 ui-col-a">EDS Open</th>
                <th className="text-left px-5 py-3 ui-col-b">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50 text-sm">
              {applications.map((a, idx) => (
                <motion.tr
                  key={a.id}
                  className="ui-row-hover"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.35 + idx * 0.04 }}
                >
                  <td className="px-5 py-3 font-mono text-xs text-gray-500 ui-col-a">{a.applicationNumber}</td>
                  <td className="px-5 py-3 font-medium text-gray-800 max-w-48 ui-col-b">
                    <p className="truncate">{a.projectName}</p>
                    <p className="text-xs text-gray-400">{a.stateUT}</p>
                  </td>
                  <td className="px-5 py-3 ui-col-a">
                    <span className="text-xs font-bold text-[#25c9d0] bg-[#25c9d0]/10 px-2 py-0.5 rounded-lg">Cat {a.projectCategory}</span>
                  </td>
                  <td className="px-5 py-3 ui-col-b"><StatusBadge status={a.status} /></td>
                  <td className="px-5 py-3 text-center ui-col-a">
                    {a.edsQueries.filter((q) => q.status === 'open').length > 0 ? (
                      <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-lg">
                        {a.edsQueries.filter((q) => q.status === 'open').length} open
                      </span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 ui-col-b">
                    <Link href={`/scrutiny/review?id=${a.id}`} className="text-xs font-semibold text-[#164e63] hover:underline">Review →</Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </PageShell>
  );
}
