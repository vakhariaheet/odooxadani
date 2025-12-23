// =============================================================================
// CONTRACT TYPES - Contract Management Module
// =============================================================================

// -----------------------------------------------------------------------------
// Core Contract Types
// -----------------------------------------------------------------------------
export interface Contract extends Record<string, unknown> {
  id: string;
  proposalId?: string; // If created from proposal
  title: string;
  content: string; // Contract terms
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
  // DynamoDB keys
  PK: string; // CONTRACT#{id}
  SK: string; // METADATA
  GSI1PK: string; // FREELANCER#{freelancerId} or CLIENT#{clientId}
  GSI1SK: string; // CONTRACT#{createdAt}
}

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------
export enum ContractStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  SIGNED = 'signed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum SignatureType {
  TYPED = 'typed',
  DRAWN = 'drawn', // Future enhancement
}

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

/** POST /api/contracts */
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

/** PUT /api/contracts/:id */
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

/** POST /api/contracts/:id/sign */
export interface SignContractRequest {
  signerName: string;
}

// -----------------------------------------------------------------------------
// Response Types
// -----------------------------------------------------------------------------

/** GET /api/contracts */
export interface ListContractsResponse {
  contracts: Contract[];
  totalCount: number;
}

/** GET /api/contracts/:id */
export interface GetContractResponse {
  contract: Contract;
}

/** POST /api/contracts */
export interface CreateContractResponse {
  contract: Contract;
}

/** PUT /api/contracts/:id */
export interface UpdateContractResponse {
  contract: Contract;
}

/** POST /api/contracts/:id/sign */
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
// DynamoDB Item Types
// -----------------------------------------------------------------------------
export interface ContractItem extends Contract {
  // Additional DynamoDB-specific fields if needed
}

export interface SignatureItem {
  PK: string; // CONTRACT#{contractId}
  SK: string; // SIGNATURE#{signerId}
  GSI1PK: string; // CONTRACT#{contractId}
  GSI1SK: string; // SIGNATURE#{signedAt}
  contractId: string;
  signature: Signature;
  createdAt: string;
  updatedAt: string;
}
