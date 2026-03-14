'use client';

import { memo, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useWorkflowStore } from '@/store/workflowStore';
import GovHeader from '@/components/GovHeader';
import Sidebar from '@/components/Sidebar';
import { WorkflowApplication, ProjectCategory } from '@/types/workflow';
import { Send } from 'lucide-react';

const REQUIRED_DOCS = [
  { id: 'form1',        label: 'Form 1 / Form 1A',                            desc: 'Duly filled and signed application form as per EIA Notification 2006',    required: true },
  { id: 'pfr',          label: 'Pre-Feasibility Report (PFR)',                 desc: 'Brief description of the project, site selection, and alternatives',      required: true },
  { id: 'eia',          label: 'Environmental Impact Assessment (EIA) Report', desc: 'Detailed EIA report prepared by an accredited EIA Consultant',            required: true },
  { id: 'emp',          label: 'Environment Management Plan (EMP)',            desc: 'Comprehensive environmental mitigation and monitoring plan',               required: true },
  { id: 'ph',           label: 'Public Hearing / Consultation Report',         desc: 'Proceedings of public hearing conducted by SPCB / UTPCC',                required: true },
  { id: 'location',     label: 'Site Location Map & Topo Sheet',               desc: 'Survey of India topo sheet (1:50,000) with site demarcated',              required: true },
  { id: 'land',         label: 'Land Ownership / Lease Documents',             desc: 'Revenue records, lease deed, or allotment letter for project land',       required: true },
  { id: 'spcb',         label: 'NOC from State Pollution Control Board',       desc: 'No-Objection Certificate from SPCB / UTPCC',                             required: true },
  { id: 'incorporate',  label: 'Company Incorporation / Auth Certificate',     desc: 'Certificate of Incorporation, MoA & AoA, or Partnership deed',           required: true },
  { id: 'proponent_id', label: 'Proponent Identity Proof (Aadhaar / PAN)',     desc: 'Self-attested copy of Aadhaar or PAN of authorised signatory',           required: true },
  { id: 'forest',       label: 'Forest Clearance (if applicable)',             desc: 'Stage I approval under Forest (Conservation) Act, 1980',                 required: false },
  { id: 'crz',          label: 'CRZ Clearance (if applicable)',                desc: 'Coastal Regulation Zone clearance from MoEFCC / State CRZ Authority',    required: false },
  { id: 'risk',         label: 'Risk Assessment Report (if applicable)',       desc: 'Quantitative risk assessment for hazardous / chemical industry projects', required: false },
];

const SECTORS = ['Cement', 'Mining', 'Power', 'Road / Highway', 'Thermal Power Plant', 'River Valley / Hydro Power', 'Chemical / Petrochemical', 'Iron & Steel', 'Port & Harbour', 'Tourism / Hospitality', 'Others'];
const STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh'];

type FormData = Omit<
  WorkflowApplication,
  'id' | 'applicationNumber' | 'status' | 'createdAt' | 'updatedAt' | 'submittedAt' | 'finalizedAt' | 'edsQueries' | 'documents' | 'paymentStatus' | 'scrutinyAssignedTo' | 'gist' | 'momContent'
>;

const INITIAL: Partial<FormData> = {
  projectName: '', proponentName: '', proponentPhone: '',
  projectCategory: 'B1', projectSector: '', stateUT: '', district: '',
  projectCost: 0, projectArea: 0,
};

const inputCls =
  'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c] transition-all';

interface FieldProps {
  label: string;
  id: string;
  children: ReactNode;
}

const Field = memo(function Field({ label, id, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
        {label}
      </label>
      {children}
    </div>
  );
});

