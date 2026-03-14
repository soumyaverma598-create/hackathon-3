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
import { useLanguageStore } from '@/store/languageStore';
import { getUiText } from '@/lib/translations';
import { formatAppId } from '@/lib/utils';
import { Send, CheckCircle } from 'lucide-react';

function ScrutinyReferPageContent() {
  const { user } = useAuthStore();
  const { applications, fetchAll, updateStatus, isLoading, error } = useWorkflowStore();
  const { language } = useLanguageStore();
  const router = useRouter();
  const params = useSearchParams();
  const [selectedAppId, setSelectedAppId] = useState(params.get('id') ?? '');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingNumber, setMeetingNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    fetchAll();
  }, [user]);

  const handleRefer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId) return;
    setSubmitting(true); setSuccess('');
    await updateStatus(selectedAppId, 'referred', remarks);
    setSuccess(getUiText('referredSuccess', language));
    setSubmitting(false);
  };

  if (!user) return null;

  const eligible = applications.filter((a) => ['under_scrutiny', 'eds_raised'].includes(a.status));
  const selectedApp = applications.find((a) => a.id === selectedAppId);
  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#164e63]";

  return (
    <PageShell role="scrutiny">
            <h2 className="page-heading">{getUiText('referPageHeading', language)}</h2>
            <p className="page-subheading mb-6">{getUiText('referPageSubheading', language)}</p>

            {isLoading ? <SkeletonLoader /> : error ? <ErrorMessage message={error} /> : (
              <div className="space-y-4">
                {success && (
                  <div className="flex items-center gap-2 bg-cyan-50 border border-cyan-200 text-cyan-700 rounded-xl px-4 py-3 text-sm font-semibold">
                    <CheckCircle size={16} /> {success}
                  </div>
                )}

                <div className="glass-card-strong p-5">
                  <form onSubmit={handleRefer} className="space-y-4">
                    <div>
                      <label className="ui-label">{getUiText('applicationToRefer', language)}</label>
                      <select className={inputCls} value={selectedAppId} onChange={(e) => setSelectedAppId(e.target.value)} required>
                        <option value="">{getUiText('selectApplicationPromptSimple', language)}</option>
                        {eligible.map((a) => <option key={a.id} value={a.id}>{formatAppId(a.applicationNumber)} — {a.projectName}</option>)}
                      </select>
                    </div>

                    {selectedApp && (
                      <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-700">{selectedApp.projectName}</p>
                          <p className="text-xs text-gray-400">{selectedApp.stateUT} &bull; Cat {selectedApp.projectCategory}</p>
                        </div>
                        <StatusBadge status={selectedApp.status} />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="ui-label">{getUiText('eacMeetingDate', language)}</label>
                        <input type="date" className={inputCls} value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} />
                      </div>
                      <div>
                        <label className="ui-label">{getUiText('meetingNumber', language)}</label>
                        <input className={inputCls} value={meetingNumber} onChange={(e) => setMeetingNumber(e.target.value)} placeholder="e.g. EAC-2026-03/07" />
                      </div>
                    </div>

                    <div>
                      <label className="ui-label">{getUiText('referralRemarks', language)}</label>
                      <textarea rows={4} className={`${inputCls} resize-none`} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder={getUiText('referralRemarksPlaceholder', language)} />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !selectedAppId}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-all"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
                    >
                      <Send size={15} /> {submitting ? getUiText('referring', language) : getUiText('referToEacButton', language)}
                    </button>
                  </form>
                </div>

                {/* Already referred */}
                {applications.filter((a) => a.status === 'referred').length > 0 && (
                  <div className="glass-card-strong p-4">
                    <h4 className="ui-section-title-text mb-3">{getUiText('previouslyReferred', language)}</h4>
                    <div className="divide-y divide-gray-50">
                      {applications.filter((a) => a.status === 'referred').map((a) => (
                        <div key={a.id} className="flex items-center justify-between py-2.5">
                          <div>
                            <p className="text-sm font-medium text-gray-700 truncate max-w-xs">{a.projectName}</p>
                            <p className="text-xs text-gray-400 font-mono">{formatAppId(a.applicationNumber)}</p>
                          </div>
                          <StatusBadge status={a.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
    </PageShell>
  );
}

export default function ScrutinyReferPage() {
  return (
    <Suspense fallback={<SkeletonLoader variant="detail" />}>
      <ScrutinyReferPageContent />
    </Suspense>
  );
}

