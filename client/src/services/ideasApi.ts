import { apiClient } from './apiClient';
import type {
  Idea,
  CreateIdeaRequest,
  UpdateIdeaRequest,
  EnhanceIdeaRequest,
  ListIdeasResponse,
  EnhanceIdeaResponse,
  ListIdeasQuery,
} from '../types/idea';

/**
 * Ideas API Service
 * Handles all API calls related to idea management
 */
export class IdeasApi {
  /**
   * List ideas with filtering and pagination
   */
  async listIdeas(query?: ListIdeasQuery): Promise<ListIdeasResponse> {
    const params = new URLSearchParams();

    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.techStack?.length) params.append('techStack', query.techStack.join(','));
    if (query?.complexityLevel) params.append('complexityLevel', query.complexityLevel);
    if (query?.timeCommitment) params.append('timeCommitment', query.timeCommitment);
    if (query?.status) params.append('status', query.status);
    if (query?.creatorId) params.append('creatorId', query.creatorId);
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder);

    const queryString = params.toString();
    const url = queryString ? `/api/ideas?${queryString}` : '/api/ideas';

    return apiClient.get<ListIdeasResponse>(url);
  }

  /**
   * Get idea by ID
   */
  async getIdea(id: string): Promise<Idea> {
    return apiClient.get<Idea>(`/api/ideas/${id}`);
  }

  /**
   * Create a new idea
   */
  async createIdea(data: CreateIdeaRequest): Promise<Idea> {
    return apiClient.post<Idea>('/api/ideas', data);
  }

  /**
   * Update an existing idea
   */
  async updateIdea(id: string, data: UpdateIdeaRequest): Promise<Idea> {
    return apiClient.put<Idea>(`/api/ideas/${id}`, data);
  }

  /**
   * Delete an idea
   */
  async deleteIdea(id: string): Promise<void> {
    return apiClient.delete(`/api/ideas/${id}`);
  }

  /**
   * Enhance idea description using AI
   */
  async enhanceIdea(data: EnhanceIdeaRequest): Promise<EnhanceIdeaResponse> {
    return apiClient.post<EnhanceIdeaResponse>('/api/ideas/enhance', data);
  }

  /**
   * Get ideas by current user
   */
  async getMyIdeas(query?: Omit<ListIdeasQuery, 'creatorId'>): Promise<ListIdeasResponse> {
    // Note: The backend will automatically filter by the authenticated user's ID
    // when using the ownership middleware
    return this.listIdeas(query);
  }
}

// Export singleton instance
export const ideasApi = new IdeasApi();
