'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useWorkflowStore } from '@/store/workflowStore';
import GovHeader from '@/components/GovHeader';
import Sidebar from '@/components/Sidebar';
import SkeletonLoader from '@/components/SkeletonLoader';
import ErrorMessage from '@/components/ErrorMessage';
import WorkflowProgress from '@/components/WorkflowProgress';
import StatusBadge from '@/components/StatusBadge';
import { getMom, editMom, generateMomDoc, finalizeMom, downloadCertificate } from '@/lib/api';
import { CheckCircle, FileDown, ScrollText, Stamp } from 'lucide-react';

export default function MomFinalizePage() {
  const { user } = useAuthStore();
  const { applications, fetchAll, isLoading, error: storeError } = useWorkflowStore();
  const router = useRouter();
  const params = useSearchParams();
  const [selectedAppId, setSelectedAppId] = useState(params.get('id') ?? '');
  const [momContent, setMomContent] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingNumber, setMeetingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');
  const [certUrl, setCertUrl] = useState('');

  const selectedApp = applications.find((a) => a.id === selectedAppId);

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    fetchAll();
  }, [user]);

  useEffect(() => {
    if (!selectedAppId) return;
    getMom(selectedAppId).then((data) => {
      setMomContent(data.momContent ?? '');
      setMeetingDate(data.meetingDate ?? '');
      setMeetingNumber(data.meetingNumber ?? '');
    }).catch(() => {});
  }, [selectedAppId]);

  const doSave = async () => {
    setLoading(true); setErr(''); setSuccess('');
    try {
      await editMom(selectedAppId, { momContent, meetingDate, meetingNumber });
      setSuccess('MoM content saved successfully.');
      fetchAll();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Save failed.'); }
    finally { setLoading(false); }
  };

  const doGenerate = async () => {
    setLoading(true); setErr(''); setSuccess('');
    try {
      await generateMomDoc(selectedAppId);
      setSuccess('MoM document generated and ready for download.');
    } catch (e) { setErr(e instanceof Error ? e.message : 'Generation failed.'); }
    finally { setLoading(false); }
  };

  const doFinalize = async () => {
    if (!confirm('Finalizing will issue the EC Certificate. This action cannot be undone. Proceed?')) return;
    setLoading(true); setErr(''); setSuccess('');
    try {
      await finalizeMom(selectedAppId);
      const cert = await downloadCertificate(selectedAppId);
      setCertUrl(cert.url);
      setSuccess(`EC Certificate issued! File: ${cert.filename}`);
      fetchAll();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Finalization failed.'); }
    finally { setLoading(false); }
  };

  if (!user) return null;

  const eligible = applications.filter((a) => ['referred', 'mom_draft', 'finalized'].includes(a.status));
  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c] transition-all";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <GovHeader />
      <div className="flex flex-1">
        <Sidebar role="mom" />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Finalize & Issue EC</h2>
            <p className="text-gray-400 text-sm mb-6">Edit Minutes of Meeting, generate MoM document, and issue Environmental Clearance certificate</p>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Select Application</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]" value={selectedAppId} onChange={(e) => setSelectedAppId(e.target.value)}>
                <option value="">-- Select application --</option>
                {eligible.map((a) => <option key={a.id} value={a.id}>{a.applicationNumber} — {a.projectName}</option>)}
              </select>
            </div>

            {err && <ErrorMessage message={err} className="mb-4" />}

            {success && (
              <div className="mb-4 flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-semibold">
                <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p>{success}</p>
                  {certUrl && (
                    <a href={certUrl} className="flex items-center gap-1 text-green-700 underline mt-1 text-xs" target="_blank">
                      <FileDown size={12} /> Download EC Certificate
                    </a>
                  )}
                </div>
              </div>
            )}

            {storeError && <ErrorMessage message={storeError} className="mb-4" />}

            {isLoading && !selectedApp ? <SkeletonLoader variant="detail" /> : selectedApp ? (
              <div className="space-y-4">
                <WorkflowProgress currentStatus={selectedApp.status} />

                <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl shadow-sm px-5 py-3">
                  <div>
                    <p className="font-semibold text-gray-800">{selectedApp.projectName}</p>
                    <p className="text-xs text-gray-400">{selectedApp.applicationNumber} &bull; {selectedApp.stateUT} &bull; Cat {selectedApp.projectCategory}</p>
                  </div>
                  <StatusBadge status={selectedApp.status} />
                </div>

                {/* MoM Editor */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <ScrollText size={16} className="text-[#1a6b3c]" /> Minutes of Meeting
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Meeting Date</label>
                      <input type="date" className={inputCls} value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Meeting Number</label>
                      <input className={inputCls} value={meetingNumber} onChange={(e) => setMeetingNumber(e.target.value)} placeholder="e.g. EAC-2026-03/07" />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">MoM Content</label>
                    <textarea
                      rows={12}
                      className={`${inputCls} resize-y font-mono text-xs`}
                      value={momContent}
                      onChange={(e) => setMomContent(e.target.value)}
                      placeholder="Paste or type the full Minutes of Meeting here..."
                    />
                  </div>
                  <button onClick={doSave} disabled={loading || !selectedAppId} className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #1a6b3c, #256b45)' }}>
                    {loading ? 'Saving…' : 'Save MoM'}
                  </button>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-700 mb-4">Issue Environmental Clearance</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={doGenerate}
                      disabled={loading || !selectedAppId}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      <ScrollText size={15} /> {loading ? 'Generating…' : 'Generate MoM PDF'}
                    </button>

                    {selectedApp.status !== 'finalized' && (
                      <button
                        onClick={doFinalize}
                        disabled={loading || !selectedAppId}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-all shadow-md"
                        style={{ background: 'linear-gradient(135deg, #1a6b3c, #f7941d)' }}
                      >
                        <Stamp size={15} /> {loading ? 'Finalizing…' : 'Finalize & Issue EC Certificate'}
                      </button>
                    )}

                    {selectedApp.status === 'finalized' && (
                      <button
                        onClick={async () => { const c = await downloadCertificate(selectedApp.id); window.open(c.url); }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors"
                      >
                        <FileDown size={15} /> Download EC Certificate
                      </button>
                    )}
                  </div>

                  {selectedApp.status === 'finalized' && (
                    <div className="mt-4 flex items-center gap-2 text-green-700 text-sm font-semibold bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
                      <CheckCircle size={16} /> EC Certificate has been issued. Finalized on {selectedApp.finalizedAt ? new Date(selectedApp.finalizedAt).toLocaleDateString('en-IN') : '—'}.
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
