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
    { label: 'Open EDS', value: edsOpen.length, icon: <AlertTriangle size={20} />, gradient: 'from-orange-500 to-amber-600' },
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
          <div className="px-5 py-4 border-b border-gray-100/50">
            <h3 className="font-semibold text-gray-700 text-sm">Application Queue</h3>
          </div>
          <table className="w-full">
            <thead className="text-xs text-gray-500 uppercase tracking-wide" style={{ background: 'rgba(249,250,251,0.5)' }}>
              <tr>
                <th className="text-left px-5 py-3">App No.</th>
                <th className="text-left px-5 py-3">Project</th>
                <th className="text-left px-5 py-3">Category</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">EDS Open</th>
                <th className="text-left px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50 text-sm">
              {applications.map((a, idx) => (
                <motion.tr
                  key={a.id}
                  className="hover:bg-[#1a6b3c]/3 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.35 + idx * 0.04 }}
                >
                  <td className="px-5 py-3 font-mono text-xs text-gray-500">{a.applicationNumber}</td>
                  <td className="px-5 py-3 font-medium text-gray-800 max-w-48">
                    <p className="truncate">{a.projectName}</p>
                    <p className="text-xs text-gray-400">{a.stateUT}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-bold text-[#f7941d] bg-[#f7941d]/10 px-2 py-0.5 rounded-lg">Cat {a.projectCategory}</span>
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-5 py-3 text-center">
                    {a.edsQueries.filter((q) => q.status === 'open').length > 0 ? (
                      <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg">
                        {a.edsQueries.filter((q) => q.status === 'open').length} open
                      </span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/scrutiny/review?id=${a.id}`} className="text-xs font-semibold text-[#1a6b3c] hover:underline">Review →</Link>
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
