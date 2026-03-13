'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useWorkflowStore } from '@/store/workflowStore';
import GovHeader from '@/components/GovHeader';
import Sidebar from '@/components/Sidebar';
import { WorkflowApplication, ProjectCategory } from '@/types/workflow';
import { Send, ChevronRight } from 'lucide-react';

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

export default function ApplyPage() {
  const { user } = useAuthStore();
  const { createApp, isLoading, error } = useWorkflowStore();
  const router = useRouter();
  const [form, setForm] = useState<Partial<FormData>>({ ...INITIAL });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    if (user.email) setForm((f) => ({ ...f, proponentName: user.name, proponentEmail: user.email }));
  }, [user]);

  const set = (field: keyof FormData, value: string | number | ProjectCategory) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent, asDraft: boolean) => {
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
  };

  if (!user) return null;

  const Field = ({ label, id, children }: { label: string; id: string; children: React.ReactNode }) => (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">{label}</label>
      {children}
    </div>
  );

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c] transition-all";

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
                      <input id="projectName" className={inputCls} value={form.projectName} onChange={(e) => set('projectName', e.target.value)} required placeholder="e.g. Cement Manufacturing Plant Phase II" />
                    </Field>
                  </div>
                  <Field label="Project Category *" id="projectCategory">
                    <select id="projectCategory" className={inputCls} value={form.projectCategory} onChange={(e) => set('projectCategory', e.target.value as ProjectCategory)} required>
                      <option value="A">Category A (Central Appraisal)</option>
                      <option value="B1">Category B1 (State EIA)</option>
                      <option value="B2">Category B2 (Deemed EC)</option>
                    </select>
                  </Field>
                  <Field label="Project Sector *" id="projectSector">
                    <select id="projectSector" className={inputCls} value={form.projectSector} onChange={(e) => set('projectSector', e.target.value)} required>
                      <option value="">Select Sector</option>
                      {SECTORS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Project Cost (INR) *" id="projectCost">
                    <input id="projectCost" type="number" className={inputCls} value={form.projectCost ?? ''} onChange={(e) => set('projectCost', Number(e.target.value))} required min={0} placeholder="e.g. 450000000" />
                  </Field>
                  <Field label="Project Area (hectares) *" id="projectArea">
                    <input id="projectArea" type="number" className={inputCls} value={form.projectArea ?? ''} onChange={(e) => set('projectArea', Number(e.target.value))} required min={0} step="0.01" placeholder="e.g. 250" />
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
                    <select id="stateUT" className={inputCls} value={form.stateUT} onChange={(e) => set('stateUT', e.target.value)} required>
                      <option value="">Select State/UT</option>
                      {STATES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="District *" id="district">
                    <input id="district" className={inputCls} value={form.district} onChange={(e) => set('district', e.target.value)} required placeholder="e.g. Jodhpur" />
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
                    <input id="proponentName" className={inputCls} value={form.proponentName} onChange={(e) => set('proponentName', e.target.value)} required placeholder="Full Name / Organisation" />
                  </Field>
                  <Field label="Mobile Number *" id="proponentPhone">
                    <input id="proponentPhone" type="tel" className={inputCls} value={form.proponentPhone} onChange={(e) => set('proponentPhone', e.target.value)} required placeholder="10-digit mobile" pattern="[0-9]{10}" />
                  </Field>
                </div>
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
                  disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
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
