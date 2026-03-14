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
import { useLanguageStore } from '@/store/languageStore';
import { formatUiText, getUiText } from '@/lib/translations';
import { Plus, CheckCheck, ChevronDown, ChevronUp, MessageSquareWarning } from 'lucide-react';

const EDS_CHECKLIST_ITEMS = [
  'PP shall submit processing fee details.',
  'PP shall submit Pre-feasibility report.',
  'PP shall submit Certified compliance Report of Air and Water Consent issued by CECB.',
  'PP shall submit LOI.',
  'PP shall submit LOI Extension copy.',
  'PP shall submit Mining plan approval letter.',
  'PP shall submit approved Mining plan.',
  'PP shall submit details of forest land (if any) and submit Stage 1 and Stage 2 clearance.',
  'PP shall submit Land Documents.',
  'PP shall submit Land Documents and Consent of Land Owners (if applicable).',
  'PP shall submit 200 m, 500 m Certificate.',
  'PP shall submit Gram Panchayat NOC.',
  'PP shall submit DSR (Latest) with Sand Replenishment Study.',
  'PP shall submit Sand Replenishment Study.',
  'PP shall submit Marked and Delimited Copy.',
  'PP shall submit revised Forest NOC from DFO, mentioning all khasra no. of applied area and distance from nearest forest boundary, National Park and Wild Life Sanctuary and Biodiversity Area.',
  'PP shall submit C.E.M.P details for cluster.',
  'PP shall submit updated EIA Report along with updated ToR compliance in Page no. 12, Point 18.',
  'PP shall submit Wild life Conservation plan (Schedule 1 Species as per Nt. Dated 01/4/2023).',
  'PP shall submit Water NOC for Ground water abstraction.',
  'PP shall submit Consent of Land Owners.',
  'PP shall submit notarized affidavit that no schedule 1 species found.',
  'PP shall submit Schedule 1 Species as per Nt. Dated 01/4/2023.',
  'PP shall submit latest past production certificate certified from Mining Department.',
  'PP shall submit CEMP details (if applicable).',
  'PP shall submit Plantation details as per previously issued EC.',
  'PP shall submit Geotagged photographs of applied lease area.',
  'PP shall submit Gram Panchayat NOC mentioning Khasra No.',
  'PP shall submit Self compliance Report of previously issued EC.',
  'PP shall submit Restoration Plan (if excavated).',
  'PP shall submit updated list of Scheduled species as per Nt. Dated 01/4/2023 and Wild life Conservation plan (if applicable).',
  'PP shall submit Panchnama.',
  'PP shall submit Previously issued EC (Environmental Clearance).',
  'PP shall submit PFR.',
  'PP shall submit Land Use / Zoning Map.',
  'PP shall submit Built-up Area Statement.',
  'PP shall submit Building permission copy.',
  'PP shall submit STP Design and Reuse Plan / Disinfection Proposal.',
  'PP shall submit Solid Waste Management Plan.',
  'PP shall submit Solar Energy Plan.',
  'PP shall submit Green Belt Area statement.',
  'PP shall submit EMP Cost Estimates.',
  'PP shall submit NBWL Clearance (if <1km).',
  'PP shall submit Fire NOC.',
  'PP shall submit Aviation NOC (if applicable).',
  'PP shall submit Wildlife Management Plan.',
  'PP shall submit lease deed.',
  'PP shall submit 500 m Certificate.',
  'PP shall submit 200 m Certificate (if applicable).',
  'PP shall submit DSR (Latest).',
  'PP shall submit KML file of applied area with properly demarcated boundary.',
  'PP shall submit drone video of the applied mining lease area.',
  'PP shall submit CER Details with consent from local authority.',
  'PP shall submit all notarized affidavits points related to project.',
  'Bring a hardcopy of District Survey Report (DSR - Latest) with Sand Replenishment Study at the time of Presentation.',
  'Bring a hardcopy of District Survey Report (DSR - Latest) at the time of Presentation.',
  'PP shall submit land documents with khasra No. of applied land and consent of land owners (if applicable).',
  'PP shall submit correct and legible copy of land documents containing khasra No. of applied land and consent of land owners (if applicable).',
] as const;

