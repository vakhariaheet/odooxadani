/**
 * Proposals API Service
 * Handles all proposal management operations
 */

import { apiClient } from './apiClient';
import type {
  Proposal,
  CreateProposalRequest,
  UpdateProposalRequest,
  ListProposalsQuery,
  ListProposalsResponse,
  GetProposalResponse,
  CreateProposalResponse,
  UpdateProposalResponse,
  ApiResponse,
} from '../types/proposal';

// =============================================================================
// PROPOSALS API
// =============================================================================

export const proposalsApi = {
  /**
   * List proposals with filtering and pagination
   */
  async listProposals(params?: ListProposalsQuery): Promise<ListProposalsResponse> {
    const searchParams = new URLSearchParams();

    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    if (params?.status) searchParams.set('status', params.status);
    if (params?.clientEmail) searchParams.set('clientEmail', params.clientEmail);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const queryString = searchParams.toString();
    const endpoint = `/api/proposals${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<ListProposalsResponse>(endpoint);
  },

  /**
   * Get single proposal by ID
   */
  async getProposal(proposalId: string): Promise<GetProposalResponse> {
    return apiClient.get<GetProposalResponse>(`/api/proposals/${proposalId}`);
  },

  /**
   * Create a new proposal
   */
  async createProposal(data: CreateProposalRequest): Promise<CreateProposalResponse> {
    return apiClient.post<CreateProposalResponse>('/api/proposals', data);
  },

  /**
   * Update an existing proposal
   */
  async updateProposal(
    proposalId: string,
    data: UpdateProposalRequest
  ): Promise<UpdateProposalResponse> {
    return apiClient.put<UpdateProposalResponse>(`/api/proposals/${proposalId}`, data);
  },

  /**
   * Delete a proposal
   */
  async deleteProposal(proposalId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<ApiResponse<{ message: string }>>(`/api/proposals/${proposalId}`);
  },

  /**
   * Send proposal (change status from draft to sent)
   */
  async sendProposal(proposalId: string): Promise<UpdateProposalResponse> {
    return apiClient.put<UpdateProposalResponse>(`/api/proposals/${proposalId}`, {
      status: 'sent',
    });
  },

  /**
   * Accept proposal (client action)
   */
  async acceptProposal(proposalId: string): Promise<UpdateProposalResponse> {
    return apiClient.put<UpdateProposalResponse>(`/api/proposals/${proposalId}`, {
      status: 'accepted',
    });
  },

  /**
   * Reject proposal (client action)
   */
  async rejectProposal(proposalId: string): Promise<UpdateProposalResponse> {
    return apiClient.put<UpdateProposalResponse>(`/api/proposals/${proposalId}`, {
      status: 'rejected',
    });
  },

  // =============================================================================
  // M05 ENHANCED FEATURES
  // =============================================================================

  /**
   * Get proposal analytics
   */
  async getAnalytics(proposalId: string): Promise<any> {
    const response = await apiClient.get<any>(`/api/proposals/${proposalId}/analytics`);
    return response.data?.analytics || response.analytics || response;
  },

  /**
   * Track proposal view
   */
  async trackView(
    proposalId: string,
    data: { timeSpent: number; section?: string; userAgent?: string }
  ): Promise<any> {
    return apiClient.post<any>(`/api/proposals/${proposalId}/track-view`, data);
  },

  /**
   * Add comment to proposal
   */
  async addComment(
    proposalId: string,
    data: { content: string; isInternal?: boolean }
  ): Promise<any> {
    return apiClient.post<any>(`/api/proposals/${proposalId}/comments`, data);
  },

  /**
   * Get proposal comments
   */
  async getComments(proposalId: string): Promise<any[]> {
    return apiClient.get<any[]>(`/api/proposals/${proposalId}/comments`);
  },

  /**
   * Duplicate proposal
   */
  async duplicate(proposalId: string): Promise<any> {
    return apiClient.post<any>(`/api/proposals/${proposalId}/duplicate`);
  },

  /**
   * Get proposal version history
   */
  async getVersions(proposalId: string): Promise<any[]> {
    return apiClient.get<any[]>(`/api/proposals/${proposalId}/versions`);
  },
};

// Re-export types for convenience
export type {
  Proposal,
  CreateProposalRequest,
  UpdateProposalRequest,
  ListProposalsQuery,
  ListProposalsResponse,
  GetProposalResponse,
  CreateProposalResponse,
  UpdateProposalResponse,
};
