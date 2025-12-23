// =============================================================================
// PROPOSAL TYPES - Proposal Management Module
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
export enum ProposalStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

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

/** GET /api/proposals response */
export interface ListProposalsResponse {
  proposals: Proposal[];
  totalCount: number;
  hasMore: boolean;
}

/** GET /api/proposals/:id response */
export interface GetProposalResponse {
  proposal: Proposal;
}

/** POST /api/proposals response */
export interface CreateProposalResponse {
  proposal: Proposal;
}

/** PUT /api/proposals/:id response */
export interface UpdateProposalResponse {
  proposal: Proposal;
}

// -----------------------------------------------------------------------------
// DynamoDB Item Structure
// -----------------------------------------------------------------------------
export interface ProposalDynamoItem extends Proposal {
  PK: string; // PROPOSAL#[id]
  SK: string; // METADATA
  GSI1PK: string; // FREELANCER#[freelancerId]
  GSI1SK: string; // PROPOSAL#[createdAt]
  GSI2PK?: string; // CLIENT#[clientId] (when clientId is available)
  GSI2SK?: string; // PROPOSAL#[createdAt]
}

// -----------------------------------------------------------------------------
// Service Layer Types
// -----------------------------------------------------------------------------
export interface ProposalFilters {
  freelancerId?: string;
  clientId?: string;
  clientEmail?: string;
  status?: ProposalStatus;
}

export interface ProposalSortOptions {
  sortBy: 'createdAt' | 'updatedAt' | 'amount';
  sortOrder: 'asc' | 'desc';
}

export interface PaginationOptions {
  limit: number;
  offset: number;
}

// -----------------------------------------------------------------------------
// Email Notification Types
// -----------------------------------------------------------------------------
export interface ProposalNotificationData {
  proposalId: string;
  proposalTitle: string;
  freelancerName: string;
  clientEmail: string;
  amount: number;
  currency: string;
  viewUrl: string;
}

export interface StatusChangeNotificationData extends ProposalNotificationData {
  oldStatus: ProposalStatus;
  newStatus: ProposalStatus;
  respondedAt: string;
}