const DEFAULT_CHECKLIST_STATE = Object.fromEntries(
  EDS_CHECKLIST_ITEMS.map((item) => [item, false])
) as Record<string, boolean>;

function ScrutinyEDSPageContent() {
  const { user } = useAuthStore();
  const { applications, fetchAll } = useWorkflowStore();
  const { language } = useLanguageStore();
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
  const [checklistByApp, setChecklistByApp] = useState<Record<string, Record<string, boolean>>>({});
  const [generatingChecklist, setGeneratingChecklist] = useState(false);
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

  useEffect(() => {
    if (!selectedAppId) return;
    setChecklistByApp((prev) => {
      if (prev[selectedAppId]) return prev;
      return { ...prev, [selectedAppId]: { ...DEFAULT_CHECKLIST_STATE } };
    });
  }, [selectedAppId]);

  const handleRaise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true); setErr(''); setSuccess('');
    try {
      const q = await raiseEDSQuery(selectedAppId, { subject: newSubject, description: newDesc, raisedBy: user.email });
      setQueries((qs) => [...qs, q]);
      setSuccess(formatUiText('edsQueryRaisedSuccess', language, { queryNumber: q.queryNumber }));
      setNewSubject(''); setNewDesc(''); setRaiseMode(false);
    } catch (e) { setErr(e instanceof Error ? e.message : getUiText('submissionFailed', language)); }
    finally { setSubmitting(false); }
  };

  const handleClose = async (queryId: string) => {
    try {
      const updated = await closeEDSQuery(selectedAppId, queryId);
      setQueries((qs) => qs.map((q) => (q.id === queryId ? updated : q)));
      setSuccess(getUiText('edsQueryClosedSuccess', language));
    } catch (e) { setErr(e instanceof Error ? e.message : getUiText('submissionFailed', language)); }
  };

  const currentChecklist = selectedAppId
    ? checklistByApp[selectedAppId] ?? DEFAULT_CHECKLIST_STATE
    : DEFAULT_CHECKLIST_STATE;
  const missingItems = EDS_CHECKLIST_ITEMS.filter((item) => !currentChecklist[item]);

  const toggleChecklistItem = (item: string) => {
    if (!selectedAppId) return;
    setChecklistByApp((prev) => {
      const appChecklist = prev[selectedAppId] ?? { ...DEFAULT_CHECKLIST_STATE };
      return {
        ...prev,
        [selectedAppId]: {
          ...appChecklist,
          [item]: !appChecklist[item],
        },
      };
    });
  };

  const handleGenerateFromChecklist = async () => {
    if (!selectedAppId || !user) return;
    setErr('');
    setSuccess('');

    if (missingItems.length === 0) {
      setSuccess('All checklist points are ticked. No EDS query generated.');
      return;
    }

    setGeneratingChecklist(true);
    try {
      const description = [
        'The following checklist items are missing / pending submission:',
        '',
        ...missingItems.map((item, index) => `${index + 1}. ${item}`),
        '',
        'Please submit the above documents/clarifications on the portal.',
      ].join('\n');

      const q = await raiseEDSQuery(selectedAppId, {
        subject: `EDS Generated from Scrutiny Checklist (${missingItems.length} missing item${missingItems.length > 1 ? 's' : ''})`,
        description,
        raisedBy: user.email,
      });

      setQueries((qs) => [...qs, q]);
      setSuccess(`EDS Query ${q.queryNumber} generated for ${missingItems.length} missing checklist item${missingItems.length > 1 ? 's' : ''}.`);
      setRaiseMode(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to generate EDS query from checklist.');
    } finally {
      setGeneratingChecklist(false);
    }
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
                <h2 className="page-heading" style={{marginBottom:0}}>{getUiText('scrutinyEdsHeading', language)}</h2>
                <p className="page-subheading">{getUiText('scrutinyEdsSubheading', language)}</p>
              </div>
              {selectedAppId && (
                <button onClick={() => setRaiseMode(!raiseMode)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #25c9d0, #179ea8)' }}>
                  <Plus size={15} /> {getUiText('raiseEds', language)}
                </button>
              )}
            </div>

            <div className="glass-card-strong p-4 mb-4">
              <label className="ui-label">{getUiText('selectApplicationLabel', language)}</label>
              <select className={inputCls} value={selectedAppId} onChange={(e) => setSelectedAppId(e.target.value)}>
                <option value="">{getUiText('selectApplicationPromptSimple', language)}</option>
                {applications.map((a) => <option key={a.id} value={a.id}>{a.applicationNumber} — {a.projectName}</option>)}
              </select>
            </div>

            {selectedAppId && (
              <div className="bg-white rounded-xl border border-[#25c9d0]/30 shadow-sm p-5 mb-4">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-700">EDS Document Checklist</h4>
                    <p className="text-xs text-gray-500">Tick items received from project proponent. Unticked items will be added to generated EDS query.</p>
                  </div>
                  <div className="text-xs font-semibold text-gray-600 bg-gray-100 rounded-full px-3 py-1">
                    Checked: {EDS_CHECKLIST_ITEMS.length - missingItems.length} / {EDS_CHECKLIST_ITEMS.length}
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-100">
                  {EDS_CHECKLIST_ITEMS.map((item, index) => (
                    <label key={item} className="flex items-start gap-3 px-3 py-2.5 hover:bg-cyan-50/40 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#164e63] focus:ring-[#164e63]"
                        checked={Boolean(currentChecklist[item])}
                        onChange={() => toggleChecklistItem(item)}
                      />
                      <span className="text-sm text-gray-700 leading-relaxed">{index + 1}. {item}</span>
                    </label>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleGenerateFromChecklist}
                    disabled={generatingChecklist}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #164e63, #1f7ea4)' }}
                  >
                    {generatingChecklist ? 'Generating EDS...' : `Generate EDS for ${missingItems.length} Missing Item${missingItems.length === 1 ? '' : 's'}`}
                  </button>
                </div>
              </div>
            )}

            {success && <div className="mb-3 bg-cyan-50 border border-cyan-200 text-cyan-700 rounded-lg px-4 py-2.5 text-sm font-semibold">{success}</div>}
            {err && <ErrorMessage message={err} className="mb-3" />}

            {raiseMode && (
              <form onSubmit={handleRaise} className="bg-white rounded-xl border border-[#25c9d0]/30 shadow-sm p-5 mb-4 space-y-3">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2"><MessageSquareWarning size={16} className="text-[#25c9d0]" /> {getUiText('newEdsQuery', language)}</h4>
                <div>
                  <label className="ui-label">{getUiText('subjectLabel', language)}</label>
                  <input className={inputCls} value={newSubject} onChange={(e) => setNewSubject(e.target.value)} required placeholder={getUiText('waterRequirementExample', language)} />
                </div>
                <div>
                  <label className="ui-label">{getUiText('descriptionLabel', language)}</label>
                  <textarea rows={4} className={`${inputCls} resize-none`} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} required placeholder={getUiText('detailedQueryPlaceholder', language)} />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #164e63, #1f7ea4)' }}>
                    {submitting ? getUiText('raising', language) : getUiText('raiseQuery', language)}
                  </button>
                  <button type="button" onClick={() => setRaiseMode(false)} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50">Cancel</button>
                </div>
              </form>
            )}

            {loading ? <SkeletonLoader /> :
             !selectedAppId ? null :
             queries.length === 0 ? <EmptyState title={getUiText('noEdsQueriesTitle', language)} message={getUiText('noEdsQueriesMessage', language)} /> : (
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
                             <p className="ui-section-title-text mb-1">{getUiText('applicantResponse', language)}</p>
                             <p className="text-sm text-gray-700">{q.response}</p>
                           </div>
                         )}
                         {q.status === 'responded' && (
                           <button onClick={() => handleClose(q.id)} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 px-3 py-1.5 rounded-lg transition-colors">
                             <CheckCheck size={13} /> {getUiText('markClosed', language)}
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

