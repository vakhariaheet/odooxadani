// =============================================================================
// PROPOSAL TYPES - Frontend
// =============================================================================

// -----------------------------------------------------------------------------
// Core Proposal Interface
// -----------------------------------------------------------------------------
export interface Proposal {
  id: string;
  title: string;
  description: string; // Rich text content
  freelancerId: string;
  clientId: string;
  clientEmail: string;
  status: ProposalStatus;
  amount: number;
  currency: string;
  deliverables: string[];
  timeline: string;
  terms: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  viewedAt?: string; // ISO string - when client first viewed
  respondedAt?: string; // ISO string - when client accepted/rejected
}

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------
export const ProposalStatus = {
  DRAFT: 'draft',
  SENT: 'sent',
  VIEWED: 'viewed',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
} as const;

export type ProposalStatus = (typeof ProposalStatus)[keyof typeof ProposalStatus];

// -----------------------------------------------------------------------------
// Request Types
// -----------------------------------------------------------------------------

/** POST /api/proposals */
export interface CreateProposalRequest {
  title: string;
  description: string;
  clientEmail: string;
  amount: number;
  currency?: string; // Default to USD
  deliverables: string[];
  timeline: string;
  terms: string;
}

/** PUT /api/proposals/:id */
export interface UpdateProposalRequest {
  title?: string;
  description?: string;
  clientEmail?: string;
  amount?: number;
  currency?: string;
  deliverables?: string[];
  timeline?: string;
  terms?: string;
  status?: ProposalStatus; // Clients can update status to accepted/rejected
}

// -----------------------------------------------------------------------------
// Query & Response Types
// -----------------------------------------------------------------------------

/** GET /api/proposals query params */
export interface ListProposalsQuery {
  limit?: number;
  offset?: number;
  status?: ProposalStatus;
  clientEmail?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

/** API Response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

/** GET /api/proposals response */
export interface ListProposalsResponse extends ApiResponse<{
  proposals: Proposal[];
  totalCount: number;
  hasMore: boolean;
}> {}

/** GET /api/proposals/:id response */
export interface GetProposalResponse extends ApiResponse<{
  proposal: Proposal;
}> {}

/** POST /api/proposals response */
export interface CreateProposalResponse extends ApiResponse<{
  proposal: Proposal;
}> {}

/** PUT /api/proposals/:id response */
export interface UpdateProposalResponse extends ApiResponse<{
  proposal: Proposal;
}> {}

// -----------------------------------------------------------------------------
// Form Types
// -----------------------------------------------------------------------------
export interface ProposalFormData {
  title: string;
  description: string;
  clientEmail: string;
  amount: string; // String for form input
  currency: string;
  deliverables: string[];
  timeline: string;
  terms: string;
}

// -----------------------------------------------------------------------------
// UI Helper Types
// -----------------------------------------------------------------------------
export interface ProposalStatusConfig {
  label: string;
  color: 'default' | 'secondary' | 'destructive' | 'outline';
  bgColor: string;
  textColor: string;
}

export const PROPOSAL_STATUS_CONFIG: Record<ProposalStatus, ProposalStatusConfig> = {
  [ProposalStatus.DRAFT]: {
    label: 'Draft',
    color: 'outline',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
  },
  [ProposalStatus.SENT]: {
    label: 'Sent',
    color: 'secondary',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
  [ProposalStatus.VIEWED]: {
    label: 'Viewed',
    color: 'default',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
  },
  [ProposalStatus.ACCEPTED]: {
    label: 'Accepted',
    color: 'default',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
  },
  [ProposalStatus.REJECTED]: {
    label: 'Rejected',
    color: 'destructive',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
  },
};

// -----------------------------------------------------------------------------
// Filter and Sort Options
// -----------------------------------------------------------------------------
export const PROPOSAL_SORT_OPTIONS = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'updatedAt', label: 'Updated Date' },
  { value: 'amount', label: 'Amount' },
] as const;

export const PROPOSAL_STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: ProposalStatus.DRAFT, label: 'Draft' },
  { value: ProposalStatus.SENT, label: 'Sent' },
  { value: ProposalStatus.VIEWED, label: 'Viewed' },
  { value: ProposalStatus.ACCEPTED, label: 'Accepted' },
  { value: ProposalStatus.REJECTED, label: 'Rejected' },
] as const;

export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'INR', label: 'INR (₹)' },
] as const;
