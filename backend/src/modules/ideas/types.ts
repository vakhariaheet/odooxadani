// =============================================================================
// IDEAS TYPES - Idea Pitch Management Module
// =============================================================================

// -----------------------------------------------------------------------------
// Core Idea Types
// -----------------------------------------------------------------------------

export type ComplexityLevel = 'beginner' | 'intermediate' | 'advanced';
export type TimeCommitment = 'weekend' | 'week' | 'month';
export type IdeaStatus = 'draft' | 'published' | 'archived';

export interface IdeaResponse {
  id: string;
  title: string;
  description: string;
  problemStatement: string;
  proposedSolution: string;
  techStack: string[];
  teamSizeNeeded: number;
  complexityLevel: ComplexityLevel;
  timeCommitment: TimeCommitment;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  status: IdeaStatus;
  tags: string[];
}

// -----------------------------------------------------------------------------
// Request Types
// -----------------------------------------------------------------------------

/** POST /api/ideas */
export interface CreateIdeaRequest {
  title: string;
  description: string;
  problemStatement: string;
  proposedSolution: string;
  techStack: string[];
  teamSizeNeeded: number;
  complexityLevel: ComplexityLevel;
  timeCommitment: TimeCommitment;
  status?: IdeaStatus;
  tags?: string[];
}

/** PUT /api/ideas/:id */
export interface UpdateIdeaRequest {
  title?: string;
  description?: string;
  problemStatement?: string;
  proposedSolution?: string;
  techStack?: string[];
  teamSizeNeeded?: number;
  complexityLevel?: ComplexityLevel;
  timeCommitment?: TimeCommitment;
  status?: IdeaStatus;
  tags?: string[];
}

/** POST /api/ideas/enhance */
export interface EnhanceIdeaRequest {
  description: string;
  problemStatement?: string;
  targetAudience?: string;
  techPreferences?: string[];
  complexityLevel?: ComplexityLevel;
}

// -----------------------------------------------------------------------------
// Response Types
// -----------------------------------------------------------------------------

/** GET /api/ideas response */
export interface ListIdeasResponse {
  ideas: IdeaResponse[];
  totalCount: number;
  hasMore: boolean;
}

/** POST /api/ideas/enhance response */
export interface EnhanceIdeaResponse {
  enhancedDescription: string;
  suggestedTechStack: string[];
  recommendedTeamRoles: string[];
  improvementSuggestions: string[];
  confidence: number;
  timestamp: string;
}

// -----------------------------------------------------------------------------
// Query Types
// -----------------------------------------------------------------------------

/** GET /api/ideas query params */
export interface ListIdeasQuery {
  limit?: number;
  offset?: number;
  search?: string;
  techStack?: string[];
  complexityLevel?: ComplexityLevel;
  timeCommitment?: TimeCommitment;
  status?: IdeaStatus;
  creatorId?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// -----------------------------------------------------------------------------
// Database Types (DynamoDB)
// -----------------------------------------------------------------------------

export interface IdeaEntity {
  PK: string; // IDEA#[id]
  SK: string; // DETAILS
  GSI1PK: string; // USER#[creatorId]
  GSI1SK: string; // IDEA#[id]
  GSI2PK: string; // STATUS#[status]
  GSI2SK: string; // CREATED#[createdAt]

  // Idea data
  id: string;
  title: string;
  description: string;
  problemStatement: string;
  proposedSolution: string;
  techStack: string[];
  teamSizeNeeded: number;
  complexityLevel: ComplexityLevel;
  timeCommitment: TimeCommitment;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  status: IdeaStatus;
  tags: string[];

  // Metadata
  entityType: 'IDEA';
}

// -----------------------------------------------------------------------------
// Validation Constants
// -----------------------------------------------------------------------------

export const VALIDATION_RULES = {
  title: {
    minLength: 3,
    maxLength: 100,
  },
  description: {
    minLength: 10,
    maxLength: 2000,
  },
  problemStatement: {
    minLength: 10,
    maxLength: 500,
  },
  proposedSolution: {
    minLength: 10,
    maxLength: 1000,
  },
  techStack: {
    minItems: 1,
    maxItems: 10,
  },
  teamSizeNeeded: {
    min: 1,
    max: 6,
  },
  tags: {
    maxItems: 10,
    maxLength: 30,
  },
} as const;

export const COMPLEXITY_LEVELS: ComplexityLevel[] = ['beginner', 'intermediate', 'advanced'];
export const TIME_COMMITMENTS: TimeCommitment[] = ['weekend', 'week', 'month'];
export const IDEA_STATUSES: IdeaStatus[] = ['draft', 'published', 'archived'];
