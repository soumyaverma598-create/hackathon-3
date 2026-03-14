'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useLanguageStore } from '@/store/languageStore';
import { useWorkflowStore } from '@/store/workflowStore';
import PageShell from '@/components/PageShell';
import StatusBadge from '@/components/StatusBadge';
import SkeletonLoader from '@/components/SkeletonLoader';
import ErrorMessage from '@/components/ErrorMessage';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';
import { ClipboardList, AlertTriangle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { getUiText } from '@/lib/translations';
import { formatAppId } from '@/lib/utils';

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
  const { language } = useLanguageStore();
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
    { label: getUiText('pendingReviewLabel', language), value: pending.length, icon: <Clock size={20} />, gradient: 'from-blue-500 to-indigo-600' },
    { label: getUiText('openEdsLabel', language), value: edsOpen.length, icon: <AlertTriangle size={20} />, gradient: 'from-sky-500 to-cyan-600' },
    { label: getUiText('activeCasesLabel', language), value: active.length, icon: <ClipboardList size={20} />, gradient: 'from-purple-500 to-violet-600' },
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
        <h2 className="page-heading">{getUiText('scrutinyDashboardHeading', language)}</h2>
        <p className="page-subheading">{getUiText('scrutinyDashboardSubheading', language)}</p>
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
        applications.length === 0 ? <EmptyState title={getUiText('noApplicationsTitle', language)} message={getUiText('noApplicationsToReview', language)} /> : (
        <motion.div
          className="glass-card-strong overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="px-5 py-4 ui-section-strip">
            <h3 className="font-semibold text-gray-700 text-sm">{getUiText('applicationQueueTitle', language)}</h3>
          </div>
          <table className="w-full">
            <thead className="ui-table-head">
              <tr>
                <th className="text-left px-5 py-3 ui-col-a">{getUiText('appNumberLabel', language)}</th>
                <th className="text-left px-5 py-3 ui-col-b">{getUiText('projectLabel', language)}</th>
                <th className="text-left px-5 py-3 ui-col-a">{getUiText('categoryLabel', language)}</th>
                <th className="text-left px-5 py-3 ui-col-b">{getUiText('statusLabel', language)}</th>
                <th className="text-left px-5 py-3 ui-col-a">{getUiText('edsOpenTableLabel', language)}</th>
                <th className="text-left px-5 py-3 ui-col-b">{getUiText('actionLabel', language)}</th>
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
                  <td className="px-5 py-3 font-mono text-xs text-gray-500 ui-col-a">{formatAppId(a.applicationNumber)}</td>
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
                        {a.edsQueries.filter((q) => q.status === 'open').length} {getUiText('openEdsLabel', language)}
                      </span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 ui-col-b">
                    <Link href={`/scrutiny/review?id=${a.id}`} className="text-xs font-semibold text-[#164e63] hover:underline">{getUiText('reviewLabel', language)} →</Link>
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
