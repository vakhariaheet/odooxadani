// =============================================================================
// IDEAS TYPES - Idea Management Module (F01)
// =============================================================================

// -----------------------------------------------------------------------------
// Core Idea Types
// -----------------------------------------------------------------------------

export interface Idea {
  id: string;
  title: string;
  description: string;
  skills: string[];
  category: IdeaCategory;
  difficulty: IdeaDifficulty;
  teamSize: number;
  authorId: string;
  authorName: string;
  votes: number;
  status: IdeaStatus;
  tags: string[];
  feasibilityScore: number;
  createdAt: string;
  updatedAt: string;
}

export type IdeaCategory =
  | 'web'
  | 'mobile'
  | 'ai'
  | 'blockchain'
  | 'iot'
  | 'gaming'
  | 'fintech'
  | 'healthtech'
  | 'edtech'
  | 'other';

export type IdeaDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type IdeaStatus = 'draft' | 'published' | 'archived';

// -----------------------------------------------------------------------------
// Vote Types
// -----------------------------------------------------------------------------

export interface IdeaVote {
  ideaId: string;
  userId: string;
  vote: number; // 1 for upvote, -1 for downvote
  votedAt: string;
}

// -----------------------------------------------------------------------------
// Request Types
// -----------------------------------------------------------------------------

/** POST /api/ideas */
export interface CreateIdeaRequest {
  title: string;
  description: string;
  skills: string[];
  category: IdeaCategory;
  difficulty: IdeaDifficulty;
  teamSize: number;
  status?: IdeaStatus;
}

/** PUT /api/ideas/:id */
export interface UpdateIdeaRequest {
  title?: string;
  description?: string;
  skills?: string[];
  category?: IdeaCategory;
  difficulty?: IdeaDifficulty;
  teamSize?: number;
  status?: IdeaStatus;
}

/** POST /api/ideas/:id/vote */
export interface VoteIdeaRequest {
  vote: number; // 1 for upvote, -1 for downvote
}

// -----------------------------------------------------------------------------
// Query & Response Types
// -----------------------------------------------------------------------------

/** GET /api/ideas query params */
export interface ListIdeasQuery {
  limit?: number;
  offset?: number;
  category?: IdeaCategory;
  difficulty?: IdeaDifficulty;
  skills?: string[];
  status?: IdeaStatus;
  authorId?: string;
  sortBy?: 'created' | 'updated' | 'votes' | 'feasibility';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

/** GET /api/ideas response */
export interface ListIdeasResponse {
  ideas: Idea[];
  totalCount: number;
}

// -----------------------------------------------------------------------------
// AI Enhancement Types
// -----------------------------------------------------------------------------

export interface AIEnhancementResult {
  enhancedDescription: string;
  generatedTags: string[];
  feasibilityScore: number;
  suggestions?: string[];
}

export interface SimilarIdea {
  id: string;
  title: string;
  similarity: number;
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

export const IDEA_CATEGORIES: IdeaCategory[] = [
  'web',
  'mobile',
  'ai',
  'blockchain',
  'iot',
  'gaming',
  'fintech',
  'healthtech',
  'edtech',
  'other',
];

export const IDEA_DIFFICULTIES: IdeaDifficulty[] = ['beginner', 'intermediate', 'advanced'];

export const IDEA_STATUSES: IdeaStatus[] = ['draft', 'published', 'archived'];

/**
 * Validate idea category
 */
export function isValidCategory(category: string): category is IdeaCategory {
  return IDEA_CATEGORIES.includes(category as IdeaCategory);
}

/**
 * Validate idea difficulty
 */
export function isValidDifficulty(difficulty: string): difficulty is IdeaDifficulty {
  return IDEA_DIFFICULTIES.includes(difficulty as IdeaDifficulty);
}

/**
 * Validate idea status
 */
export function isValidStatus(status: string): status is IdeaStatus {
  return IDEA_STATUSES.includes(status as IdeaStatus);
}

/**
 * Generate idea ID
 */
export function generateIdeaId(): string {
  return `idea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate vote ID
 */
export function generateVoteId(ideaId: string, userId: string): string {
  return `${ideaId}_${userId}`;
}
