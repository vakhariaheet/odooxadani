/**
 * Contracts API Service
 * Provides type-safe API calls for contract management
 */

import { apiClient } from './apiClient';
import type {
  CreateContractRequest,
  UpdateContractRequest,
  SignContractRequest,
  ListContractsQuery,
  ApiResponse,
  ListContractsResponse,
  GetContractResponse,
  CreateContractResponse,
  UpdateContractResponse,
  SignContractResponse,
} from '../types/contract';

class ContractsApi {
  private readonly baseUrl = '/api/contracts';

  /**
   * List contracts based on user role
   */
  async listContracts(query?: ListContractsQuery): Promise<ApiResponse<ListContractsResponse>> {
    const params = new URLSearchParams();

    if (query?.status) params.append('status', query.status);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    return apiClient.get<ApiResponse<ListContractsResponse>>(endpoint);
  }

  /**
   * Get contract by ID
   */
  async getContract(contractId: string): Promise<ApiResponse<GetContractResponse>> {
    return apiClient.get<ApiResponse<GetContractResponse>>(`${this.baseUrl}/${contractId}`);
  }

  /**
   * Create a new contract
   */
  async createContract(data: CreateContractRequest): Promise<ApiResponse<CreateContractResponse>> {
    return apiClient.post<ApiResponse<CreateContractResponse>>(this.baseUrl, data);
  }

  /**
   * Update contract
   */
  async updateContract(
    contractId: string,
    data: UpdateContractRequest
  ): Promise<ApiResponse<UpdateContractResponse>> {
    return apiClient.put<ApiResponse<UpdateContractResponse>>(
      `${this.baseUrl}/${contractId}`,
      data
    );
  }

  /**
   * Send contract to client (change status from draft to sent)
   */
  async sendContract(contractId: string): Promise<ApiResponse<UpdateContractResponse>> {
    return apiClient.post<ApiResponse<UpdateContractResponse>>(
      `${this.baseUrl}/${contractId}/send`
    );
  }

  /**
   * Sign contract
   */
  async signContract(
    contractId: string,
    data: SignContractRequest
  ): Promise<ApiResponse<SignContractResponse>> {
    return apiClient.post<ApiResponse<SignContractResponse>>(
      `${this.baseUrl}/${contractId}/sign`,
      data
    );
  }

  /**
   * Delete contract (soft delete by changing status to cancelled)
   */
  async deleteContract(contractId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/${contractId}`);
  }
}

// Export singleton instance
export const contractsApi = new ContractsApi();

// Export class for testing
export { ContractsApi };
