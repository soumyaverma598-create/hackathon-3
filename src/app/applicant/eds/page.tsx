'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useWorkflowStore } from '@/store/workflowStore';
import GovHeader from '@/components/GovHeader';
import Sidebar from '@/components/Sidebar';
import SkeletonLoader from '@/components/SkeletonLoader';
import ErrorMessage from '@/components/ErrorMessage';
import EmptyState from '@/components/EmptyState';
import StatusBadge from '@/components/StatusBadge';
import { getEDSQueries, respondToEDS } from '@/lib/api';
import { EDSQuery } from '@/types/workflow';
import { MessageSquare, Send, ChevronDown, ChevronUp } from 'lucide-react';

export default function ApplicantEDSPage() {
  const { user } = useAuthStore();
  const { applications, fetchByProponent } = useWorkflowStore();
  const router = useRouter();
  const params = useSearchParams();
  const [selectedAppId, setSelectedAppId] = useState(params.get('id') ?? '');
  const [queries, setQueries] = useState<EDSQuery[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [successMsg, setSuccessMsg] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    fetchByProponent(user.email);
  }, [user]);

  useEffect(() => {
    if (!selectedAppId) return;
    setLoading(true);
    getEDSQueries(selectedAppId)
      .then((qs) => setQueries(qs))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedAppId]);

  const handleRespond = async (queryId: string) => {
    if (!responses[queryId]?.trim()) return;
    setSubmitting((s) => ({ ...s, [queryId]: true }));
    try {
      const updated = await respondToEDS(selectedAppId, queryId, { response: responses[queryId] });
      setQueries((qs) => qs.map((q) => (q.id === queryId ? updated : q)));
      setSuccessMsg((s) => ({ ...s, [queryId]: 'Response submitted successfully!' }));
      setResponses((r) => ({ ...r, [queryId]: '' }));
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMsg((s) => ({ ...s, [queryId]: '' }));
      }, 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submission failed.');
    } finally {
      setSubmitting((s) => ({ ...s, [queryId]: false }));
    }
  };

  if (!user) return null;

  const edsBadge: Record<EDSQuery['status'], string> = {
    open: 'bg-orange-100 text-orange-700',
    responded: 'bg-blue-100 text-blue-700',
    closed: 'bg-green-100 text-green-700',
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <GovHeader />
      <div className="flex flex-1">
        <Sidebar role="applicant" />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">EDS Queries</h2>
            <p className="text-gray-400 text-sm mb-6">Respond to Environmental Data Sheet queries raised by the scrutiny officer</p>

            {/* Application Selector */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Select Application</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]"
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
              >
                <option value="">-- Select an application --</option>
                {applications.map((a) => (
                  <option key={a.id} value={a.id}>{a.applicationNumber} — {a.projectName}</option>
                ))}
              </select>
            </div>

            {loading ? <SkeletonLoader /> :
             error ? <ErrorMessage message={error} /> :
             !selectedAppId ? null :
             queries.length === 0 ? (
               <EmptyState title="No EDS queries" message="No Environmental Data Sheet queries have been raised on this application." />
             ) : (
               <div className="space-y-3">
                 {queries.map((q) => (
                   <div key={q.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                     <div
                       className="flex items-start justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50"
                       onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                     >
                       <div className="flex items-start gap-3 flex-1 min-w-0">
                         <MessageSquare size={18} className="text-[#f7941d] mt-0.5 flex-shrink-0" />
                         <div className="min-w-0">
                           <span className="text-xs font-mono text-gray-400">{q.queryNumber}</span>
                           <p className="font-semibold text-gray-700 text-sm">{q.subject}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-2">
                         <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${edsBadge[q.status]}`}>{q.status}</span>
                         {expandedId === q.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                       </div>
                     </div>

                     {expandedId === q.id && (
                       <div className="px-5 pb-5 border-t border-gray-50">
                         <div className="bg-orange-50 rounded-lg p-3 mt-3 mb-4">
                           <p className="text-xs font-semibold text-orange-600 mb-1">Query Description</p>
                           <p className="text-sm text-gray-700 leading-relaxed">{q.description}</p>
                           <p className="text-xs text-gray-400 mt-2">Raised by {q.raisedBy} on {new Date(q.raisedAt).toLocaleDateString('en-IN')}</p>
                         </div>

                         {q.response && (
                           <div className="bg-blue-50 rounded-lg p-3 mb-4">
                             <p className="text-xs font-semibold text-blue-600 mb-1">Your Response</p>
                             <p className="text-sm text-gray-700 leading-relaxed">{q.response}</p>
                             <p className="text-xs text-gray-400 mt-2">Responded on {q.respondedAt ? new Date(q.respondedAt).toLocaleDateString('en-IN') : '—'}</p>
                           </div>
                         )}

                         {successMsg[q.id] && (
                           <p className="text-sm text-green-600 font-semibold mb-3">{successMsg[q.id]}</p>
                         )}

                         {q.status === 'open' && (
                           <div>
                             <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                               Submit Response
                             </label>
                             <textarea
                               rows={4}
                               className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c] resize-none"
                               placeholder="Type your detailed response here..."
                               value={responses[q.id] ?? ''}
                               onChange={(e) => setResponses((r) => ({ ...r, [q.id]: e.target.value }))}
                             />
                             <button
                               onClick={() => handleRespond(q.id)}
                               disabled={submitting[q.id] || !responses[q.id]?.trim()}
                               className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
                               style={{ background: 'linear-gradient(135deg, #1a6b3c, #256b45)' }}
                             >
                               <Send size={14} /> {submitting[q.id] ? 'Submitting…' : 'Submit Response'}
                             </button>
                           </div>
                         )}
                       </div>
                     )}
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
