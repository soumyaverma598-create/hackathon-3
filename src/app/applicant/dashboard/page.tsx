'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useLanguageStore } from '@/store/languageStore';
import { useWorkflowStore } from '@/store/workflowStore';
import PageShell from '@/components/PageShell';
import StatusBadge from '@/components/StatusBadge';
import SkeletonLoader from '@/components/SkeletonLoader';
import EmptyState from '@/components/EmptyState';
import ErrorMessage from '@/components/ErrorMessage';
import Link from 'next/link';
import { FilePlus, FolderOpen, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatUiText, getUiText } from '@/lib/translations';
import { formatAppId } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
} satisfies import('framer-motion').Variants;

export default function ApplicantDashboard() {
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const { applications, isLoading, error, fetchByProponent } = useWorkflowStore();

  useEffect(() => {
    if (user && user.role === 'applicant') {
      fetchByProponent(user.email);
    }
  }, [user, fetchByProponent]);

  if (!user) return null;

  const stats = {
    total: applications.length,
    active: applications.filter((a) => !['draft', 'finalized'].includes(a.status)).length,
    granted: applications.filter((a) => a.status === 'finalized').length,
    pending: applications.filter((a) => a.status === 'draft').length,
  };

  const statCards = [
    { label: getUiText('totalApplicationsLabel', language), value: stats.total, icon: <FolderOpen size={20} />, gradient: 'from-blue-500 to-indigo-600' },
    { label: getUiText('activeLabel', language), value: stats.active, icon: <TrendingUp size={20} />, gradient: 'from-sky-500 to-cyan-600' },
    { label: getUiText('ecGrantedLabel', language), value: stats.granted, icon: <FilePlus size={20} />, gradient: 'from-cyan-500 to-teal-600' },
    { label: getUiText('draftLabel', language), value: stats.pending, icon: <Clock size={20} />, gradient: 'from-gray-500 to-slate-600' },
  ];

  return (
    <PageShell role="applicant">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h2 className="page-heading">{getUiText('myApplicationsHeading', language)}</h2>
          <p className="page-subheading">{getUiText('trackEcApplications', language)}</p>
        </div>
        <Link
          href="/applicant/apply"
          className="group flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #164e63, #1f7ea4)',
            boxShadow: '0 4px 16px rgba(26,107,60,0.25)',
          }}
        >
          <FilePlus size={16} /> {getUiText('newApplicationLabel', language)}
        </Link>
      </motion.div>

      {/* Stats row */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
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

      {/* Applications list */}
      {isLoading ? (
        <SkeletonLoader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => user && fetchByProponent(user.email)} />
      ) : applications.length === 0 ? (
        <EmptyState
          title={getUiText('noApplicationsYet', language)}
          message={getUiText('startFirstApplication', language)}
          action={
            <Link href="/applicant/apply" className="inline-flex items-center gap-2 bg-[#164e63] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0f3650] transition-colors shadow-md">
              {getUiText('createApplicationLabel', language)}
            </Link>
          }
        />
      ) : (
        <motion.div
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {applications.map((app) => (
            <motion.div
              key={app.id}
              variants={itemVariants}
              className="glass-card p-5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-mono text-gray-400">{formatAppId(app.applicationNumber)}</span>
                    <span className="text-xs text-gray-300">|</span>
                    <span className="text-xs font-semibold text-[#25c9d0]">{app.projectCategory} Category</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 truncate">{app.projectName}</h3>
                  <p className="text-sm text-gray-400 mt-0.5">{app.stateUT} &bull; {app.projectSector}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100/50">
                <div className="flex gap-4 text-xs text-gray-400">
                  <span>{getUiText('appliedLabel', language)}: {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('en-IN') : getUiText('notSubmittedLabel', language)}</span>
                  <span>
                    {getUiText('paymentLabel', language)}:{' '}
                    <span className={app.paymentStatus === 'paid' || app.paymentStatus === 'verified' ? 'text-cyan-600 font-semibold' : 'text-sky-500 font-semibold'}>
                      {app.paymentStatus}
                    </span>
                  </span>
                  {app.edsQueries.filter((q) => q.status === 'open').length > 0 && (
                    <span className="text-sky-600 font-semibold">
                      {formatUiText('edsOpenCount', language, { count: app.edsQueries.filter((q) => q.status === 'open').length })}
                    </span>
                  )}
                </div>
                <Link
                  href={`/applicant/eds?id=${app.id}`}
                  className="text-xs text-[#164e63] font-semibold hover:underline"
                >
                  {getUiText('viewDetailsLabel', language)} →
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </PageShell>
  );
}
