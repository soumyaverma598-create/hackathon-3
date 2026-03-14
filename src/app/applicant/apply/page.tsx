'use client';

import { memo, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useLanguageStore } from '@/store/languageStore';
import { useWorkflowStore } from '@/store/workflowStore';
import PageShell from '@/components/PageShell';
import ApplicationTypeDropdown, { ApplicationType } from '@/components/ApplicationTypeDropdown';
import SandChecklist from '@/components/SandChecklist';
import LimestoneChecklist from '@/components/LimestoneChecklist';
import BricksChecklist from '@/components/BricksChecklist';
import InfrastructureChecklist from '@/components/InfrastructureChecklist';
import ChecklistItemWithUpload from '@/components/ChecklistItemWithUpload';
import { getApplicationText } from '@/lib/translations';
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

const SAND_AFFIDAVIT_ITEMS = [
  'Mining will be limited to 60% of the total lease area.',
  'Sand excavation will not occur during rainy season.',
  'Excavation will not occur near river banks.',
  'Mining will follow Sustainable Sand Mining Guidelines.',
  'Minerals will be transported covered with tarpaulin.',
  'Vehicles will avoid populated areas.',
  'Sand excavation and filling will be done manually.',
  'Heavy vehicles will not enter the river.',
  'Sand replenishment study will be conducted.',
  'Plantation will be carried out along approach roads.',
  'Environmental clearance conditions will be followed.',
  'Six monthly compliance reports will be submitted.',
] as const;

const LIMESTONE_AFFIDAVIT_ITEMS = [
  'Top soil will be preserved and stored.',
  'Control blasting will be done by DGMS authorized license holder.',
  'Boundary demarcation will be done by pillars as per Mineral Concession Rules.',
  'Water sprinkling will be done to control dust emission.',
  'Polluted water will not be discharged into natural water sources.',
  'Employment will be provided to local people as per government rules.',
  'No court case is pending related to the project.',
  'Environmental clearance conditions will be followed.',
  'Excavation will not exceed granted capacity.',
  'Water meter will be installed for groundwater extraction.',
  'Mineral transportation will follow CPCB guidelines.',
  'Excavated area restoration will be done with plantation.',
  'No excavation will be done in the 7.5 meter safety zone.',
  'Mining will not disturb flora and fauna.',
] as const;

const PROJECT_COMPLIANCE_AFFIDAVIT_ITEMS = [
  'Environmental clearance conditions will be followed.',
  'No violation of MoEFCC notification.',
  'Supreme Court and NGT directions will be followed.',
  'No excavation outside lease area.',
  'Trees will be cut only after permission.',
  'CER activities will be implemented.',
  'Compliance reports will be submitted every six months.',
  'Any ownership transfer will be reported to authorities.',
  'Inspecting officers will be allowed access to the site.',
] as const;

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
  'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#164e63] transition-all';

interface FieldProps {
  label: string;
  id: string;
  children: ReactNode;
}

const Field = memo(function Field({ label, id, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="ui-label">
        {label}
      </label>
      {children}
    </div>
  );
});

