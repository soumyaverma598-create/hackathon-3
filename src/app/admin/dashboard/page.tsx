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
import { getDashboardText, getRoleText, getCommonText } from '@/lib/translations';
import { MOCK_USERS } from '@/lib/mockData';
import { Users, Database, ShieldCheck, FileStack } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
} satisfies import('framer-motion').Variants;

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const { applications, fetchAll, isLoading, error } = useWorkflowStore();

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAll();
    }
  }, [user, fetchAll]);

  if (!user) return null;

  const byStatus = (s: string) => applications.filter((a) => a.status === s).length;

  const statCards = [
    { labelKey: 'totalUsers' as const, value: MOCK_USERS.length, icon: <Users size={20} />, gradient: 'from-blue-500 to-indigo-600' },
    { labelKey: 'totalApplications' as const, value: applications.length, icon: <FileStack size={20} />, gradient: 'from-purple-500 to-violet-600' },
    { labelKey: 'ecGranted' as const, value: byStatus('finalized'), icon: <ShieldCheck size={20} />, gradient: 'from-cyan-500 to-teal-600' },
    { labelKey: 'activeCases' as const, value: applications.filter((a) => !['draft', 'finalized'].includes(a.status)).length, icon: <Database size={20} />, gradient: 'from-sky-500 to-cyan-600' },
  ];

  return (
    <PageShell role="admin">
      {/* Page heading */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="page-heading">{getDashboardText('adminDashboard', language)}</h2>
        <p className="page-subheading">{getDashboardText('systemOverview', language)}</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {statCards.map((stat) => (
          <motion.div key={stat.labelKey} variants={itemVariants} className="stat-card group">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
              {stat.icon}
            </div>
            <p className="text-3xl font-extrabold text-gray-800 mb-0.5">{stat.value}</p>
            <p className="text-xs text-gray-400 font-medium">{getDashboardText(stat.labelKey, language)}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* User Table */}
      <motion.div
        className="glass-card-strong overflow-hidden mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="px-5 py-4 ui-section-strip flex items-center gap-2">
          <Users size={16} className="text-[#164e63]" />
          <h3 className="font-semibold text-gray-700 text-sm">{getDashboardText('registeredUsers', language)}</h3>
        </div>
        <table className="w-full">
          <thead className="ui-table-head">
            <tr>
              <th className="text-left px-5 py-3 ui-col-a">{getDashboardText('name', language)}</th>
              <th className="text-left px-5 py-3 ui-col-b">{getCommonText('email', language)}</th>
              <th className="text-left px-5 py-3 ui-col-a">{getCommonText('role', language)}</th>
              <th className="text-left px-5 py-3 ui-col-b">{getCommonText('department', language)}</th>
              <th className="text-left px-5 py-3 ui-col-a">{getDashboardText('status', language)}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50/50 text-sm">
            {MOCK_USERS.map((u, idx) => (
              <motion.tr
                key={u.id}
                className="ui-row-hover"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.35 + idx * 0.04 }}
              >
                <td className="px-5 py-3 font-medium text-gray-800 ui-col-a">{u.name}</td>
                <td className="px-5 py-3 text-gray-500 ui-col-b">{u.email}</td>
                <td className="px-5 py-3 ui-col-a">
                  <span className="text-xs font-semibold bg-[#164e63]/10 text-[#164e63] px-2.5 py-0.5 rounded-lg capitalize">{u.role}</span>
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs max-w-40 truncate ui-col-b">{u.department}</td>
                <td className="px-5 py-3 ui-col-a">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${u.isActive ? 'bg-cyan-100/80 text-cyan-700' : 'bg-red-100/80 text-red-600'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Applications Table */}
      <motion.div
        className="glass-card-strong overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
      >
        <div className="px-5 py-4 ui-section-strip-muted flex items-center gap-2">
          <FileStack size={16} className="text-[#164e63]" />
          <h3 className="font-semibold text-gray-700 text-sm">All Applications</h3>
        </div>
        {isLoading ? <div className="p-4"><SkeletonLoader variant="table" /></div> :
          error ? <div className="p-4"><ErrorMessage message={error} /></div> :
          applications.length === 0 ? <EmptyState title="No applications" message="No applications submitted yet." /> : (
          <table className="w-full">
            <thead className="ui-table-head">
              <tr>
                <th className="text-left px-5 py-3 ui-col-a">App No.</th>
                <th className="text-left px-5 py-3 ui-col-b">Project</th>
                <th className="text-left px-5 py-3 ui-col-a">Proponent</th>
                <th className="text-left px-5 py-3 ui-col-b">Status</th>
                <th className="text-left px-5 py-3 ui-col-a">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50 text-sm">
              {applications.map((a, idx) => (
                <motion.tr
                  key={a.id}
                  className="ui-row-hover"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + idx * 0.04 }}
                >
                  <td className="px-5 py-3 font-mono text-xs text-gray-500 ui-col-a">{a.applicationNumber}</td>
                  <td className="px-5 py-3 font-medium text-gray-800 max-w-48 truncate ui-col-b">{a.projectName}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs ui-col-a">{a.proponentName}</td>
                  <td className="px-5 py-3 ui-col-b"><StatusBadge status={a.status} /></td>
                  <td className="px-5 py-3 ui-col-a">
                    <span className="text-xs font-semibold bg-[#25c9d0]/10 text-[#25c9d0] px-2 py-0.5 rounded-lg">Cat. {a.projectCategory}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </PageShell>
  );
}
