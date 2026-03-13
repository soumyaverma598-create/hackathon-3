export type WorkflowStatus =
  | 'draft'
  | 'submitted'
  | 'under_scrutiny'
  | 'eds_raised'
  | 'referred'
  | 'mom_draft'
  | 'finalized';

export type ProjectCategory = 'A' | 'B1' | 'B2';
export type PaymentStatus = 'pending' | 'paid' | 'verified';
export type EDSQueryStatus = 'open' | 'responded' | 'closed';

export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface EDSQuery {
  id: string;
  queryNumber: string;
  subject: string;
  description: string;
  raisedAt: string;
  raisedBy: string;
  response?: string;
  respondedAt?: string;
  documents?: UploadedDocument[];
  status: EDSQueryStatus;
}

export interface GistContent {
  id: string;
  applicationId: string;
  projectBackground: string;
  proposalDetails: string;
  environmentalImpact: string;
  mitigationMeasures: string;
  recommendation: string;
  generatedAt: string;
  lastEditedAt?: string;
  isLocked: boolean;
}

export interface WorkflowApplication {
  id: string;
  applicationNumber: string;
  projectName: string;
  proponentName: string;
  proponentEmail: string;
  proponentPhone: string;
  projectCategory: ProjectCategory;
  projectSector: string;
  stateUT: string;
  district: string;
  projectCost: number;
  projectArea: number;
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  finalizedAt?: string;
  scrutinyAssignedTo?: string;
  edsQueries: EDSQuery[];
  remarks?: string;
  meetingDate?: string;
  meetingNumber?: string;
  gist?: GistContent;
  momContent?: string;
  paymentStatus: PaymentStatus;
  paymentAmount?: number;
  paymentTransactionId?: string;
  documents: UploadedDocument[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: string;
  applicationId?: string;
}
