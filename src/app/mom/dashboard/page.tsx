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
import { Calendar, CheckCircle, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { getUiText } from '@/lib/translations';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
} satisfies import('framer-motion').Variants;

export default function MomDashboard() {
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const { applications, fetchAll, isLoading, error } = useWorkflowStore();

  useEffect(() => {
    if (user && user.role === 'mom') {
      fetchAll();
    }
  }, [user, fetchAll]);

  if (!user) return null;

  const referred = applications.filter((a) => a.status === 'referred');
  const momDraft = applications.filter((a) => a.status === 'mom_draft');
  const finalized = applications.filter((a) => a.status === 'finalized');

  const statCards = [
    { label: getUiText('pendingEacAppraisalLabel', language), value: referred.length, icon: <Calendar size={20} />, gradient: 'from-purple-500 to-violet-600' },
    { label: getUiText('momInDraftLabel', language), value: momDraft.length, icon: <BookOpen size={20} />, gradient: 'from-indigo-500 to-blue-600' },
    { label: getUiText('ecGrantedLabel', language), value: finalized.length, icon: <CheckCircle size={20} />, gradient: 'from-cyan-500 to-teal-600' },
  ];

  return (
    <PageShell role="mom">
      {/* Page heading */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="page-heading">{getUiText('momDashboardHeading', language)}</h2>
        <p className="page-subheading">{getUiText('momDashboardSubheading', language)}</p>
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

      {/* Applications */}
      {isLoading ? <SkeletonLoader variant="table" /> :
        error ? <ErrorMessage message={error} onRetry={fetchAll} /> : (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Referred applications */}
          {referred.length > 0 && (
            <div className="glass-card-strong overflow-hidden">
              <div className="px-5 py-4 ui-section-strip">
                <h3 className="font-semibold text-purple-800 text-sm">Referred — Awaiting EAC Appraisal</h3>
              </div>
              <div className="divide-y divide-gray-50/50">
                {referred.map((a, idx) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.35 + idx * 0.05 }}
                  >
                    <Link href={`/mom/gist?id=${a.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#164e63]/3 transition-colors block">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{a.projectName}</p>
                        <p className="text-xs text-gray-400">{a.applicationNumber} &bull; {a.stateUT} &bull; Cat {a.projectCategory}</p>
                        {a.meetingDate && <p className="text-xs text-purple-600 font-semibold mt-0.5">EAC Meeting: {new Date(a.meetingDate).toLocaleDateString('en-IN')} &bull; {a.meetingNumber}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={a.status} />
                        <span className="text-xs font-semibold text-[#164e63] hover:underline whitespace-nowrap">Generate Gist →</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* MoM draft */}
          {momDraft.length > 0 && (
            <div className="glass-card-strong overflow-hidden">
              <div className="px-5 py-4 ui-section-strip-muted">
                <h3 className="font-semibold text-indigo-800 text-sm">MoM Draft — Pending Finalization</h3>
              </div>
              <div className="divide-y divide-gray-50/50">
                {momDraft.map((a, idx) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.35 + idx * 0.05 }}
                  >
                    <Link href={`/mom/finalize?id=${a.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#164e63]/3 transition-colors block">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{a.projectName}</p>
                        <p className="text-xs text-gray-400">{a.applicationNumber}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={a.status} />
                        <span className="text-xs font-semibold text-indigo-600 hover:underline whitespace-nowrap">Finalize →</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {referred.length === 0 && momDraft.length === 0 && (
            <EmptyState title="No pending cases" message="All referred applications appear here. Check back after scrutiny refers cases to EAC." />
          )}
        </motion.div>
      )}
    </PageShell>
  );
}