export default function ApplyPage() {
  const { user } = useAuthStore();
  const { createApp, isLoading, error } = useWorkflowStore();
  const router = useRouter();
  const [form, setForm] = useState<Partial<FormData>>({ ...INITIAL });
  const [success, setSuccess] = useState('');
  const [docChecks, setDocChecks] = useState<Record<string, boolean>>({});
  const userFormInitialized = useRef(false);

  const toggleDoc = useCallback((id: string) => {
    setDocChecks(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const allMandatoryChecked = REQUIRED_DOCS.filter(d => d.required).every(d => docChecks[d.id]);

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    if (user.email && !userFormInitialized.current) {
      setForm((f) => ({
        ...f,
        proponentEmail: user.email,
        // Preserve manual edits instead of re-overwriting form values.
        proponentName: f.proponentName?.trim() ? f.proponentName : user.name,
      }));
      userFormInitialized.current = true;
    }
  }, [user, router]);

  const setField = useCallback(
    (field: keyof FormData, value: string | number | ProjectCategory) => {
      setForm((f) => ({ ...f, [field]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent, asDraft: boolean) => {
      e.preventDefault();
      try {
        const app = await createApp({ ...form, proponentEmail: user?.email ?? '' });
        if (!asDraft) {
          const { updateStatus } = useWorkflowStore.getState();
          await updateStatus(app.id, 'submitted');
        }
        setSuccess(asDraft ? 'Application saved as draft.' : 'Application submitted successfully!');
        setTimeout(() => router.push('/applicant/dashboard'), 1500);
      } catch {
        // error shown from store
      }
    },
    [createApp, form, router, user?.email]
  );

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <GovHeader />
      <div className="flex flex-1">
        <Sidebar role="applicant" />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">New Application</h2>
            <p className="text-gray-400 text-sm mb-6">Fill in all details for Environmental Clearance under EIA Notification, 2006</p>

            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm font-semibold">{success}</div>
            )}

            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
              {/* Project Details */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#1a6b3c] text-white text-xs rounded-full flex items-center justify-center font-bold">1</span>
                  Project Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Field label="Project Name *" id="projectName">
                      <input
                        id="projectName"
                        name="projectName"
                        className={inputCls}
                        value={form.projectName ?? ''}
                        onChange={(e) => setField('projectName', e.target.value)}
                        required
                        autoComplete="off"
                        placeholder="e.g. Cement Manufacturing Plant Phase II"
                      />
                    </Field>
                  </div>
                  <Field label="Project Category *" id="projectCategory">
                    <select id="projectCategory" className={inputCls} value={form.projectCategory} onChange={(e) => setField('projectCategory', e.target.value as ProjectCategory)} required>
                      <option value="A">Category A (Central Appraisal)</option>
                      <option value="B1">Category B1 (State EIA)</option>
                      <option value="B2">Category B2 (Deemed EC)</option>
                    </select>
                  </Field>
                  <Field label="Project Sector *" id="projectSector">
                    <select id="projectSector" className={inputCls} value={form.projectSector ?? ''} onChange={(e) => setField('projectSector', e.target.value)} required>
                      <option value="">Select Sector</option>
                      {SECTORS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Project Cost (INR) *" id="projectCost">
                    <input id="projectCost" type="number" className={inputCls} value={form.projectCost ?? ''} onChange={(e) => setField('projectCost', Number(e.target.value))} required min={0} placeholder="e.g. 450000000" />
                  </Field>
                  <Field label="Project Area (hectares) *" id="projectArea">
                    <input id="projectArea" type="number" className={inputCls} value={form.projectArea ?? ''} onChange={(e) => setField('projectArea', Number(e.target.value))} required min={0} step="0.01" placeholder="e.g. 250" />
                  </Field>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#1a6b3c] text-white text-xs rounded-full flex items-center justify-center font-bold">2</span>
                  Project Location
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="State / UT *" id="stateUT">
                    <select id="stateUT" className={inputCls} value={form.stateUT ?? ''} onChange={(e) => setField('stateUT', e.target.value)} required>
                      <option value="">Select State/UT</option>
                      {STATES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="District *" id="district">
                    <input id="district" className={inputCls} value={form.district ?? ''} onChange={(e) => setField('district', e.target.value)} required placeholder="e.g. Jodhpur" />
                  </Field>
                </div>
              </div>

              {/* Proponent Info */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#1a6b3c] text-white text-xs rounded-full flex items-center justify-center font-bold">3</span>
                  Proponent / Applicant Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Proponent Name *" id="proponentName">
                    <input id="proponentName" className={inputCls} value={form.proponentName ?? ''} onChange={(e) => setField('proponentName', e.target.value)} required placeholder="Full Name / Organisation" />
                  </Field>
                  <Field label="Mobile Number *" id="proponentPhone">
                    <input id="proponentPhone" type="tel" className={inputCls} value={form.proponentPhone ?? ''} onChange={(e) => setField('proponentPhone', e.target.value)} required placeholder="10-digit mobile" pattern="[0-9]{10}" />
                  </Field>
                </div>
              </div>

              {/* Required Documents Checklist */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-700 mb-1 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#1a6b3c] text-white text-xs rounded-full flex items-center justify-center font-bold">4</span>
                  Required Documents Checklist
                </h3>
                <p className="text-xs text-gray-400 mb-4">Confirm that the following documents are ready. All mandatory items must be acknowledged before submission.</p>

                <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2">Mandatory Documents</p>
                <div className="space-y-2 mb-5">
                  {REQUIRED_DOCS.filter(d => d.required).map(doc => (
                    <label
                      key={doc.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none ${
                        docChecks[doc.id]
                          ? 'bg-green-50 border-[#1a6b3c]/40'
                          : 'bg-gray-50 border-gray-200 hover:border-[#1a6b3c]/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!docChecks[doc.id]}
                        onChange={() => toggleDoc(doc.id)}
                        className="mt-0.5 w-4 h-4 accent-[#1a6b3c] shrink-0 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{doc.label}</p>
                        <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{doc.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Conditional / Optional Documents</p>
                <div className="space-y-2">
                  {REQUIRED_DOCS.filter(d => !d.required).map(doc => (
                    <label
                      key={doc.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none ${
                        docChecks[doc.id]
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-gray-50 border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!docChecks[doc.id]}
                        onChange={() => toggleDoc(doc.id)}
                        className="mt-0.5 w-4 h-4 accent-blue-600 shrink-0 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-700">{doc.label}</p>
                        <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{doc.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {!allMandatoryChecked && (
                  <p className="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    ⚠ Please acknowledge all <strong>mandatory documents</strong> before submitting the application.
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e as unknown as React.FormEvent, true)}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !allMandatoryChecked}
                  title={!allMandatoryChecked ? 'Acknowledge all mandatory documents first' : ''}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #1a6b3c, #256b45)' }}
                >
                  {isLoading ? 'Submitting…' : <><Send size={15} /> Submit Application</>}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
