/**
 * Venues API Service
 * Handles all venue-related API calls
 */

import { apiClient } from './apiClient';
import type {
  CreateVenueRequest,
  UpdateVenueRequest,
  VenueSearchQuery,
  AvailabilityQuery,
  VenueListResponse,
  VenueDetailsResponse,
  CreateVenueResponse,
  UpdateVenueResponse,
  DeleteVenueResponse,
  AvailabilityResponse,
} from '../types/venue';

export const venuesApi = {
  /**
   * List venues with search and filtering
   */
  async listVenues(query?: VenueSearchQuery): Promise<VenueListResponse> {
    const params = new URLSearchParams();
    
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/api/venues?${queryString}` : '/api/venues';
    
    return apiClient.get<VenueListResponse>(endpoint);
  },

  /**
   * Get venue details by ID
   */
  async getVenue(venueId: string): Promise<VenueDetailsResponse> {
    return apiClient.get<VenueDetailsResponse>(`/api/venues/${venueId}`);
  },

  /**
   * Create a new venue
   */
  async createVenue(data: CreateVenueRequest): Promise<CreateVenueResponse> {
    return apiClient.post<CreateVenueResponse>('/api/venues', data);
  },

  /**
   * Update an existing venue
   */
  async updateVenue(venueId: string, data: UpdateVenueRequest): Promise<UpdateVenueResponse> {
    return apiClient.put<UpdateVenueResponse>(`/api/venues/${venueId}`, data);
  },

  /**
   * Delete a venue
   */
  async deleteVenue(venueId: string): Promise<DeleteVenueResponse> {
    return apiClient.delete<DeleteVenueResponse>(`/api/venues/${venueId}`);
  },

  /**
   * Get venue availability for date range
   */
  async getAvailability(venueId: string, query: AvailabilityQuery): Promise<AvailabilityResponse> {
    const params = new URLSearchParams({
      startDate: query.startDate,
      endDate: query.endDate,
    });

    return apiClient.get<AvailabilityResponse>(`/api/venues/${venueId}/availability?${params}`);
  },

  /**
   * Get venues owned by current user
   */
  async getMyVenues(): Promise<VenueListResponse> {
    // This will be implemented when we add the backend endpoint
    // For now, we can filter venues by current user on the frontend
    return this.listVenues();
  },
};