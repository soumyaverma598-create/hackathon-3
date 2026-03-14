'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useWorkflowStore } from '@/store/workflowStore';
import PageShell from '@/components/PageShell';
import SkeletonLoader from '@/components/SkeletonLoader';
import ErrorMessage from '@/components/ErrorMessage';
import { generateGist, getGist } from '@/lib/api';
import { GistContent } from '@/types/workflow';
import { Sparkles, Edit3, CheckCircle, BookOpen } from 'lucide-react';

// GistField component moved outside to prevent re-renders
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
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      {editMode ? (
        <textarea 
          rows={rows} 
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c] resize-none" 
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
    } catch (e) { setGenError(e instanceof Error ? e.message : 'Failed to generate gist.'); }
    finally { setGenerating(false); }
  };

  if (!user) return null;

  const referred = applications.filter((a) => ['referred', 'mom_draft'].includes(a.status));

  const handleFieldChange = (field: keyof GistContent, value: string) => {
    setEdited((ed) => ({ ...ed, [field]: value }));
  };

  return (
    <PageShell role="mom">
            <h2 className="page-heading">Generate Gist</h2>
            <p className="page-subheading mb-6">Auto-generate and edit the project summary gist for EAC appraisal</p>

            <div className="glass-card-strong p-4 mb-4">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Select Application</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]"
                value={selectedAppId} onChange={(e) => setSelectedAppId(e.target.value)}
              >
                <option value="">-- Select referred application --</option>
                {referred.map((a) => <option key={a.id} value={a.id}>{a.applicationNumber} — {a.projectName}</option>)}
              </select>
            </div>

            {genError && <ErrorMessage message={genError} className="mb-4" />}

            {selectedAppId && !gist && !fetchingGist && (
              <div className="bg-white rounded-xl border border-dashed border-[#1a6b3c]/30 p-10 text-center">
                <BookOpen size={40} className="text-[#1a6b3c]/40 mx-auto mb-3" />
                <p className="text-gray-500 text-sm mb-4">No gist generated yet for this application.</p>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #1a6b3c, #256b45)' }}
                >
                  <Sparkles size={16} /> {generating ? 'Generating…' : 'Generate Gist with AI'}
                </button>
              </div>
            )}

            {fetchingGist && <SkeletonLoader variant="detail" />}

            {gist && (
              <div className="glass-card-strong p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2"><BookOpen size={18} className="text-[#1a6b3c]" /> Project Gist</h3>
                  <div className="flex items-center gap-2">
                    {editMode ? (
                      <>
                        <button
                          onClick={() => { setGist((g) => g ? { ...g, ...edited } : g); setEditMode(false); setEdited({}); }}
                          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#1a6b3c] hover:bg-[#0f4a2a] px-3 py-1.5 rounded-lg"
                        >
                          <CheckCircle size={13} /> Save
                        </button>
                        <button onClick={() => { setEditMode(false); setEdited({}); }} className="text-xs font-semibold text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg">Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => setEditMode(true)} className="flex items-center gap-1.5 text-xs font-semibold text-[#1a6b3c] border border-[#1a6b3c]/30 hover:bg-green-50 px-3 py-1.5 rounded-lg">
                        <Edit3 size={13} /> Edit
                      </button>
                    )}
                    <button
                      onClick={handleGenerate}
                      disabled={generating}
                      className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#f7941d] hover:bg-[#e07a10] px-3 py-1.5 rounded-lg disabled:opacity-50"
                    >
                      <Sparkles size={13} /> {generating ? 'Regenerating…' : 'Regenerate'}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-400">Generated: {new Date(gist.generatedAt).toLocaleString('en-IN')}</p>

                <GistField 
                  label="Project Background" 
                  field="projectBackground" 
                  rows={3} 
                  value={(edited.projectBackground ?? gist?.projectBackground) || ''} 
                  editMode={editMode} 
                  onChange={handleFieldChange} 
                />
                <GistField 
                  label="Proposal Details" 
                  field="proposalDetails" 
                  rows={3} 
                  value={(edited.proposalDetails ?? gist?.proposalDetails) || ''} 
                  editMode={editMode} 
                  onChange={handleFieldChange} 
                />
                <GistField 
                  label="Environmental Impact" 
                  field="environmentalImpact" 
                  rows={4} 
                  value={(edited.environmentalImpact ?? gist?.environmentalImpact) || ''} 
                  editMode={editMode} 
                  onChange={handleFieldChange} 
                />
                <GistField 
                  label="Mitigation Measures" 
                  field="mitigationMeasures" 
                  rows={4} 
                  value={(edited.mitigationMeasures ?? gist?.mitigationMeasures) || ''} 
                  editMode={editMode} 
                  onChange={handleFieldChange} 
                />
                <GistField 
                  label="Recommendation" 
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

