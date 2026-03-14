'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useWorkflowStore } from '@/store/workflowStore';
import PageShell from '@/components/PageShell';
import SkeletonLoader from '@/components/SkeletonLoader';
import ErrorMessage from '@/components/ErrorMessage';
import { Upload, FileText, Trash2, CheckCircle } from 'lucide-react';
import { uploadDocuments } from '@/lib/api';

function DocumentsPageContent() {
  const { user } = useAuthStore();
  const { applications, isLoading, error, fetchByProponent, fetchAll } = useWorkflowStore();
  const router = useRouter();
  const params = useSearchParams();
  const [selectedAppId, setSelectedAppId] = useState(params.get('id') ?? '');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    fetchByProponent(user.email);
  }, [user]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !selectedAppId) return;
    const fd = new FormData();
    Array.from(e.target.files).forEach((f) => fd.append('documents', f));
    setUploading(true); setUploadError(''); setUploadSuccess('');
    try {
      await uploadDocuments(selectedAppId, fd);
      setUploadSuccess(`${e.target.files.length} file(s) uploaded successfully.`);
      fetchByProponent(user?.email ?? '');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  const selectedApp = applications.find((a) => a.id === selectedAppId);

  return (
    <PageShell role="applicant">
            <h2 className="page-heading">Upload Documents</h2>
            <p className="page-subheading mb-6">Upload EIA report, site plan, ToR, and other supporting documents</p>

            {isLoading ? <SkeletonLoader /> : error ? <ErrorMessage message={error} /> : (
              <div className="space-y-4">
                {/* Select Application */}
                <div className="glass-card-strong p-4">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Select Application</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]"
                    value={selectedAppId}
                    onChange={(e) => { setSelectedAppId(e.target.value); setUploadSuccess(''); setUploadError(''); }}
                  >
                    <option value="">-- Select an application --</option>
                    {applications.map((a) => (
                      <option key={a.id} value={a.id}>{a.applicationNumber} — {a.projectName}</option>
                    ))}
                  </select>
                </div>

                {/* Upload zone */}
                {selectedAppId && (
                  <div className="glass-card-strong p-6">
                    <h3 className="font-semibold text-gray-700 mb-4">Upload Files</h3>

                    {uploadSuccess && (
                      <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
                        <CheckCircle size={16} /> {uploadSuccess}
                      </div>
                    )}
                    {uploadError && <ErrorMessage message={uploadError} className="mb-4" />}

                    <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-all ${uploading ? 'border-gray-200 bg-gray-50' : 'border-[#1a6b3c]/40 hover:border-[#1a6b3c] hover:bg-green-50'}`}>
                      <Upload size={32} className={uploading ? 'text-gray-300' : 'text-[#1a6b3c]'} />
                      <p className="mt-3 text-sm font-semibold text-gray-600">
                        {uploading ? 'Uploading…' : 'Click to upload or drag & drop'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, JPG, PNG — Max 25 MB each</p>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={uploading}
                      />
                    </label>

                    {/* Existing docs */}
                    {selectedApp && selectedApp.documents.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Uploaded Documents ({selectedApp.documents.length})</h4>
                        <div className="space-y-2">
                          {selectedApp.documents.map((doc) => (
                            <div key={doc.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
                              <FileText size={16} className="text-[#1a6b3c] flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-700 truncate">{doc.name}</p>
                                <p className="text-xs text-gray-400">{(doc.size / 1024 / 1024).toFixed(2)} MB &bull; {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}</p>
                              </div>
                              <button className="text-gray-300 hover:text-red-400 transition-colors p-1">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
    </PageShell>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<SkeletonLoader variant="detail" />}>
      <DocumentsPageContent />
    </Suspense>
  );
}
