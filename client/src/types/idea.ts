// =============================================================================
// IDEA TYPES - Frontend Types for Idea Management
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
// Request Types
// -----------------------------------------------------------------------------

export interface CreateIdeaRequest {
  title: string;
  description: string;
  skills: string[];
  category: IdeaCategory;
  difficulty: IdeaDifficulty;
  teamSize: number;
  status?: IdeaStatus;
}

export interface UpdateIdeaRequest {
  title?: string;
  description?: string;
  skills?: string[];
  category?: IdeaCategory;
  difficulty?: IdeaDifficulty;
  teamSize?: number;
  status?: IdeaStatus;
}

export interface VoteIdeaRequest {
  vote: number; // 1 for upvote, -1 for downvote
}

// -----------------------------------------------------------------------------
// Query & Response Types
// -----------------------------------------------------------------------------

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

export interface ListIdeasResponse {
  ideas: Idea[];
  totalCount: number;
}

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type IdeaListResponse = ApiResponse<ListIdeasResponse>;
export type IdeaResponse = ApiResponse<Idea>;
export type VoteResponse = ApiResponse<{ message: string }>;

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

export const IDEA_CATEGORIES: { value: IdeaCategory; label: string }[] = [
  { value: 'web', label: 'Web Development' },
  { value: 'mobile', label: 'Mobile Apps' },
  { value: 'ai', label: 'Artificial Intelligence' },
  { value: 'blockchain', label: 'Blockchain' },
  { value: 'iot', label: 'Internet of Things' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'fintech', label: 'Financial Technology' },
  { value: 'healthtech', label: 'Health Technology' },
  { value: 'edtech', label: 'Education Technology' },
  { value: 'other', label: 'Other' },
];

export const IDEA_DIFFICULTIES: { value: IdeaDifficulty; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export const IDEA_STATUSES: { value: IdeaStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

export const SORT_OPTIONS: { value: ListIdeasQuery['sortBy']; label: string }[] = [
  { value: 'created', label: 'Recently Created' },
  { value: 'updated', label: 'Recently Updated' },
  { value: 'votes', label: 'Most Voted' },
  { value: 'feasibility', label: 'Most Feasible' },
];

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

export function getCategoryLabel(category: IdeaCategory): string {
  return IDEA_CATEGORIES.find((c) => c.value === category)?.label || category;
}

export function getDifficultyLabel(difficulty: IdeaDifficulty): string {
  return IDEA_DIFFICULTIES.find((d) => d.value === difficulty)?.label || difficulty;
}

export function getStatusLabel(status: IdeaStatus): string {
  return IDEA_STATUSES.find((s) => s.value === status)?.label || status;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
