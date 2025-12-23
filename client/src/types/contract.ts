// =============================================================================
// CONTRACT TYPES - Frontend
// =============================================================================

// -----------------------------------------------------------------------------
// Core Contract Types
// -----------------------------------------------------------------------------
export interface Contract {
  id: string;
  proposalId?: string;
  title: string;
  content: string;
  freelancerId: string;
  clientId: string;
  clientEmail: string;
  status: ContractStatus;
  amount: number;
  currency: string;
  deliverables: string[];
  timeline: string;
  terms: string;
  signatures: Signature[];
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  signedAt?: string;
}

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------
export const ContractStatus = {
  DRAFT: 'draft',
  SENT: 'sent',
  SIGNED: 'signed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type ContractStatus = (typeof ContractStatus)[keyof typeof ContractStatus];

export const SignatureType = {
  TYPED: 'typed',
  DRAWN: 'drawn',
} as const;

export type SignatureType = (typeof SignatureType)[keyof typeof SignatureType];

// -----------------------------------------------------------------------------
// Signature Types
// -----------------------------------------------------------------------------
export interface Signature {
  signerId: string;
  signerName: string;
  signerEmail: string;
  signedAt: string;
  ipAddress: string;
  userAgent: string;
  signatureType: SignatureType;
}

// -----------------------------------------------------------------------------
// Request Types
// -----------------------------------------------------------------------------
export interface CreateContractRequest {
  proposalId?: string;
  title: string;
  content: string;
  clientId: string;
  clientEmail: string;
  amount: number;
  currency: string;
  deliverables: string[];
  timeline: string;
  terms: string;
}

export interface UpdateContractRequest {
  title?: string;
  content?: string;
  amount?: number;
  currency?: string;
  deliverables?: string[];
  timeline?: string;
  terms?: string;
  status?: ContractStatus;
}

export interface SignContractRequest {
  signerName: string;
}

// -----------------------------------------------------------------------------
// Response Types
// -----------------------------------------------------------------------------
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

export interface ListContractsResponse {
  contracts: Contract[];
  totalCount: number;
}

export interface GetContractResponse {
  contract: Contract;
}

export interface CreateContractResponse {
  contract: Contract;
}

export interface UpdateContractResponse {
  contract: Contract;
}

export interface SignContractResponse {
  signature: Signature;
  contract: Contract;
}

// -----------------------------------------------------------------------------
// Query Types
// -----------------------------------------------------------------------------
export interface ListContractsQuery {
  status?: ContractStatus;
  limit?: number;
  offset?: number;
}

// -----------------------------------------------------------------------------
// UI Helper Types
// -----------------------------------------------------------------------------
export interface ContractFormData {
  title: string;
  content: string;
  clientId: string;
  clientEmail: string;
  amount: string; // String for form input
  currency: string;
  deliverables: string[];
  timeline: string;
  terms: string;
}

export interface SignatureFormData {
  signerName: string;
  agreed: boolean;
}
