// =============================================================================
// IDEAS TYPES - Frontend Types for Idea Management
// =============================================================================

// -----------------------------------------------------------------------------
// Core Idea Types
// -----------------------------------------------------------------------------

export type ComplexityLevel = 'beginner' | 'intermediate' | 'advanced';
export type TimeCommitment = 'weekend' | 'week' | 'month';
export type IdeaStatus = 'draft' | 'published' | 'archived';

export interface Idea {
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

export interface ListIdeasResponse {
  ideas: Idea[];
  totalCount: number;
  hasMore: boolean;
}

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
// Form Types
// -----------------------------------------------------------------------------

export interface IdeaFormData {
  title: string;
  description: string;
  problemStatement: string;
  proposedSolution: string;
  techStack: string[];
  teamSizeNeeded: number;
  complexityLevel: ComplexityLevel;
  timeCommitment: TimeCommitment;
  status: IdeaStatus;
  tags: string[];
}

// -----------------------------------------------------------------------------
// Filter Types
// -----------------------------------------------------------------------------

export interface IdeaFilters {
  search: string;
  techStack: string[];
  complexityLevel: ComplexityLevel | '';
  timeCommitment: TimeCommitment | '';
  status: IdeaStatus | '';
  sortBy: 'createdAt' | 'updatedAt' | 'title';
  sortOrder: 'asc' | 'desc';
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

export const COMPLEXITY_LEVELS: { value: ComplexityLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export const TIME_COMMITMENTS: { value: TimeCommitment; label: string }[] = [
  { value: 'weekend', label: 'Weekend' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

export const IDEA_STATUSES: { value: IdeaStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

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
