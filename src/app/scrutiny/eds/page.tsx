'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useWorkflowStore } from '@/store/workflowStore';
import PageShell from '@/components/PageShell';
import SkeletonLoader from '@/components/SkeletonLoader';
import ErrorMessage from '@/components/ErrorMessage';
import EmptyState from '@/components/EmptyState';
import { getEDSQueries, raiseEDSQuery, closeEDSQuery } from '@/lib/api';
import { EDSQuery } from '@/types/workflow';
import { Plus, CheckCheck, ChevronDown, ChevronUp, MessageSquareWarning } from 'lucide-react';

function ScrutinyEDSPageContent() {
  const { user } = useAuthStore();
  const { applications, fetchAll } = useWorkflowStore();
  const router = useRouter();
  const params = useSearchParams();
  const [selectedAppId, setSelectedAppId] = useState(params.get('id') ?? '');
  const [queries, setQueries] = useState<EDSQuery[]>([]);
  const [loading, setLoading] = useState(false);
  const [raiseMode, setRaiseMode] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    fetchAll();
  }, [user]);

  useEffect(() => {
    if (!selectedAppId) return;
    setLoading(true);
    getEDSQueries(selectedAppId).then(setQueries).catch((e) => setErr(e.message)).finally(() => setLoading(false));
  }, [selectedAppId]);

  const handleRaise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true); setErr(''); setSuccess('');
    try {
      const q = await raiseEDSQuery(selectedAppId, { subject: newSubject, description: newDesc, raisedBy: user.email });
      setQueries((qs) => [...qs, q]);
      setSuccess(`EDS Query ${q.queryNumber} raised successfully.`);
      setNewSubject(''); setNewDesc(''); setRaiseMode(false);
    } catch (e) { setErr(e instanceof Error ? e.message : 'Failed.'); }
    finally { setSubmitting(false); }
  };

  const handleClose = async (queryId: string) => {
    try {
      const updated = await closeEDSQuery(selectedAppId, queryId);
      setQueries((qs) => qs.map((q) => (q.id === queryId ? updated : q)));
      setSuccess('EDS Query closed.');
    } catch (e) { setErr(e instanceof Error ? e.message : 'Failed.'); }
  };

  if (!user) return null;

  const edsBadge: Record<EDSQuery['status'], string> = {
    open: 'bg-sky-100 text-sky-700', responded: 'bg-blue-100 text-blue-700', closed: 'bg-cyan-100 text-cyan-700',
  };

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#164e63]";

  return (
    <PageShell role="scrutiny">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="page-heading" style={{marginBottom:0}}>EDS Management</h2>
                <p className="page-subheading">Raise and manage Environmental Data Sheet queries</p>
              </div>
              {selectedAppId && (
                <button onClick={() => setRaiseMode(!raiseMode)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #25c9d0, #179ea8)' }}>
                  <Plus size={15} /> Raise EDS
                </button>
              )}
            </div>

            <div className="glass-card-strong p-4 mb-4">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Select Application</label>
              <select className={inputCls} value={selectedAppId} onChange={(e) => setSelectedAppId(e.target.value)}>
                <option value="">-- Select application --</option>
                {applications.map((a) => <option key={a.id} value={a.id}>{a.applicationNumber} — {a.projectName}</option>)}
              </select>
            </div>

            {success && <div className="mb-3 bg-cyan-50 border border-cyan-200 text-cyan-700 rounded-lg px-4 py-2.5 text-sm font-semibold">{success}</div>}
            {err && <ErrorMessage message={err} className="mb-3" />}

            {raiseMode && (
              <form onSubmit={handleRaise} className="bg-white rounded-xl border border-[#25c9d0]/30 shadow-sm p-5 mb-4 space-y-3">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2"><MessageSquareWarning size={16} className="text-[#25c9d0]" /> New EDS Query</h4>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Subject *</label>
                  <input className={inputCls} value={newSubject} onChange={(e) => setNewSubject(e.target.value)} required placeholder="e.g. Water Requirement Details" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description *</label>
                  <textarea rows={4} className={`${inputCls} resize-none`} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} required placeholder="Detailed query description..." />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #164e63, #1f7ea4)' }}>
                    {submitting ? 'Raising…' : 'Raise Query'}
                  </button>
                  <button type="button" onClick={() => setRaiseMode(false)} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50">Cancel</button>
                </div>
              </form>
            )}

            {loading ? <SkeletonLoader /> :
             !selectedAppId ? null :
             queries.length === 0 ? <EmptyState title="No EDS queries" message="No queries have been raised on this application." /> : (
               <div className="space-y-3">
                 {queries.map((q) => (
                   <div key={q.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                     <div className="flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}>
                       <MessageSquareWarning size={16} className="text-[#25c9d0] mt-0.5 flex-shrink-0" />
                       <div className="flex-1 min-w-0">
                         <span className="text-xs font-mono text-gray-400">{q.queryNumber}</span>
                         <p className="text-sm font-semibold text-gray-700 truncate">{q.subject}</p>
                       </div>
                       <div className="flex items-center gap-2">
                         <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${edsBadge[q.status]}`}>{q.status}</span>
                         {expandedId === q.id ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
                       </div>
                     </div>
                     {expandedId === q.id && (
                       <div className="px-5 pb-4 border-t border-gray-50 pt-3 space-y-3">
                         <div className="bg-sky-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed">{q.description}</div>
                         {q.response && (
                           <div className="bg-blue-50 rounded-lg p-3">
                             <p className="text-xs font-semibold text-blue-600 mb-1">Applicant Response</p>
                             <p className="text-sm text-gray-700">{q.response}</p>
                           </div>
                         )}
                         {q.status === 'responded' && (
                           <button onClick={() => handleClose(q.id)} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 px-3 py-1.5 rounded-lg transition-colors">
                             <CheckCheck size={13} /> Mark Closed
                           </button>
                         )}
                       </div>
                     )}
                   </div>
                 ))}
               </div>
             )}
    </PageShell>
  );
}

export default function ScrutinyEDSPage() {
  return (
    <Suspense fallback={<SkeletonLoader variant="detail" />}>
      <ScrutinyEDSPageContent />
    </Suspense>
  );
}

