import { apiClient } from './apiClient';
import type {
  ClientDashboardResponse,
  ClientProposalsResponse,
  ClientContractsResponse,
  ClientInvoicesResponse,
  ClientProfileResponse,
  UpdateClientProfileRequest,
  ClientListQuery,
} from '../types/client-portal';

/**
 * Client Portal API Service
 * Handles all client portal related API calls
 */
export class ClientPortalApi {
  /**
   * Get client dashboard data
   */
  static async getDashboard(): Promise<ClientDashboardResponse> {
    return apiClient.get<ClientDashboardResponse>('/client/dashboard');
  }

  /**
   * Get client proposals with optional filtering and pagination
   */
  static async getProposals(query: ClientListQuery = {}): Promise<ClientProposalsResponse> {
    const params = new URLSearchParams();
    
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());
    if (query.status) params.append('status', query.status);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const queryString = params.toString();
    const endpoint = queryString ? `/client/proposals?${queryString}` : '/client/proposals';
    
    return apiClient.get<ClientProposalsResponse>(endpoint);
  }

  /**
   * Get client contracts with optional filtering and pagination
   */
  static async getContracts(query: ClientListQuery = {}): Promise<ClientContractsResponse> {
    const params = new URLSearchParams();
    
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());
    if (query.status) params.append('status', query.status);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const queryString = params.toString();
    const endpoint = queryString ? `/client/contracts?${queryString}` : '/client/contracts';
    
    return apiClient.get<ClientContractsResponse>(endpoint);
  }

  /**
   * Get client invoices with optional filtering and pagination
   */
  static async getInvoices(query: ClientListQuery = {}): Promise<ClientInvoicesResponse> {
    const params = new URLSearchParams();
    
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());
    if (query.status) params.append('status', query.status);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const queryString = params.toString();
    const endpoint = queryString ? `/client/invoices?${queryString}` : '/client/invoices';
    
    return apiClient.get<ClientInvoicesResponse>(endpoint);
  }

  /**
   * Get client profile
   */
  static async getProfile(): Promise<ClientProfileResponse> {
    return apiClient.get<ClientProfileResponse>('/client/profile');
  }

  /**
   * Update client profile
   */
  static async updateProfile(data: UpdateClientProfileRequest): Promise<ClientProfileResponse> {
    return apiClient.put<ClientProfileResponse>('/client/profile', data);
  }
}