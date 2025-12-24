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
// Enhanced Features Types (M05)
// -----------------------------------------------------------------------------

/** Proposal Analytics Data */
export interface ProposalAnalytics {
  proposalId: string;
  totalViews: number;
  uniqueViews: number;
  timeSpentViewing: number; // seconds
  lastViewedAt?: string;
  viewsBySection: Record<string, number>;
  engagementScore: number; // 0-100
  responseTime?: number; // hours from send to response
  viewTimeline: ViewEvent[];
}

/** View Tracking Event */
export interface ViewEvent {
  timestamp: string;
  clientId?: string;
  clientEmail?: string;
  section?: string;
  timeSpent: number; // seconds
  userAgent?: string;
}

/** Proposal Comment */
export interface ProposalComment {
  id: string;
  proposalId: string;
  userId: string;
  userRole: 'freelancer' | 'client';
  userName: string;
  content: string;
  createdAt: string;
  isInternal: boolean; // freelancer-only notes
}

/** Proposal Version */
export interface ProposalVersion {
  versionNumber: number;
  proposalId: string;
  changes: string[];
  createdBy: string;
  createdAt: string;
  previousVersion?: number;
  snapshot: Partial<Proposal>; // snapshot of proposal at this version
}

/** Engagement Metrics */
export interface EngagementMetrics {
  viewRate: number; // % of sent proposals viewed
  averageResponseTime: number; // hours
  acceptanceRate: number; // % of proposals accepted
  averageEngagementTime: number; // seconds
  commentEngagementRate: number; // % with client comments
}

// -----------------------------------------------------------------------------
// Request/Response Types for Enhanced Features
// -----------------------------------------------------------------------------

/** POST /api/proposals/:id/track-view */
export interface TrackViewRequest {
  section?: string;
  timeSpent: number;
  userAgent?: string;
}

/** POST /api/proposals/:id/comments */
export interface AddCommentRequest {
  content: string;
  isInternal?: boolean;
}

/** GET /api/proposals/:id/analytics response */
export interface ProposalAnalyticsResponse {
  analytics: ProposalAnalytics;
}

/** GET /api/proposals/:id/versions response */
export interface ProposalVersionsResponse {
  versions: ProposalVersion[];
}

/** GET /api/proposals/:id/comments response */
export interface ProposalCommentsResponse {
  comments: ProposalComment[];
}

/** POST /api/proposals/:id/duplicate response */
export interface DuplicateProposalResponse {
  proposal: Proposal;
}

// -----------------------------------------------------------------------------
// DynamoDB Item Structures for Enhanced Features
// -----------------------------------------------------------------------------

export interface ProposalAnalyticsDynamoItem {
  PK: string; // PROPOSAL#[id]
  SK: string; // ANALYTICS
  GSI1PK: string; // ANALYTICS#PROPOSAL
  GSI1SK: string; // [timestamp]
  proposalId: string;
  totalViews: number;
  uniqueViews: number;
  timeSpentViewing: number;
  lastViewedAt?: string;
  viewsBySection: Record<string, number>;
  engagementScore: number;
  responseTime?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ViewEventDynamoItem {
  PK: string; // PROPOSAL#[id]
  SK: string; // VIEW#[timestamp]
  GSI1PK: string; // CLIENT#[clientId] or CLIENT#[clientEmail]
  GSI1SK: string; // VIEW#[timestamp]
  proposalId: string;
  timestamp: string;
  clientId?: string;
  clientEmail?: string;
  section?: string;
  timeSpent: number;
  userAgent?: string;
}

export interface ProposalCommentDynamoItem {
  PK: string; // PROPOSAL#[id]
  SK: string; // COMMENT#[commentId]
  GSI1PK: string; // COMMENT#[userId]
  GSI1SK: string; // [timestamp]
  id: string;
  proposalId: string;
  userId: string;
  userRole: 'freelancer' | 'client';
  userName: string;
  content: string;
  createdAt: string;
  isInternal: boolean;
}

export interface ProposalVersionDynamoItem {
  PK: string; // PROPOSAL#[id]
  SK: string; // VERSION#[versionNumber]
  GSI1PK: string; // VERSION#PROPOSAL
  GSI1SK: string; // [timestamp]
  versionNumber: number;
  proposalId: string;
  changes: string[];
  createdBy: string;
  createdAt: string;
  previousVersion?: number;
  snapshot: string; // JSON stringified Partial<Proposal>
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
