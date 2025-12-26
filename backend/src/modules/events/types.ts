/**
 * Event Management Module Types
 *
 * Domain-specific TypeScript types for event management functionality
 */

// =============================================================================
// CORE EVENT TYPES
// =============================================================================

export interface Event {
  id: string;
  name: string;
  description: string;
  organizerId: string;
  organizerName: string;
  startDate: string; // ISO timestamp
  endDate: string; // ISO timestamp
  registrationDeadline: string; // ISO timestamp
  location: string; // physical location or "Virtual"
  maxParticipants: number;
  currentParticipants: number;
  categories: string[];
  prizes: Prize[];
  rules: string;
  status: EventStatus;
  isPublic: boolean;
  requiresApproval: boolean;
  tags: string[]; // AI-generated tags
  trendScore: number; // AI-assessed trend relevance 1-10
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface Prize {
  position: number; // 1st, 2nd, 3rd, etc.
  title: string;
  description: string;
  value?: string; // monetary value or description
}

export type EventStatus = 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';

// =============================================================================
// EVENT PARTICIPANT TYPES
// =============================================================================

export interface EventParticipant {
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  skills: string[];
  registrationStatus: ParticipantStatus;
  registeredAt: string; // ISO timestamp
  approvedAt?: string; // ISO timestamp, optional
}

export type ParticipantStatus = 'registered' | 'approved' | 'waitlisted' | 'cancelled';

// =============================================================================
// EVENT SETTINGS TYPES
// =============================================================================

export interface EventSettings {
  eventId: string;
  allowTeamFormation: boolean;
  allowIdeaSubmission: boolean;
  allowJudgeScoring: boolean;
  maxTeamSize: number;
  ideaSubmissionDeadline?: string; // ISO timestamp
  judgingStartDate?: string; // ISO timestamp
  customFields: CustomField[];
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox';
  required: boolean;
  options?: string[]; // for select/multiselect
  placeholder?: string;
}

// =============================================================================
// REQUEST/RESPONSE TYPES
// =============================================================================

export interface CreateEventRequest {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  location: string;
  maxParticipants: number;
  categories: string[];
  prizes: Prize[];
  rules: string;
  isPublic: boolean;
  requiresApproval: boolean;
  settings?: Partial<EventSettings>;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  status?: EventStatus;
}

export interface ListEventsQuery {
  limit?: number;
  offset?: number;
  status?: EventStatus;
  category?: string;
  location?: string;
  organizerId?: string;
  isPublic?: boolean;
  search?: string;
  sortBy?: 'startDate' | 'createdAt' | 'trendScore' | 'currentParticipants';
  sortOrder?: 'asc' | 'desc';
}

export interface EventListResponse {
  events: Event[];
  total: number;
  hasMore: boolean;
}

export interface EventRegistrationRequest {
  skills: string[];
  customFieldResponses?: Record<string, any>;
}

// =============================================================================
// AI ENHANCEMENT TYPES
// =============================================================================

export interface AIEventEnhancement {
  enhancedDescription: string;
  suggestedCategories: string[];
  trendScore: number;
  suggestedTags: string[];
}

export interface EventTrendAnalysis {
  score: number; // 1-10
  reasoning: string;
  marketDemand: 'low' | 'medium' | 'high';
  techRelevance: 'low' | 'medium' | 'high';
  competitionLevel: 'low' | 'medium' | 'high';
}

// =============================================================================
// DATABASE TYPES (DynamoDB Single Table)
// =============================================================================

export interface EventDynamoItem {
  PK: string; // EVENT#[id]
  SK: string; // METADATA
  GSI1PK: string; // ORGANIZER#[organizerId]
  GSI1SK: string; // START_DATE#[startDate]
  GSI2PK?: string; // STATUS#[status]
  GSI2SK?: string; // TREND_SCORE#[trendScore]
  // Event fields
  id: string;
  name: string;
  description: string;
  organizerId: string;
  organizerName: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  categories: string[];
  prizes: Prize[];
  rules: string;
  status: EventStatus;
  isPublic: boolean;
  requiresApproval: boolean;
  tags: string[];
  trendScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantDynamoItem {
  PK: string; // EVENT#[id]
  SK: string; // PARTICIPANT#[userId]
  GSI1PK: string; // USER#[userId]
  GSI1SK: string; // REGISTERED#[timestamp]
  // Participant fields
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  skills: string[];
  registrationStatus: ParticipantStatus;
  registeredAt: string;
  approvedAt?: string;
}

export interface SettingsDynamoItem {
  PK: string; // EVENT#[id]
  SK: string; // SETTINGS
  GSI1PK: string; // EVENT#[id]
  GSI1SK: string; // SETTINGS
  // Settings fields
  eventId: string;
  allowTeamFormation: boolean;
  allowIdeaSubmission: boolean;
  allowJudgeScoring: boolean;
  maxTeamSize: number;
  ideaSubmissionDeadline?: string;
  judgingStartDate?: string;
  customFields: CustomField[];
}
