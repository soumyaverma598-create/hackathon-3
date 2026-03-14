'use client';
export const dynamic = 'force-dynamic';

import { Suspense, memo, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import SkeletonLoader from '@/components/SkeletonLoader';
import PaymentModal from '@/components/ui/PaymentModal';
import { getApplicationText } from '@/lib/translations';
import { formatAppId } from '@/lib/utils';
import { WorkflowApplication, ProjectCategory, EDSQuery } from '@/types/workflow';
import { uploadDocuments, getEDSQueries, respondToEDS } from '@/lib/api';
import {
  Send,
  CheckCircle,
  FileText,
  Upload,
  MessageSquare,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Trash2,
  IndianRupee,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

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
  projectCost: undefined, projectArea: undefined,
};

const inputCls =
  'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#164e63] transition-all';

const Field = memo(function Field({ label, id, children }: { label: string; id: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="ui-label">{label}</label>
      {children}
    </div>
  );
});

// ── Wizard step definitions ──────────────────────────────────────────────────

type WizardStep = 1 | 2 | 3 | 4 | 5;

const WIZARD_STEPS: { step: WizardStep; label: string }[] = [
  { step: 1, label: 'Application Details' },
  { step: 2, label: 'Upload Documents' },
  { step: 3, label: 'EDS Queries' },
  { step: 4, label: 'Payment' },
  { step: 5, label: 'Submit' },
];

// ── Step progress bar ────────────────────────────────────────────────────────

function StepBar({ currentStep, completedSteps }: { currentStep: WizardStep; completedSteps: WizardStep[] }) {
  return (
    <div className="flex items-start mb-8 overflow-x-auto pb-1">
      {WIZARD_STEPS.map(({ step, label }, idx) => {
        const done = completedSteps.includes(step);
        const current = currentStep === step;
        const isLast = idx === WIZARD_STEPS.length - 1;
        return (
          <div key={step} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
            <div className="flex flex-col items-center min-w-[64px]">
              <div
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${
                  done
                    ? 'bg-green-500 border-green-500 text-white'
                    : current
                    ? 'bg-[#164e63] border-[#164e63] text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
              </div>
              <span
                className={`text-[10px] mt-1.5 font-medium text-center leading-tight ${
                  current ? 'text-[#164e63]' : done ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
            {!isLast && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Progress helpers ─────────────────────────────────────────────────────────

const PROG_KEY = 'parivesh_apply';
function loadProgress(email: string): string | null {
  try { const v = localStorage.getItem(`${PROG_KEY}_${email}`); return v ? (JSON.parse(v) as { appId: string }).appId : null; } catch { return null; }
}
function storeProgress(email: string, appId: string) {
  try { localStorage.setItem(`${PROG_KEY}_${email}`, JSON.stringify({ appId })); } catch { /* ignore */ }
}
function wipeProgress(email: string) {
  try { localStorage.removeItem(`${PROG_KEY}_${email}`); } catch { /* ignore */ }
}

// ── Fee helper ───────────────────────────────────────────────────────────────

function getFeeAmount(category: string): number {
  switch (category) { case 'A': return 50000; case 'B1': return 30000; case 'B2': return 10000; default: return 25000; }
}

// ── Nav buttons shared component ─────────────────────────────────────────────

function NavButtons({
  step, onBack, onNext, nextLabel = 'Continue', nextDisabled = false, nextLoading = false, extraButton,
}: {
  step: WizardStep; onBack?: () => void; onNext?: () => void; nextLabel?: string;
  nextDisabled?: boolean; nextLoading?: boolean; extraButton?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
      <div>
        {step > 1 && onBack && (
          <button type="button" onClick={onBack} className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            <ChevronLeft size={15} /> Back
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        {extraButton}
        {onNext && (
          <button type="button" onClick={onNext} disabled={nextDisabled || nextLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #164e63, #1f7ea4)' }}>
            {nextLoading ? 'Please wait…' : <>{nextLabel} <ChevronRight size={15} /></>}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main wizard component ────────────────────────────────────────────────────

function ApplyWizardContent() {
  const { user } = useAuthStore();
  const { createApp, applications, fetchByProponent, updateStatus, isLoading, error } = useWorkflowStore();
  const { language } = useLanguageStore();
  const router = useRouter();
  const params = useSearchParams();
  const rawStep = parseInt(params.get('step') ?? '1', 10);
  const step: WizardStep = (rawStep >= 1 && rawStep <= 5 ? rawStep : 1) as WizardStep;

  // Draft app state
  const [savedAppId, setSavedAppId] = useState<string | null>(null);
  const [currentApp, setCurrentApp] = useState<WorkflowApplication | null>(null);

  // Step 1: form state
  const [form, setForm] = useState<Partial<FormData>>({ ...INITIAL });
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
  const [step1Success, setStep1Success] = useState('');
  const userFormInitialized = useRef(false);

  // Step 2: upload state
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Step 3: EDS state
  const [edsQueries, setEdsQueries] = useState<EDSQuery[]>([]);
  const [edsLoading, setEdsLoading] = useState(false);
  const [edsError, setEdsError] = useState('');
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [edsSubmitting, setEdsSubmitting] = useState<Record<string, boolean>>({});
  const [edsSuccess, setEdsSuccess] = useState<Record<string, string>>({});
  const [expandedQuery, setExpandedQuery] = useState<string | null>(null);

  // Step 4: payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paySuccess, setPaySuccess] = useState('');
  const [payError, setPayError] = useState('');

  // Step 5 state
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Load saved progress on mount
  useEffect(() => {
    if (!user) return;
    const appId = loadProgress(user.email);
    if (appId) { setSavedAppId(appId); fetchByProponent(user.email); }
  }, [user, fetchByProponent]);

  // Sync currentApp from store
  useEffect(() => {
    if (savedAppId && applications.length > 0) {
      const app = applications.find((a) => a.id === savedAppId);
      if (app) setCurrentApp(app);
    }
  }, [applications, savedAppId]);

  // Auth guard + form init
  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    if (!userFormInitialized.current) {
      setForm((f) => ({ ...f, proponentEmail: user.email, proponentName: f.proponentName?.trim() ? f.proponentName : user.name }));
      userFormInitialized.current = true;
    }
  }, [user, router]);

  // Load EDS when on step 3
  useEffect(() => {
    if (step === 3 && savedAppId) {
      setEdsLoading(true); setEdsError('');
      getEDSQueries(savedAppId).then((qs) => setEdsQueries(qs)).catch((e) => setEdsError(e.message ?? 'Failed to load queries')).finally(() => setEdsLoading(false));
    }
  }, [step, savedAppId]);

  // Computed completed steps
  const completedSteps: WizardStep[] = [];
  if (savedAppId && currentApp) {
    completedSteps.push(1);
    if (currentApp.documents.length > 0) completedSteps.push(2);
    completedSteps.push(3);
    if (currentApp.paymentStatus === 'paid' || currentApp.paymentStatus === 'verified') completedSteps.push(4);
    if (currentApp.status !== 'draft') completedSteps.push(5);
  }

  const isPaid = currentApp?.paymentStatus === 'paid' || currentApp?.paymentStatus === 'verified';
  const feeAmount = currentApp ? getFeeAmount(currentApp.projectCategory) : 0;
  const totalWithGST = Math.round(feeAmount * 1.18);

  function goToStep(s: WizardStep) { router.push(`/applicant/apply?step=${s}`); }

  // Checklist callbacks
  const toggleDoc = useCallback((id: string) => setDocChecks((p) => ({ ...p, [id]: !p[id] })), []);
  const handleDocUpload = useCallback((id: string, file: File | null) => setDocUploads((p) => ({ ...p, [id]: file?.name ?? '' })), []);
  const toggleSandDoc = useCallback((id: string) => setSandDocChecks((p) => ({ ...p, [id]: !p[id] })), []);
  const handleSandDocUpload = useCallback((id: string, file: File | null) => setSandDocUploads((p) => ({ ...p, [id]: file?.name ?? '' })), []);
  const toggleSandAffidavit = useCallback((id: string) => setSandAffidavitChecks((p) => ({ ...p, [id]: !p[id] })), []);
  const handleSandAffidavitUpload = useCallback((id: string, file: File | null) => setSandAffidavitUploads((p) => ({ ...p, [id]: file?.name ?? '' })), []);
  const toggleLimestoneDoc = useCallback((id: string) => setLimestoneDocChecks((p) => ({ ...p, [id]: !p[id] })), []);
  const handleLimestoneDocUpload = useCallback((id: string, file: File | null) => setLimestoneDocUploads((p) => ({ ...p, [id]: file?.name ?? '' })), []);
  const toggleLimestoneAffidavit = useCallback((id: string) => setLimestoneAffidavitChecks((p) => ({ ...p, [id]: !p[id] })), []);
  const handleLimestoneAffidavitUpload = useCallback((id: string, file: File | null) => setLimestoneAffidavitUploads((p) => ({ ...p, [id]: file?.name ?? '' })), []);
  const toggleBricksDoc = useCallback((id: string) => setBricksDocChecks((p) => ({ ...p, [id]: !p[id] })), []);
  const handleBricksDocUpload = useCallback((id: string, file: File | null) => setBricksDocUploads((p) => ({ ...p, [id]: file?.name ?? '' })), []);
  const toggleBricksAffidavit = useCallback((id: string) => setBricksAffidavitChecks((p) => ({ ...p, [id]: !p[id] })), []);
  const handleBricksAffidavitUpload = useCallback((id: string, file: File | null) => setBricksAffidavitUploads((p) => ({ ...p, [id]: file?.name ?? '' })), []);
  const toggleInfrastructureDoc = useCallback((id: string) => setInfrastructureDocChecks((p) => ({ ...p, [id]: !p[id] })), []);
  const handleInfrastructureDocUpload = useCallback((id: string, file: File | null) => setInfrastructureDocUploads((p) => ({ ...p, [id]: file?.name ?? '' })), []);
  const toggleInfrastructureAffidavit = useCallback((id: string) => setInfrastructureAffidavitChecks((p) => ({ ...p, [id]: !p[id] })), []);
  const handleInfrastructureAffidavitUpload = useCallback((id: string, file: File | null) => setInfrastructureAffidavitUploads((p) => ({ ...p, [id]: file?.name ?? '' })), []);
  const toggleIndustryAffidavit = useCallback((id: string) => setIndustryAffidavitChecks((p) => ({ ...p, [id]: !p[id] })), []);
  const handleIndustryAffidavitUpload = useCallback((id: string, file: File | null) => setIndustryAffidavitUploads((p) => ({ ...p, [id]: file?.name ?? '' })), []);

  // Validation
  const mandatoryDocsChecked = REQUIRED_DOCS.filter((d) => d.required).every((d) => docChecks[d.id]);
  const allSandDocsChecked = selectedApplicationType !== 'sand' || ['processingFees','prefeasibility','emp','form1','dsr','landDocs','loi','noc','certificate200','certificate500','markedDelimited','miningPlan','approvedMiningPlan','forestNoc','kml','cerConsent','affidavits','gist'].every((id) => sandDocChecks[id]);
  const allSandAffidavitsChecked = selectedApplicationType !== 'sand' || SAND_AFFIDAVIT_ITEMS.every((_, i) => sandAffidavitChecks[`sandAffidavit-${i + 1}`]);
  const allLimestoneDocsChecked = selectedApplicationType !== 'limestone' || ['processingFees','prefeasibility','emp','form1','dsr','landDocs','consent','loi','leaseDeed','previousEC','ecCompliance','productionData','gram','certificate200','certificate500','planApproval','approvedPlan','forestNoc','treePlantation','waterNoc','cteCto','geoPhotographs','boundaryStrip','droneVideo','kml','ccr','cemp','cerConsent','affidavits','eiaHearing','gist'].every((id) => limestoneDocChecks[id]);
  const allLimestoneAffidavitsChecked = selectedApplicationType !== 'limestone' || LIMESTONE_AFFIDAVIT_ITEMS.every((_, i) => limestoneAffidavitChecks[`limestoneAffidavit-${i + 1}`]);
  const allBricksDocsChecked = selectedApplicationType !== 'bricks' || ['processingFees','prefeasibility','emp','form1','dsr','landDocs','consent','loi','leaseDeed','previousEC','ecCompliance','productionData','gram','panchayat','certificate200','certificate500','planApproval','approvedPlan','forestNoc','treePlantation','waterNoc','cteCto','geoPhotographs','boundaryStrip','droneVideo','kml','ccr','cemp','cerConsent','affidavits','eiaHearing','gist'].every((id) => bricksDocChecks[id]);
  const allBricksAffidavitsChecked = selectedApplicationType !== 'bricks' || PROJECT_COMPLIANCE_AFFIDAVIT_ITEMS.every((_, i) => bricksAffidavitChecks[`bricksAffidavit-${i + 1}`]);
  const allInfrastructureDocsChecked = selectedApplicationType !== 'infrastructure' || ['processingFees','prefeasibility','emp','form1','landDocs','previousEC','ecCompliance','partnership','conceptual','approvedLayout','landUseZoning','builtUpArea','buildingPermission','waterPermission','stp','wasteManagement','solarEnergy','greenBelt','empCost','nbwl','fireNoc','aviationNoc','wildlifeManagement','cteCto','geoPhotographs','kml','cerConsent','affidavits','eiaHearing','gist'].every((id) => infrastructureDocChecks[id]);
  const allInfrastructureAffidavitsChecked = selectedApplicationType !== 'infrastructure' || PROJECT_COMPLIANCE_AFFIDAVIT_ITEMS.every((_, i) => infrastructureAffidavitChecks[`infrastructureAffidavit-${i + 1}`]);
  const allIndustryAffidavitsChecked = selectedApplicationType !== 'industry' || PROJECT_COMPLIANCE_AFFIDAVIT_ITEMS.every((_, i) => industryAffidavitChecks[`industryAffidavit-${i + 1}`]);
  const allMandatoryChecked = mandatoryDocsChecked && allSandDocsChecked && allSandAffidavitsChecked && allLimestoneDocsChecked && allLimestoneAffidavitsChecked && allBricksDocsChecked && allBricksAffidavitsChecked && allInfrastructureDocsChecked && allInfrastructureAffidavitsChecked && allIndustryAffidavitsChecked;

  const setField = useCallback((field: keyof FormData, value: string | number | ProjectCategory | undefined) => {
    setForm((f) => ({ ...f, [field]: value }));
  }, []);

  // Step 1: save draft / save & continue
  const handleStep1 = useCallback(async (asDraft: boolean) => {
    try {
      const app = await createApp({ ...form, proponentEmail: user?.email ?? '' });
      setSavedAppId(app.id); setCurrentApp(app);
      storeProgress(user!.email, app.id);
      setStep1Success(asDraft ? 'Application saved as draft.' : 'Details saved! Moving to document upload…');
      if (!asDraft) setTimeout(() => goToStep(2), 900);
    } catch { /* error from store */ }
  }, [createApp, form, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Step 2: file upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !savedAppId) return;
    const fd = new FormData();
    Array.from(e.target.files).forEach((f) => fd.append('documents', f));
    setUploading(true); setUploadError(''); setUploadSuccess('');
    try {
      await uploadDocuments(savedAppId, fd);
      setUploadSuccess(`${e.target.files.length} file(s) uploaded successfully.`);
      if (user) fetchByProponent(user.email);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally { setUploading(false); }
  };

  // Step 3: EDS respond
  const handleRespond = async (queryId: string) => {
    if (!responses[queryId]?.trim() || !savedAppId) return;
    setEdsSubmitting((s) => ({ ...s, [queryId]: true }));
    try {
      const updated = await respondToEDS(savedAppId, queryId, { response: responses[queryId] });
      setEdsQueries((qs) => qs.map((q) => (q.id === queryId ? updated : q)));
      setEdsSuccess((s) => ({ ...s, [queryId]: 'Response submitted!' }));
      setResponses((r) => ({ ...r, [queryId]: '' }));
      setTimeout(() => setEdsSuccess((s) => ({ ...s, [queryId]: '' })), 3000);
    } catch { setEdsError('Failed to submit response.'); }
    finally { setEdsSubmitting((s) => ({ ...s, [queryId]: false })); }
  };

  // Step 4: payment success
  const handlePaymentSuccess = (paymentId: string) => {
    setShowPaymentModal(false);
    setPaySuccess(`Payment successful! Transaction ID: ${paymentId}`);
    if (user) fetchByProponent(user.email);
  };

  // Step 5: final submit
  const handleFinalSubmit = async () => {
    if (!savedAppId) return;
    setSubmitError('');
    try {
      await updateStatus(savedAppId, 'submitted');
      setSubmitSuccess('Application submitted successfully!');
      wipeProgress(user!.email);
      setTimeout(() => router.push('/applicant/dashboard'), 2000);
    } catch { setSubmitError('Failed to submit. Please try again.'); }
  };

  // Reset to start fresh
  const startNew = () => {
    if (user) wipeProgress(user.email);
    setSavedAppId(null); setCurrentApp(null);
    setForm({ ...INITIAL }); setDocChecks({}); setDocUploads({});
    setSelectedApplicationType(''); setStep1Success('');
    router.push('/applicant/apply?step=1');
  };

  if (!user) return null;

  const noAppWarning = (
    <div className="glass-card-strong p-8 text-center">
      <AlertCircle className="mx-auto mb-3 text-amber-500" size={28} />
      <p className="text-sm text-gray-600 mb-4">Please complete Step 1 (Application Details) first.</p>
      <button onClick={() => goToStep(1)} className="text-[#164e63] font-semibold text-sm hover:underline flex items-center gap-1 mx-auto">
        <ChevronLeft size={14} /> Go to Step 1
      </button>
    </div>
  );

  return (
    <PageShell role="applicant">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="page-heading">New Application</h2>
          <p className="page-subheading">Environmental Clearance — EIA Notification, 2006</p>
        </div>
        {savedAppId && currentApp && (
          <div className="text-right bg-cyan-50 border border-cyan-100 rounded-xl px-4 py-2">
            <div className="text-xs font-mono font-bold text-[#164e63]">{formatAppId(currentApp.applicationNumber)}</div>
            <div className="text-[10px] text-gray-400 flex items-center gap-1 justify-end mt-0.5"><Info size={10} /> Draft in progress</div>
          </div>
        )}
      </div>

      <StepBar currentStep={step} completedSteps={completedSteps} />

      {/* ═══ STEP 1 — Application Details ═══ */}
      {step === 1 && (
        <div>
          {savedAppId && currentApp && (
            <div className="mb-5 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
              <span className="text-amber-800 font-medium">Saved draft: <span className="font-semibold text-[#164e63]">{currentApp.projectName || 'Untitled'}</span></span>
              <div className="ml-auto flex gap-3 text-xs font-semibold">
                <button onClick={() => goToStep(2)} className="text-[#164e63] hover:underline">Continue draft →</button>
                <button onClick={startNew} className="text-gray-400 hover:text-red-500">Start new</button>
              </div>
            </div>
          )}
          {step1Success && <div className="mb-4 bg-cyan-50 border border-cyan-200 text-cyan-700 rounded-lg px-4 py-3 text-sm font-semibold">{step1Success}</div>}

          <form onSubmit={(e) => { e.preventDefault(); handleStep1(false); }} className="space-y-6">
            {/* Application Type */}
            <div className="glass-card-strong p-6">
              <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#164e63] text-white text-xs rounded-full flex items-center justify-center font-bold">0</span>
                {getApplicationText('selectApplicationType', language)}
              </h3>
              <Field label={getApplicationText('selectApplicationType', language) + ' *'} id="applicationType">
                <ApplicationTypeDropdown value={selectedApplicationType} onChange={(type) => {
                  setSelectedApplicationType(type);
                  setSandDocChecks({}); setSandDocUploads({}); setSandAffidavitChecks({}); setSandAffidavitUploads({});
                  setLimestoneDocChecks({}); setLimestoneDocUploads({}); setLimestoneAffidavitChecks({}); setLimestoneAffidavitUploads({});
                  setBricksDocChecks({}); setBricksDocUploads({}); setBricksAffidavitChecks({}); setBricksAffidavitUploads({});
                  setInfrastructureDocChecks({}); setInfrastructureDocUploads({}); setInfrastructureAffidavitChecks({}); setInfrastructureAffidavitUploads({});
                  setIndustryAffidavitChecks({}); setIndustryAffidavitUploads({});
                }} />
              </Field>
            </div>

            {/* SAND checklist */}
            {selectedApplicationType === 'sand' && (
              <div className="glass-card-strong p-6 space-y-5">
                <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#164e63] text-white text-xs rounded-full flex items-center justify-center font-bold">*</span>
                  {getApplicationText('sandChecklist', language)}
                </h3>
                <SandChecklist checkedItems={sandDocChecks} onToggle={toggleSandDoc} uploadedFiles={sandDocUploads} onFileSelect={handleSandDocUpload} />
                <div className="bg-white rounded-lg border border-cyan-100 overflow-hidden">
                  <div className="px-4 py-3 border-b border-cyan-100 bg-cyan-50/70">
                    <p className="text-sm font-semibold text-[#164e63]">Sand Mining Affidavits (Mandatory)</p>
                    <p className="text-xs text-gray-600 mt-1">Please confirm each affidavit point before submitting this Sand Mining application.</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {SAND_AFFIDAVIT_ITEMS.map((item, index) => {
                      const id = `sandAffidavit-${index + 1}`;
                      return (<ChecklistItemWithUpload key={id} id={id} label={item} index={index} checked={!!sandAffidavitChecks[id]} onToggle={toggleSandAffidavit} uploadedFileName={sandAffidavitUploads[id]} onFileSelect={handleSandAffidavitUpload} checkedClassName="bg-cyan-50 border-[#164e63]/40" uncheckedClassName="bg-white border-gray-200 hover:border-[#164e63]/30" />);
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* LIMESTONE checklist */}
            {selectedApplicationType === 'limestone' && (
              <div className="glass-card-strong p-6 space-y-5">
                <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#164e63] text-white text-xs rounded-full flex items-center justify-center font-bold">*</span>
                  {getApplicationText('limestoneChecklist', language)}
                </h3>
                <LimestoneChecklist checkedItems={limestoneDocChecks} onToggle={toggleLimestoneDoc} uploadedFiles={limestoneDocUploads} onFileSelect={handleLimestoneDocUpload} />
                <div className="bg-white rounded-lg border border-cyan-100 overflow-hidden">
                  <div className="px-4 py-3 border-b border-cyan-100 bg-cyan-50/70">
                    <p className="text-sm font-semibold text-[#164e63]">Limestone Mining Affidavits (Mandatory)</p>
                    <p className="text-xs text-gray-600 mt-1">Please confirm each affidavit point before submitting this Limestone Mining application.</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {LIMESTONE_AFFIDAVIT_ITEMS.map((item, index) => {
                      const id = `limestoneAffidavit-${index + 1}`;
                      return (<ChecklistItemWithUpload key={id} id={id} label={item} index={index} checked={!!limestoneAffidavitChecks[id]} onToggle={toggleLimestoneAffidavit} uploadedFileName={limestoneAffidavitUploads[id]} onFileSelect={handleLimestoneAffidavitUpload} checkedClassName="bg-cyan-50 border-[#164e63]/40" uncheckedClassName="bg-white border-gray-200 hover:border-[#164e63]/30" />);
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* BRICKS checklist */}
            {selectedApplicationType === 'bricks' && (
              <div className="glass-card-strong p-6 space-y-5">
                <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#164e63] text-white text-xs rounded-full flex items-center justify-center font-bold">*</span>
                  {getApplicationText('bricksChecklist', language)}
                </h3>
                <BricksChecklist checkedItems={bricksDocChecks} onToggle={toggleBricksDoc} uploadedFiles={bricksDocUploads} onFileSelect={handleBricksDocUpload} />
                <div className="bg-white rounded-lg border border-cyan-100 overflow-hidden">
                  <div className="px-4 py-3 border-b border-cyan-100 bg-cyan-50/70">
                    <p className="text-sm font-semibold text-[#164e63]">Bricks Manufacturing Affidavits (Mandatory)</p>
                    <p className="text-xs text-gray-600 mt-1">Please confirm each affidavit point before submitting.</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {PROJECT_COMPLIANCE_AFFIDAVIT_ITEMS.map((item, index) => {
                      const id = `bricksAffidavit-${index + 1}`;
                      return (<ChecklistItemWithUpload key={id} id={id} label={item} index={index} checked={!!bricksAffidavitChecks[id]} onToggle={toggleBricksAffidavit} uploadedFileName={bricksAffidavitUploads[id]} onFileSelect={handleBricksAffidavitUpload} checkedClassName="bg-cyan-50 border-[#164e63]/40" uncheckedClassName="bg-white border-gray-200 hover:border-[#164e63]/30" />);
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* INFRASTRUCTURE checklist */}
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
                    <input
                      id="projectCost"
                      type="number"
                      className={inputCls}
                      value={form.projectCost ?? ''}
                      onChange={(e) => setField('projectCost', e.target.value === '' ? undefined : Number(e.target.value))}
                      required
                      min={0}
                      placeholder="e.g. 450000000"
                    />
                  </Field>
                  <Field label="Project Area (hectares) *" id="projectArea">
                    <input
                      id="projectArea"
                      type="number"
                      className={inputCls}
                      value={form.projectArea ?? ''}
                      onChange={(e) => setField('projectArea', e.target.value === '' ? undefined : Number(e.target.value))}
                      required
                      min={0}
                      step="0.01"
                      placeholder="e.g. 250"
                    />
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

              <NavButtons
                step={1}
                onNext={() => void handleStep1(false)}
                nextLabel="Save & Continue"
                nextLoading={isLoading}
                nextDisabled={!form.projectName?.trim() || !allMandatoryChecked}
                extraButton={
                  <button type="button" onClick={() => void handleStep1(true)} disabled={isLoading}
                    className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
                    Save as Draft
                  </button>
                }
              />
            </form>
        </div>
      )}

      {/* ═══ STEP 2 — Upload Documents ═══ */}
      {step === 2 && (
        <div>
          {!savedAppId ? noAppWarning : (
            <>
              <div className="glass-card-strong p-6 mb-4">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Upload size={16} /> Upload Supporting Documents
                </h3>
                <p className="text-xs text-gray-400 mb-5">Upload scanned copies of all documents listed in Step 1. Accepted: PDF, JPG, PNG (max 10 MB each).</p>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-[#164e63]/40 transition-colors">
                  <Upload size={28} className="text-gray-300 mb-3" />
                  <span className="text-sm text-gray-500 font-medium">Click to select files</span>
                  <span className="text-xs text-gray-400 mt-1">or drag & drop here</span>
                  <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
                {uploading && <p className="text-sm text-[#164e63] mt-3">Uploading…</p>}
                {uploadError && <p className="text-sm text-red-600 mt-3">{uploadError}</p>}
                {uploadSuccess && <p className="text-sm text-green-600 mt-3 font-semibold">{uploadSuccess}</p>}
              </div>

              {currentApp && currentApp.documents.length > 0 && (
                <div className="glass-card-strong p-5 mb-4">
                  <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                    <FileText size={14} /> Uploaded Documents
                  </h4>
                  <ul className="space-y-2">
                    {currentApp.documents.map((doc) => (
                      <li key={doc.id} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2">
                        <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                        <span className="truncate text-gray-700">{doc.name}</span>
                        <span className="ml-auto text-[10px] text-gray-400 font-mono">{doc.type}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <NavButtons
                step={2}
                onBack={() => goToStep(1)}
                onNext={() => goToStep(3)}
                nextLabel="Continue to EDS"
                nextDisabled={!completedSteps.includes(2) && !uploadSuccess}
              />
            </>
          )}
        </div>
      )}

      {/* ═══ STEP 3 — EDS Queries ═══ */}
      {step === 3 && (
        <div>
          {!savedAppId ? noAppWarning : (
            <>
              <div className="glass-card-strong p-6 mb-4">
                <h3 className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <MessageSquare size={16} /> EDS Queries
                </h3>
                <p className="text-xs text-gray-400 mb-5">Respond to scrutiny queries raised on your application to proceed.</p>
                {edsLoading && <SkeletonLoader variant="detail" />}
                {edsError && <p className="text-sm text-red-600">{edsError}</p>}
                {!edsLoading && edsQueries.length === 0 && (
                  <div className="text-center py-6 text-gray-400">
                    <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No EDS queries raised yet. You may proceed to payment.</p>
                  </div>
                )}
                {!edsLoading && edsQueries.length > 0 && (
                  <div className="space-y-3">
                    {edsQueries.map((q) => (
                      <div key={q.id} className="border border-gray-100 rounded-xl overflow-hidden">
                        <button type="button"
                          onClick={() => setExpandedQuery(expandedQuery === q.id ? null : q.id)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-amber-50/60 hover:bg-amber-50 text-left transition-colors">
                          <span className="text-sm font-medium text-gray-800">{q.subject}</span>
                          {expandedQuery === q.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        {expandedQuery === q.id && (
                          <div className="px-4 pb-4 pt-2 space-y-2 bg-white">
                            <p className="text-xs text-gray-500">{q.description}</p>
                            {q.response ? (
                              <div className="bg-green-50 rounded-lg px-3 py-2 text-sm text-green-800">
                                <span className="font-semibold">Your response: </span>{q.response}
                              </div>
                            ) : (
                              <>
                                <textarea
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#164e63] resize-none"
                                  rows={3}
                                  placeholder="Type your response…"
                                  value={responses[q.id] ?? ''}
                                  onChange={(e) => setResponses((r) => ({ ...r, [q.id]: e.target.value }))}
                                />
                                <div className="flex items-center justify-between">
                                  {edsSuccess[q.id] && <span className="text-xs text-green-600 font-semibold">{edsSuccess[q.id]}</span>}
                                  <button type="button" onClick={() => handleRespond(q.id)}
                                    disabled={!responses[q.id]?.trim() || edsSubmitting[q.id]}
                                    className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg, #164e63, #1f7ea4)' }}>
                                    <Send size={12} /> {edsSubmitting[q.id] ? 'Submitting…' : 'Submit Response'}
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <NavButtons step={3} onBack={() => goToStep(2)} onNext={() => goToStep(4)} nextLabel="Continue to Payment" />
            </>
          )}
        </div>
      )}

      {/* ═══ STEP 4 — Payment ═══ */}
      {step === 4 && (
        <div>
          {!savedAppId ? noAppWarning : (
            <>
              <div className="glass-card-strong p-6 mb-4">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><CreditCard size={16} /> Application Fee</h3>
                {isPaid ? (
                  <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-4">
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-800">Payment Completed</p>
                      <p className="text-xs text-gray-500 mt-0.5">{paySuccess || 'Your payment has been verified.'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Application Fee ({currentApp?.projectCategory})</span>
                        <span className="font-semibold">₹{feeAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">GST (18%)</span>
                        <span className="font-semibold">₹{(totalWithGST - feeAmount).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="border-t border-cyan-200 pt-2 flex justify-between text-sm font-bold text-[#164e63]">
                        <span>Total Payable</span>
                        <span className="flex items-center gap-1"><IndianRupee size={13} />{totalWithGST.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    {payError && <p className="text-sm text-red-600">{payError}</p>}
                    <button type="button" onClick={() => setShowPaymentModal(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #164e63, #1f7ea4)' }}>
                      <CreditCard size={16} /> Pay ₹{totalWithGST.toLocaleString('en-IN')} Now
                    </button>
                  </div>
                )}
              </div>
              <NavButtons step={4} onBack={() => goToStep(3)} onNext={() => goToStep(5)} nextLabel="Continue to Submit" nextDisabled={!isPaid} />
            </>
          )}
        </div>
      )}

      {/* ═══ STEP 5 — Submit ═══ */}
      {step === 5 && (
        <div>
          {!savedAppId ? noAppWarning : (
            <>
              <div className="glass-card-strong p-6 mb-4 text-center">
                <CheckCircle size={40} className="mx-auto mb-3 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Ready to Submit</h3>
                <p className="text-sm text-gray-500 mb-1">
                  Application: <span className="font-mono font-bold text-[#164e63]">{currentApp ? formatAppId(currentApp.applicationNumber) : ''}</span>
                </p>
                <p className="text-sm text-gray-500 mb-6">Project: <span className="font-semibold">{currentApp?.projectName}</span></p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 text-left">
                  {WIZARD_STEPS.filter((s) => s.step !== 5).map(({ step: s, label }) => (
                    <div key={s} className={`rounded-xl border p-3 text-xs ${completedSteps.includes(s) ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                      <div className={`font-bold mb-1 ${completedSteps.includes(s) ? 'text-green-700' : 'text-amber-700'}`}>
                        {completedSteps.includes(s) ? '✓' : '!'} Step {s}
                      </div>
                      <div className="text-gray-600">{label}</div>
                    </div>
                  ))}
                </div>
                {submitError && <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{submitError}</div>}
                {submitSuccess ? (
                  <p className="text-green-700 font-semibold text-sm">{submitSuccess} Redirecting…</p>
                ) : (
                  <button type="button" onClick={handleFinalSubmit} disabled={!isPaid || isLoading}
                    className="flex items-center gap-2 mx-auto justify-center px-8 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #164e63, #1f7ea4)' }}>
                    <Send size={16} /> Submit Application
                  </button>
                )}
              </div>
              <NavButtons step={5} onBack={() => goToStep(4)} />
            </>
          )}
        </div>
      )}

      {showPaymentModal && savedAppId && currentApp && (
        <PaymentModal
          applicationId={savedAppId}
          amount={totalWithGST}
          projectName={currentApp.projectName}
          category={currentApp.projectCategory}
          onSuccess={handlePaymentSuccess}
          onFailure={(msg) => setPayError(msg)}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </PageShell>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<SkeletonLoader />}>
      <ApplyWizardContent />
    </Suspense>
  );
}