export default function ApplyPage() {
  const { user } = useAuthStore();
  const { createApp, isLoading, error } = useWorkflowStore();
  const { language } = useLanguageStore();
  const router = useRouter();
  const [form, setForm] = useState<Partial<FormData>>({ ...INITIAL });
  const [success, setSuccess] = useState('');
  const [docChecks, setDocChecks] = useState<Record<string, boolean>>({});
  const [docUploads, setDocUploads] = useState<Record<string, string>>({});
  const [selectedApplicationType, setSelectedApplicationType] = useState<ApplicationType>('');
  const [sandDocChecks, setSandDocChecks] = useState<Record<string, boolean>>({});
  const [sandDocUploads, setSandDocUploads] = useState<Record<string, string>>({});
  const [sandAffidavitChecks, setSandAffidavitChecks] = useState<Record<string, boolean>>({});
  const [sandAffidavitUploads, setSandAffidavitUploads] = useState<Record<string, string>>({});
  const [limestoneDocChecks, setLimestoneDocChecks] = useState<Record<string, boolean>>({});
  const [limestoneDocUploads, setLimestoneDocUploads] = useState<Record<string, string>>({});
  const [limestoneAffidavitChecks, setLimestoneAffidavitChecks] = useState<Record<string, boolean>>({});
  const [limestoneAffidavitUploads, setLimestoneAffidavitUploads] = useState<Record<string, string>>({});
  const [bricksDocChecks, setBricksDocChecks] = useState<Record<string, boolean>>({});
  const [bricksDocUploads, setBricksDocUploads] = useState<Record<string, string>>({});
  const [bricksAffidavitChecks, setBricksAffidavitChecks] = useState<Record<string, boolean>>({});
  const [bricksAffidavitUploads, setBricksAffidavitUploads] = useState<Record<string, string>>({});
  const [infrastructureDocChecks, setInfrastructureDocChecks] = useState<Record<string, boolean>>({});
  const [infrastructureDocUploads, setInfrastructureDocUploads] = useState<Record<string, string>>({});
  const [infrastructureAffidavitChecks, setInfrastructureAffidavitChecks] = useState<Record<string, boolean>>({});
  const [infrastructureAffidavitUploads, setInfrastructureAffidavitUploads] = useState<Record<string, string>>({});
  const [industryAffidavitChecks, setIndustryAffidavitChecks] = useState<Record<string, boolean>>({});
  const [industryAffidavitUploads, setIndustryAffidavitUploads] = useState<Record<string, string>>({});
  const userFormInitialized = useRef(false);

  const toggleDoc = useCallback((id: string) => {
    setDocChecks(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleDocUpload = useCallback((id: string, file: File | null) => {
    setDocUploads(prev => ({ ...prev, [id]: file?.name ?? '' }));
  }, []);

  const toggleSandDoc = useCallback((id: string) => {
    setSandDocChecks(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleSandDocUpload = useCallback((id: string, file: File | null) => {
    setSandDocUploads(prev => ({ ...prev, [id]: file?.name ?? '' }));
  }, []);

  const toggleSandAffidavit = useCallback((id: string) => {
    setSandAffidavitChecks(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleSandAffidavitUpload = useCallback((id: string, file: File | null) => {
    setSandAffidavitUploads(prev => ({ ...prev, [id]: file?.name ?? '' }));
  }, []);

  const toggleLimestoneDoc = useCallback((id: string) => {
    setLimestoneDocChecks(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleLimestoneDocUpload = useCallback((id: string, file: File | null) => {
    setLimestoneDocUploads(prev => ({ ...prev, [id]: file?.name ?? '' }));
  }, []);

  const toggleLimestoneAffidavit = useCallback((id: string) => {
    setLimestoneAffidavitChecks(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleLimestoneAffidavitUpload = useCallback((id: string, file: File | null) => {
    setLimestoneAffidavitUploads(prev => ({ ...prev, [id]: file?.name ?? '' }));
  }, []);

  const toggleBricksDoc = useCallback((id: string) => {
    setBricksDocChecks(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleBricksDocUpload = useCallback((id: string, file: File | null) => {
    setBricksDocUploads(prev => ({ ...prev, [id]: file?.name ?? '' }));
  }, []);

  const toggleBricksAffidavit = useCallback((id: string) => {
    setBricksAffidavitChecks(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleBricksAffidavitUpload = useCallback((id: string, file: File | null) => {
    setBricksAffidavitUploads(prev => ({ ...prev, [id]: file?.name ?? '' }));
  }, []);

  const toggleInfrastructureDoc = useCallback((id: string) => {
    setInfrastructureDocChecks(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleInfrastructureDocUpload = useCallback((id: string, file: File | null) => {
    setInfrastructureDocUploads(prev => ({ ...prev, [id]: file?.name ?? '' }));
  }, []);

  const toggleInfrastructureAffidavit = useCallback((id: string) => {
    setInfrastructureAffidavitChecks(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleInfrastructureAffidavitUpload = useCallback((id: string, file: File | null) => {
    setInfrastructureAffidavitUploads(prev => ({ ...prev, [id]: file?.name ?? '' }));
  }, []);

  const toggleIndustryAffidavit = useCallback((id: string) => {
    setIndustryAffidavitChecks(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleIndustryAffidavitUpload = useCallback((id: string, file: File | null) => {
    setIndustryAffidavitUploads(prev => ({ ...prev, [id]: file?.name ?? '' }));
  }, []);

  // Check mandatory docs from required list
  const mandatoryDocsChecked = REQUIRED_DOCS.filter(d => d.required).every(d => docChecks[d.id]);

  // Check SAND docs if SAND application type is selected
  const allSandDocsChecked = selectedApplicationType === 'sand' 
    ? [
        'processingFees', 'prefeasibility', 'emp', 'form1', 'dsr', 'landDocs', 'loi', 'noc',
        'certificate200', 'certificate500', 'markedDelimited', 'miningPlan', 'approvedMiningPlan',
        'forestNoc', 'kml', 'cerConsent', 'affidavits', 'gist'
      ].every(id => sandDocChecks[id])
    : true;

  const allSandAffidavitsChecked = selectedApplicationType === 'sand'
    ? SAND_AFFIDAVIT_ITEMS.every((_, index) => sandAffidavitChecks[`sandAffidavit-${index + 1}`])
    : true;

  // Check LIMESTONE docs if LIMESTONE application type is selected
  const allLimestoneDocsChecked = selectedApplicationType === 'limestone'
    ? [
        'processingFees', 'prefeasibility', 'emp', 'form1', 'dsr', 'landDocs', 'consent', 'loi', 'leaseDeed',
        'previousEC', 'ecCompliance', 'productionData', 'gram', 'certificate200', 'certificate500', 'planApproval',
        'approvedPlan', 'forestNoc', 'treePlantation', 'waterNoc', 'cteCto', 'geoPhotographs', 'boundaryStrip',
        'droneVideo', 'kml', 'ccr', 'cemp', 'cerConsent', 'affidavits', 'eiaHearing', 'gist'
      ].every(id => limestoneDocChecks[id])
    : true;

  const allLimestoneAffidavitsChecked = selectedApplicationType === 'limestone'
    ? LIMESTONE_AFFIDAVIT_ITEMS.every((_, index) => limestoneAffidavitChecks[`limestoneAffidavit-${index + 1}`])
    : true;

  // Check BRICKS docs if BRICKS application type is selected
  const allBricksDocsChecked = selectedApplicationType === 'bricks'
    ? [
        'processingFees', 'prefeasibility', 'emp', 'form1', 'dsr', 'landDocs', 'consent', 'loi', 'leaseDeed',
        'previousEC', 'ecCompliance', 'productionData', 'gram', 'panchayat', 'certificate200', 'certificate500',
        'planApproval', 'approvedPlan', 'forestNoc', 'treePlantation', 'waterNoc', 'cteCto', 'geoPhotographs',
        'boundaryStrip', 'droneVideo', 'kml', 'ccr', 'cemp', 'cerConsent', 'affidavits', 'eiaHearing', 'gist'
      ].every(id => bricksDocChecks[id])
    : true;

  const allBricksAffidavitsChecked = selectedApplicationType === 'bricks'
    ? PROJECT_COMPLIANCE_AFFIDAVIT_ITEMS.every((_, index) => bricksAffidavitChecks[`bricksAffidavit-${index + 1}`])
    : true;

  // Check INFRASTRUCTURE docs if INFRASTRUCTURE application type is selected
  const allInfrastructureDocsChecked = selectedApplicationType === 'infrastructure'
    ? [
        'processingFees', 'prefeasibility', 'emp', 'form1', 'landDocs', 'previousEC', 'ecCompliance', 'partnership',
        'conceptual', 'approvedLayout', 'landUseZoning', 'builtUpArea', 'buildingPermission', 'waterPermission',
        'stp', 'wasteManagement', 'solarEnergy', 'greenBelt', 'empCost', 'nbwl', 'fireNoc', 'aviationNoc',
        'wildlifeManagement', 'cteCto', 'geoPhotographs', 'kml', 'cerConsent', 'affidavits', 'eiaHearing', 'gist'
      ].every(id => infrastructureDocChecks[id])
    : true;

  const allInfrastructureAffidavitsChecked = selectedApplicationType === 'infrastructure'
    ? PROJECT_COMPLIANCE_AFFIDAVIT_ITEMS.every((_, index) => infrastructureAffidavitChecks[`infrastructureAffidavit-${index + 1}`])
    : true;

  const allIndustryAffidavitsChecked = selectedApplicationType === 'industry'
    ? PROJECT_COMPLIANCE_AFFIDAVIT_ITEMS.every((_, index) => industryAffidavitChecks[`industryAffidavit-${index + 1}`])
    : true;

  // Final validation: mandatory docs + application-specific checks
  const allMandatoryChecked = mandatoryDocsChecked && allSandDocsChecked && allSandAffidavitsChecked && allLimestoneDocsChecked && allLimestoneAffidavitsChecked && allBricksDocsChecked && allBricksAffidavitsChecked && allInfrastructureDocsChecked && allInfrastructureAffidavitsChecked && allIndustryAffidavitsChecked;

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
    <PageShell role="applicant">
            <h2 className="page-heading">New Application</h2>
            <p className="page-subheading mb-6">Fill in all details for Environmental Clearance under EIA Notification, 2006</p>

            {success && (
              <div className="mb-4 bg-cyan-50 border border-cyan-200 text-cyan-700 rounded-lg px-4 py-3 text-sm font-semibold">{success}</div>
            )}

            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
              {/* Application Type Selection */}
              <div className="glass-card-strong p-6">
                <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#164e63] text-white text-xs rounded-full flex items-center justify-center font-bold">0</span>
                  {getApplicationText('selectApplicationType', language)}
                </h3>
                <Field label={getApplicationText('selectApplicationType', language) + ' *'} id="applicationType">
                  <ApplicationTypeDropdown
                    value={selectedApplicationType}
                    onChange={(type) => {
                      setSelectedApplicationType(type);
                      // Reset checklists when changing application type
                      setSandDocChecks({});
                      setSandDocUploads({});
                      setSandAffidavitChecks({});
                      setSandAffidavitUploads({});
                      setLimestoneDocChecks({});
                      setLimestoneDocUploads({});
                      setLimestoneAffidavitChecks({});
                      setLimestoneAffidavitUploads({});
                      setBricksDocChecks({});
                      setBricksDocUploads({});
                      setBricksAffidavitChecks({});
                      setBricksAffidavitUploads({});
                      setInfrastructureDocChecks({});
                      setInfrastructureDocUploads({});
                      setInfrastructureAffidavitChecks({});
                      setInfrastructureAffidavitUploads({});
                      setIndustryAffidavitChecks({});
                      setIndustryAffidavitUploads({});
                    }}
                  />
                </Field>
              </div>

              {/* SAND Mining Checklist - shown when SAND is selected */}
              {selectedApplicationType === 'sand' && (
                <div className="glass-card-strong p-6 space-y-5">
                  <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="w-6 h-6 bg-[#164e63] text-white text-xs rounded-full flex items-center justify-center font-bold">*</span>
                    {getApplicationText('sandChecklist', language)}
                  </h3>
                  <SandChecklist
                    checkedItems={sandDocChecks}
                    onToggle={toggleSandDoc}
                    uploadedFiles={sandDocUploads}
                    onFileSelect={handleSandDocUpload}
                  />

                  <div className="bg-white rounded-lg border border-cyan-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-cyan-100 bg-cyan-50/70">
                      <p className="text-sm font-semibold text-[#164e63]">Sand Mining Affidavits (Mandatory)</p>
                      <p className="text-xs text-gray-600 mt-1">Please confirm each affidavit point before submitting this Sand Mining application.</p>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {SAND_AFFIDAVIT_ITEMS.map((item, index) => {
                        const id = `sandAffidavit-${index + 1}`;
                        return (
                          <ChecklistItemWithUpload
                            key={id}
                            id={id}
                            label={item}
                            index={index}
                            checked={!!sandAffidavitChecks[id]}
                            onToggle={toggleSandAffidavit}
                            uploadedFileName={sandAffidavitUploads[id]}
                            onFileSelect={handleSandAffidavitUpload}
                            checkedClassName="bg-cyan-50 border-[#164e63]/40"
                            uncheckedClassName="bg-white border-gray-200 hover:border-[#164e63]/30"
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* LIMESTONE Mining Checklist - shown when LIMESTONE is selected */}
              {selectedApplicationType === 'limestone' && (
                <div className="glass-card-strong p-6 space-y-5">
                  <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="w-6 h-6 bg-[#164e63] text-white text-xs rounded-full flex items-center justify-center font-bold">*</span>
                    {getApplicationText('limestoneChecklist', language)}
                  </h3>
                  <LimestoneChecklist
                    checkedItems={limestoneDocChecks}
                    onToggle={toggleLimestoneDoc}
                    uploadedFiles={limestoneDocUploads}
                    onFileSelect={handleLimestoneDocUpload}
                  />

                  <div className="bg-white rounded-lg border border-cyan-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-cyan-100 bg-cyan-50/70">
                      <p className="text-sm font-semibold text-[#164e63]">Limestone Mining Affidavits (Mandatory)</p>
                      <p className="text-xs text-gray-600 mt-1">Please confirm each affidavit point before submitting this Limestone Mining application.</p>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {LIMESTONE_AFFIDAVIT_ITEMS.map((item, index) => {
                        const id = `limestoneAffidavit-${index + 1}`;
                        return (
                          <ChecklistItemWithUpload
                            key={id}
                            id={id}
                            label={item}
                            index={index}
                            checked={!!limestoneAffidavitChecks[id]}
                            onToggle={toggleLimestoneAffidavit}
                            uploadedFileName={limestoneAffidavitUploads[id]}
                            onFileSelect={handleLimestoneAffidavitUpload}
                            checkedClassName="bg-cyan-50 border-[#164e63]/40"
                            uncheckedClassName="bg-white border-gray-200 hover:border-[#164e63]/30"
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* BRICKS Manufacturing Checklist - shown when BRICKS is selected */}
              {selectedApplicationType === 'bricks' && (
                <div className="glass-card-strong p-6 space-y-5">
                  <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="w-6 h-6 bg-[#164e63] text-white text-xs rounded-full flex items-center justify-center font-bold">*</span>
                    {getApplicationText('bricksChecklist', language)}
                  </h3>
                  <BricksChecklist
                    checkedItems={bricksDocChecks}
                    onToggle={toggleBricksDoc}
                    uploadedFiles={bricksDocUploads}
                    onFileSelect={handleBricksDocUpload}
                  />

                  <div className="bg-white rounded-lg border border-cyan-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-cyan-100 bg-cyan-50/70">
                      <p className="text-sm font-semibold text-[#164e63]">Bricks Manufacturing Affidavits (Mandatory)</p>
                      <p className="text-xs text-gray-600 mt-1">Please confirm each affidavit point before submitting this Bricks Manufacturing application.</p>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {PROJECT_COMPLIANCE_AFFIDAVIT_ITEMS.map((item, index) => {
                        const id = `bricksAffidavit-${index + 1}`;
                        return (
                          <ChecklistItemWithUpload
                            key={id}
                            id={id}
                            label={item}
                            index={index}
                            checked={!!bricksAffidavitChecks[id]}
                            onToggle={toggleBricksAffidavit}
                            uploadedFileName={bricksAffidavitUploads[id]}
                            onFileSelect={handleBricksAffidavitUpload}
                            checkedClassName="bg-cyan-50 border-[#164e63]/40"
                            uncheckedClassName="bg-white border-gray-200 hover:border-[#164e63]/30"
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* INFRASTRUCTURE Development Checklist - shown when INFRASTRUCTURE is selected */}
              {selectedApplicationType === 'infrastructure' && (
                <div className="glass-card-strong p-6 space-y-5">
                  <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="w-6 h-6 bg-[#164e63] text-white text-xs rounded-full flex items-center justify-center font-bold">*</span>
                    {getApplicationText('infrastructureChecklist', language)}
                  </h3>
                  <InfrastructureChecklist
                    checkedItems={infrastructureDocChecks}
                    onToggle={toggleInfrastructureDoc}
                    uploadedFiles={infrastructureDocUploads}
                    onFileSelect={handleInfrastructureDocUpload}
                  />

                  <div className="bg-white rounded-lg border border-cyan-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-cyan-100 bg-cyan-50/70">
                      <p className="text-sm font-semibold text-[#164e63]">Infrastructure Development Affidavits (Mandatory)</p>
                      <p className="text-xs text-gray-600 mt-1">Please confirm each affidavit point before submitting this Infrastructure Development application.</p>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {PROJECT_COMPLIANCE_AFFIDAVIT_ITEMS.map((item, index) => {
                        const id = `infrastructureAffidavit-${index + 1}`;
                        return (
                          <ChecklistItemWithUpload
                            key={id}
                            id={id}
                            label={item}
                            index={index}
                            checked={!!infrastructureAffidavitChecks[id]}
                            onToggle={toggleInfrastructureAffidavit}
                            uploadedFileName={infrastructureAffidavitUploads[id]}
                            onFileSelect={handleInfrastructureAffidavitUpload}
                            checkedClassName="bg-cyan-50 border-[#164e63]/40"
                            uncheckedClassName="bg-white border-gray-200 hover:border-[#164e63]/30"
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {selectedApplicationType === 'industry' && (
                <div className="glass-card-strong p-6">
                  <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="w-6 h-6 bg-[#164e63] text-white text-xs rounded-full flex items-center justify-center font-bold">*</span>
                    Industry Project Affidavits
                  </h3>
                  <div className="bg-white rounded-lg border border-cyan-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-cyan-100 bg-cyan-50/70">
                      <p className="text-sm font-semibold text-[#164e63]">Industrial Project Affidavits (Mandatory)</p>
                      <p className="text-xs text-gray-600 mt-1">Please confirm each affidavit point before submitting this Industrial Project application.</p>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {PROJECT_COMPLIANCE_AFFIDAVIT_ITEMS.map((item, index) => {
                        const id = `industryAffidavit-${index + 1}`;
                        return (
                          <ChecklistItemWithUpload
                            key={id}
                            id={id}
                            label={item}
                            index={index}
                            checked={!!industryAffidavitChecks[id]}
                            onToggle={toggleIndustryAffidavit}
                            uploadedFileName={industryAffidavitUploads[id]}
                            onFileSelect={handleIndustryAffidavitUpload}
                            checkedClassName="bg-cyan-50 border-[#164e63]/40"
                            uncheckedClassName="bg-white border-gray-200 hover:border-[#164e63]/30"
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Project Details */}
              <div className="glass-card-strong p-6">
                <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#164e63] text-white text-xs rounded-full flex items-center justify-center font-bold">1</span>
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
              <div className="glass-card-strong p-6">
                <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#164e63] text-white text-xs rounded-full flex items-center justify-center font-bold">3</span>
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
              <div className="glass-card-strong p-6">
                <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#164e63] text-white text-xs rounded-full flex items-center justify-center font-bold">4</span>
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
              <div className="glass-card-strong p-6">
                <h3 className="font-semibold text-gray-700 mb-1 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#164e63] text-white text-xs rounded-full flex items-center justify-center font-bold">5</span>
                  Required Documents Checklist
                </h3>
                <p className="text-xs text-gray-400 mb-4">Confirm that the following documents are ready. All mandatory items must be acknowledged before submission.</p>

                <p className="ui-section-title-text mb-2">Mandatory Documents</p>
                <div className="space-y-2 mb-5">
                  {REQUIRED_DOCS.filter(d => d.required).map(doc => (
                    <ChecklistItemWithUpload
                      key={doc.id}
                      id={doc.id}
                      label={doc.label}
                      checked={!!docChecks[doc.id]}
                      onToggle={toggleDoc}
                      uploadedFileName={docUploads[doc.id]}
                      onFileSelect={handleDocUpload}
                      description={doc.desc}
                    />
                  ))}
                </div>

                <p className="ui-section-title-text mb-2">Conditional / Optional Documents</p>
                <div className="space-y-2">
                  {REQUIRED_DOCS.filter(d => !d.required).map(doc => (
                    <ChecklistItemWithUpload
                      key={doc.id}
                      id={`optional-${doc.id}`}
                      label={doc.label}
                      checked={!!docChecks[doc.id]}
                      onToggle={() => toggleDoc(doc.id)}
                      uploadedFileName={docUploads[doc.id]}
                      onFileSelect={(_, file) => handleDocUpload(doc.id, file)}
                      description={doc.desc}
                      checkedClassName="bg-blue-50 border-blue-300"
                      uncheckedClassName="bg-gray-50 border-gray-200 hover:border-blue-200"
                    />
                  ))}
                </div>

                {!allMandatoryChecked && (
                  <p className="mt-4 text-xs text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-lg px-3 py-2">
                    ⚠ Please acknowledge all <strong>mandatory documents</strong> and complete all mandatory checklist items for the selected application type before submitting.
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
                  title={!allMandatoryChecked ? (selectedApplicationType === 'sand' ? 'Acknowledge all mandatory documents, complete SAND checklist, and confirm all Sand affidavits first' : selectedApplicationType === 'limestone' ? 'Acknowledge all mandatory documents, complete LIMESTONE checklist, and confirm all Limestone affidavits first' : selectedApplicationType === 'bricks' ? 'Acknowledge all mandatory documents, complete BRICKS checklist, and confirm all Bricks affidavits first' : selectedApplicationType === 'infrastructure' ? 'Acknowledge all mandatory documents, complete INFRASTRUCTURE checklist, and confirm all Infrastructure affidavits first' : selectedApplicationType === 'industry' ? 'Acknowledge all mandatory documents and confirm all Industrial Project affidavits first' : 'Acknowledge all mandatory documents first') : ''}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #164e63, #1f7ea4)' }}
                >
                  {isLoading ? 'Submitting…' : <><Send size={15} /> Submit Application</>}
                </button>
              </div>
            </form>
    </PageShell>
  );
}
