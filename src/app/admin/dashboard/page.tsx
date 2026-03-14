'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useWorkflowStore } from '@/store/workflowStore';
import PageShell from '@/components/PageShell';
import StatusBadge from '@/components/StatusBadge';
import SkeletonLoader from '@/components/SkeletonLoader';
import ErrorMessage from '@/components/ErrorMessage';
import EmptyState from '@/components/EmptyState';
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
  const { applications, fetchAll, isLoading, error } = useWorkflowStore();

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAll();
    }
  }, [user, fetchAll]);

  if (!user) return null;

  const byStatus = (s: string) => applications.filter((a) => a.status === s).length;

  const statCards = [
    { label: 'Total Users', value: MOCK_USERS.length, icon: <Users size={20} />, gradient: 'from-blue-500 to-indigo-600' },
    { label: 'Total Applications', value: applications.length, icon: <FileStack size={20} />, gradient: 'from-purple-500 to-violet-600' },
    { label: 'EC Granted', value: byStatus('finalized'), icon: <ShieldCheck size={20} />, gradient: 'from-emerald-500 to-teal-600' },
    { label: 'Active Cases', value: applications.filter((a) => !['draft', 'finalized'].includes(a.status)).length, icon: <Database size={20} />, gradient: 'from-orange-500 to-amber-600' },
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
        <h2 className="page-heading">Admin Dashboard</h2>
        <p className="page-subheading">System overview — PARIVESH 3.0</p>
      </motion.div>

      {/* Stats */}
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

      {/* User Table */}
      <motion.div
        className="glass-card-strong overflow-hidden mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="px-5 py-4 border-b border-gray-100/50 flex items-center gap-2">
          <Users size={16} className="text-[#1a6b3c]" />
          <h3 className="font-semibold text-gray-700 text-sm">Registered Users</h3>
        </div>
        <table className="w-full">
          <thead className="text-xs text-gray-500 uppercase tracking-wide" style={{ background: 'rgba(249,250,251,0.5)' }}>
            <tr>
              <th className="text-left px-5 py-3">Name</th>
              <th className="text-left px-5 py-3">Email</th>
              <th className="text-left px-5 py-3">Role</th>
              <th className="text-left px-5 py-3">Department</th>
              <th className="text-left px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50/50 text-sm">
            {MOCK_USERS.map((u, idx) => (
              <motion.tr
                key={u.id}
                className="hover:bg-[#1a6b3c]/3 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.35 + idx * 0.04 }}
              >
                <td className="px-5 py-3 font-medium text-gray-800">{u.name}</td>
                <td className="px-5 py-3 text-gray-500">{u.email}</td>
                <td className="px-5 py-3">
                  <span className="text-xs font-semibold bg-[#1a6b3c]/10 text-[#1a6b3c] px-2.5 py-0.5 rounded-lg capitalize">{u.role}</span>
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs max-w-40 truncate">{u.department}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${u.isActive ? 'bg-green-100/80 text-green-700' : 'bg-red-100/80 text-red-600'}`}>
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
        <div className="px-5 py-4 border-b border-gray-100/50 flex items-center gap-2">
          <FileStack size={16} className="text-[#1a6b3c]" />
          <h3 className="font-semibold text-gray-700 text-sm">All Applications</h3>
        </div>
        {isLoading ? <div className="p-4"><SkeletonLoader variant="table" /></div> :
          error ? <div className="p-4"><ErrorMessage message={error} /></div> :
          applications.length === 0 ? <EmptyState title="No applications" message="No applications submitted yet." /> : (
          <table className="w-full">
            <thead className="text-xs text-gray-500 uppercase tracking-wide" style={{ background: 'rgba(249,250,251,0.5)' }}>
              <tr>
                <th className="text-left px-5 py-3">App No.</th>
                <th className="text-left px-5 py-3">Project</th>
                <th className="text-left px-5 py-3">Proponent</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50 text-sm">
              {applications.map((a, idx) => (
                <motion.tr
                  key={a.id}
                  className="hover:bg-[#1a6b3c]/3 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + idx * 0.04 }}
                >
                  <td className="px-5 py-3 font-mono text-xs text-gray-500">{a.applicationNumber}</td>
                  <td className="px-5 py-3 font-medium text-gray-800 max-w-48 truncate">{a.projectName}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{a.proponentName}</td>
                  <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-semibold bg-[#f7941d]/10 text-[#f7941d] px-2 py-0.5 rounded-lg">Cat. {a.projectCategory}</span>
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
