'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useWorkflowStore } from '@/store/workflowStore';
import PageShell from '@/components/PageShell';
import SkeletonLoader from '@/components/SkeletonLoader';
import ErrorMessage from '@/components/ErrorMessage';
import StatusBadge from '@/components/StatusBadge';
import WorkflowProgress from '@/components/WorkflowProgress';
import { WorkflowStatus } from '@/types/workflow';
import { ChevronLeft, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import Link from 'next/link';

function ScrutinyReviewPageContent() {
  const { user } = useAuthStore();
  const { currentApplication: app, fetchById, updateStatus, isLoading, error } = useWorkflowStore();
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id');
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    if (!id) { router.push('/scrutiny/dashboard'); return; }
    fetchById(id);
  }, [user, id]);

  const doAction = async (status: WorkflowStatus, label: string) => {
    if (!app) return;
    setActionLoading(true); setSuccess('');
    await updateStatus(app.id, status, remarks);
    setSuccess(`Application status updated to "${label}".`);
    setActionLoading(false);
  };

  if (!user) return null;

  return (
    <PageShell role="scrutiny">
            <div className="flex items-center gap-3 mb-5">
              <Link href="/scrutiny/dashboard" className="text-gray-400 hover:text-[#1a6b3c] transition-colors">
                <ChevronLeft size={20} />
              </Link>
              <h2 className="page-heading" style={{marginBottom:0}}>Application Review</h2>
            </div>

            {isLoading && !app ? <SkeletonLoader variant="detail" /> :
             error ? <ErrorMessage message={error} onRetry={() => id && fetchById(id)} /> :
             !app ? null : (
              <div className="space-y-4">
                {success && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-semibold">
                    <CheckCircle size={16} /> {success}
                  </div>
                )}

                <WorkflowProgress currentStatus={app.status} />

                {/* App Details */}
                <div className="glass-card-strong p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-mono text-xs text-gray-400">{app.applicationNumber}</p>
                      <h3 className="text-lg font-bold text-gray-800 mt-0.5">{app.projectName}</h3>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {[
                      { label: 'Proponent', value: app.proponentName },
                      { label: 'Email', value: app.proponentEmail },
                      { label: 'Phone', value: app.proponentPhone },
                      { label: 'Category', value: `Category ${app.projectCategory}` },
                      { label: 'Sector', value: app.projectSector },
                      { label: 'State / UT', value: app.stateUT },
                      { label: 'District', value: app.district },
                      { label: 'Project Cost', value: `₹${(app.projectCost / 10_000_000).toFixed(2)} Cr` },
                      { label: 'Project Area', value: `${app.projectArea} ha` },
                      { label: 'Payment', value: app.paymentStatus },
                      { label: 'Submitted', value: app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('en-IN') : '—' },
                      { label: 'Documents', value: `${app.documents.length} uploaded` },
                    ].map((f) => (
                      <div key={f.label} className="bg-gray-50 rounded-lg px-3 py-2.5">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{f.label}</p>
                        <p className="font-semibold text-gray-700 text-xs mt-0.5">{f.value}</p>
                      </div>
                    ))}
                  </div>

                  {app.documents.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Uploaded Documents</p>
                      <div className="space-y-1.5">
                        {app.documents.map((d) => (
                          <div key={d.id} className="flex items-center gap-2 text-xs text-gray-600">
                            <FileText size={13} className="text-[#1a6b3c] flex-shrink-0" />
                            <span>{d.name}</span>
                            <span className="text-gray-300">({(d.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {app.edsQueries.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">EDS Queries ({app.edsQueries.length})</p>
                      <div className="space-y-1.5">
                        {app.edsQueries.map((q) => (
                          <div key={q.id} className="flex items-center gap-2 text-xs">
                            <AlertTriangle size={13} className="text-orange-400 flex-shrink-0" />
                            <span className="text-gray-600">{q.queryNumber}: {q.subject}</span>
                            <span className={`ml-auto px-2 py-0.5 rounded-full font-semibold ${q.status === 'open' ? 'bg-orange-100 text-orange-600' : q.status === 'responded' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                              {q.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="glass-card-strong p-5">
                  <h4 className="font-semibold text-gray-700 mb-3">Scrutiny Actions</h4>
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Remarks</label>
                    <textarea
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c] resize-none"
                      placeholder="Add review remarks (optional for most actions)..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {app.status === 'submitted' && (
                      <button
                        onClick={() => doAction('under_scrutiny', 'Under Scrutiny')}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 transition-colors"
                      >
                        Take Up for Scrutiny
                      </button>
                    )}
                    <Link href={`/scrutiny/eds?id=${app.id}`}>
                      <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors">
                        Raise EDS Query
                      </button>
                    </Link>
                    <Link href={`/scrutiny/refer?id=${app.id}`}>
                      <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors">
                        Refer to EAC
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
             )}
    </PageShell>
  );
}

export default function ScrutinyReviewPage() {
  return (
    <Suspense fallback={<SkeletonLoader variant="detail" />}>
      <ScrutinyReviewPageContent />
    </Suspense>
  );
}

