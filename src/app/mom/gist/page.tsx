'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useWorkflowStore } from '@/store/workflowStore';
import PageShell from '@/components/PageShell';
import SkeletonLoader from '@/components/SkeletonLoader';
import ErrorMessage from '@/components/ErrorMessage';
import { generateGist, getGist } from '@/lib/api';
import { GistContent } from '@/types/workflow';
import { useLanguageStore } from '@/store/languageStore';
import { formatUiText, getUiText } from '@/lib/translations';
import { formatAppId } from '@/lib/utils';
import { Sparkles, Edit3, CheckCircle, BookOpen } from 'lucide-react';

const GistField = ({
  label,
  field,
  rows = 3,
  value,
  editMode,
  onChange
}: {
  label: string;
  field: keyof GistContent;
  rows?: number;
  value: string;
  editMode: boolean;
  onChange: (field: keyof GistContent, value: string) => void;
}) => {
  return (
    <div>
      <label className="ui-label">{label}</label>
      {editMode ? (
        <textarea
          rows={rows}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#164e63] resize-none"
          value={value ?? ''}
          onChange={(e) => onChange(field, e.target.value)}
        />
      ) : (
        <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">{value}</p>
      )}
    </div>
  );
};

function GistPageContent() {
  const { user } = useAuthStore();
  const { applications, fetchAll, isLoading, error } = useWorkflowStore();
  const { language } = useLanguageStore();
  const router = useRouter();
  const params = useSearchParams();
  const [selectedAppId, setSelectedAppId] = useState(params.get('id') ?? '');
  const [gist, setGist] = useState<GistContent | null>(null);
  const [generating, setGenerating] = useState(false);
  const [fetchingGist, setFetchingGist] = useState(false);
  const [genError, setGenError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [edited, setEdited] = useState<Partial<GistContent>>({});

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    fetchAll();
  }, [user]);

  useEffect(() => {
    if (!selectedAppId) { setGist(null); return; }
    setFetchingGist(true);
    getGist(selectedAppId).then(setGist).catch(() => setGist(null)).finally(() => setFetchingGist(false));
  }, [selectedAppId]);

  const handleGenerate = async () => {
    if (!selectedAppId) return;
    setGenerating(true); setGenError('');
    try {
      const g = await generateGist(selectedAppId);
      setGist(g);
    } catch (e) { setGenError(e instanceof Error ? e.message : getUiText('gistGenerateFailed', language)); }
    finally { setGenerating(false); }
  };

  if (!user) return null;

  const referred = applications.filter((a) => ['referred', 'mom_draft'].includes(a.status));

  const handleFieldChange = (field: keyof GistContent, value: string) => {
    setEdited((ed) => ({ ...ed, [field]: value }));
  };

  const localeMap = {
    en: 'en-IN',
    hi: 'hi-IN',
  } as const;
  const locale = localeMap[language] ?? 'en-IN';

  return (
    <PageShell role="mom">
            <h2 className="page-heading">{getUiText('generateGistHeading', language)}</h2>
            <p className="page-subheading mb-6">{getUiText('generateGistSubheading', language)}</p>

            <div className="glass-card-strong p-4 mb-4">
              <label className="ui-label">{getUiText('selectApplicationLabel', language)}</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#164e63]"
                value={selectedAppId} onChange={(e) => setSelectedAppId(e.target.value)}
              >
                <option value="">{getUiText('selectReferredApplicationPrompt', language)}</option>
                {referred.map((a) => <option key={a.id} value={a.id}>{formatAppId(a.applicationNumber)} — {a.projectName}</option>)}
              </select>
            </div>

            {genError && <ErrorMessage message={genError} className="mb-4" />}

            {selectedAppId && !gist && !fetchingGist && (
              <div className="bg-white rounded-xl border border-dashed border-[#164e63]/30 p-10 text-center">
                <BookOpen size={40} className="text-[#164e63]/40 mx-auto mb-3" />
                <p className="text-gray-500 text-sm mb-4">{getUiText('noGistGenerated', language)}</p>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #164e63, #1f7ea4)' }}
                >
                  <Sparkles size={16} /> {generating ? getUiText('generating', language) : getUiText('generateGistWithAi', language)}
                </button>
              </div>
            )}

            {fetchingGist && <SkeletonLoader variant="detail" />}

            {gist && (
              <div className="glass-card-strong p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2"><BookOpen size={18} className="text-[#164e63]" /> {getUiText('projectGist', language)}</h3>
                  <div className="flex items-center gap-2">
                    {editMode ? (
                      <>
                        <button
                          onClick={() => { setGist((g) => g ? { ...g, ...edited } : g); setEditMode(false); setEdited({}); }}
                          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#164e63] hover:bg-[#0f3650] px-3 py-1.5 rounded-lg"
                        >
                          <CheckCircle size={13} /> {getUiText('saveLabel', language)}
                        </button>
                        <button onClick={() => { setEditMode(false); setEdited({}); }} className="text-xs font-semibold text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg">Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => setEditMode(true)} className="flex items-center gap-1.5 text-xs font-semibold text-[#164e63] border border-[#164e63]/30 hover:bg-cyan-50 px-3 py-1.5 rounded-lg">
                        <Edit3 size={13} /> {getUiText('editLabel', language)}
                      </button>
                    )}
                    <button
                      onClick={handleGenerate}
                      disabled={generating}
                      className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#25c9d0] hover:bg-[#179ea8] px-3 py-1.5 rounded-lg disabled:opacity-50"
                    >
                      <Sparkles size={13} /> {generating ? getUiText('regenerating', language) : getUiText('regenerate', language)}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-400">{formatUiText('generatedOn', language, { date: new Date(gist.generatedAt).toLocaleString(locale) })}</p>

                <GistField
                  label={getUiText('projectBackground', language)}
                  field="projectBackground"
                  rows={3}
                  value={(edited.projectBackground ?? gist?.projectBackground) || ''}
                  editMode={editMode}
                  onChange={handleFieldChange}
                />
                <GistField
                  label={getUiText('proposalDetails', language)}
                  field="proposalDetails"
                  rows={3}
                  value={(edited.proposalDetails ?? gist?.proposalDetails) || ''}
                  editMode={editMode}
                  onChange={handleFieldChange}
                />
                <GistField
                  label={getUiText('environmentalImpact', language)}
                  field="environmentalImpact"
                  rows={4}
                  value={(edited.environmentalImpact ?? gist?.environmentalImpact) || ''}
                  editMode={editMode}
                  onChange={handleFieldChange}
                />
                <GistField
                  label={getUiText('mitigationMeasures', language)}
                  field="mitigationMeasures"
                  rows={4}
                  value={(edited.mitigationMeasures ?? gist?.mitigationMeasures) || ''}
                  editMode={editMode}
                  onChange={handleFieldChange}
                />
                <GistField
                  label={getUiText('recommendation', language)}
                  field="recommendation"
                  rows={2}
                  value={(edited.recommendation ?? gist?.recommendation) || ''}
                  editMode={editMode}
                  onChange={handleFieldChange}
                />
              </div>
            )}
    </PageShell>
  );
}

export default function GistPage() {
  return (
    <Suspense fallback={<SkeletonLoader variant="detail" />}>
      <GistPageContent />
    </Suspense>
  );
}

