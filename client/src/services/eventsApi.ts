/**
 * Events API Service
 *
 * API service functions for event management operations
 */

import { apiClient } from './apiClient';
import type {
  Event,
  EventListResponse,
  CreateEventRequest,
  UpdateEventRequest,
  ListEventsQuery,
  EventRegistrationRequest,
} from '../types/event';

// =============================================================================
// EVENT CRUD OPERATIONS
// =============================================================================

/**
 * List events with filtering and pagination
 */
export const listEvents = async (query: ListEventsQuery = {}): Promise<EventListResponse> => {
  const params = new URLSearchParams();

  if (query.limit) params.append('limit', query.limit.toString());
  if (query.offset) params.append('offset', query.offset.toString());
  if (query.status) params.append('status', query.status);
  if (query.category) params.append('category', query.category);
  if (query.location) params.append('location', query.location);
  if (query.organizerId) params.append('organizerId', query.organizerId);
  if (query.isPublic !== undefined) params.append('isPublic', query.isPublic.toString());
  if (query.search) params.append('search', query.search);
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);

  const queryString = params.toString();
  const url = queryString ? `/api/events?${queryString}` : '/api/events';

  return apiClient.get<EventListResponse>(url);
};

/**
 * Get single event by ID
 */
export const getEvent = async (id: string): Promise<Event> => {
  return apiClient.get<Event>(`/api/events/${id}`);
};

/**
 * Create new event
 */
export const createEvent = async (data: CreateEventRequest): Promise<Event> => {
  return apiClient.post<Event>('/api/events', data);
};

/**
 * Update existing event
 */
export const updateEvent = async (id: string, data: UpdateEventRequest): Promise<Event> => {
  return apiClient.put<Event>(`/api/events/${id}`, data);
};

/**
 * Delete event (soft delete)
 */
export const deleteEvent = async (id: string): Promise<{ message: string }> => {
  return apiClient.delete<{ message: string }>(`/api/events/${id}`);
};

/**
 * Register for event
 */
export const registerForEvent = async (
  id: string,
  data: EventRegistrationRequest
): Promise<{ message: string }> => {
  return apiClient.post<{ message: string }>(`/api/events/${id}/register`, data);
};

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Get events by organizer
 */
export const getEventsByOrganizer = async (organizerId: string): Promise<EventListResponse> => {
  return listEvents({ organizerId });
};

/**
 * Get public events only
 */
export const getPublicEvents = async (
  query: Omit<ListEventsQuery, 'isPublic'> = {}
): Promise<EventListResponse> => {
  return listEvents({ ...query, isPublic: true });
};

/**
 * Search events by name or description
 */
export const searchEvents = async (
  searchTerm: string,
  query: Omit<ListEventsQuery, 'search'> = {}
): Promise<EventListResponse> => {
  return listEvents({ ...query, search: searchTerm });
};

/**
 * Get events by category
 */
export const getEventsByCategory = async (
  category: string,
  query: Omit<ListEventsQuery, 'category'> = {}
): Promise<EventListResponse> => {
  return listEvents({ ...query, category });
};

/**
 * Get events by status
 */
export const getEventsByStatus = async (
  status: string,
  query: Omit<ListEventsQuery, 'status'> = {}
): Promise<EventListResponse> => {
  return listEvents({ ...query, status: status as any });
};

/**
 * Get trending events (sorted by trend score)
 */
export const getTrendingEvents = async (
  query: Omit<ListEventsQuery, 'sortBy' | 'sortOrder'> = {}
): Promise<EventListResponse> => {
  return listEvents({
    ...query,
    sortBy: 'trendScore',
    sortOrder: 'desc',
    isPublic: true,
  });
};

/**
 * Get upcoming events (sorted by start date)
 */
export const getUpcomingEvents = async (
  query: Omit<ListEventsQuery, 'sortBy' | 'sortOrder'> = {}
): Promise<EventListResponse> => {
  return listEvents({
    ...query,
    sortBy: 'startDate',
    sortOrder: 'asc',
    isPublic: true,
  });
};

/**
 * Enhance event with AI
 */
export const enhanceEvent = async (data: {
  name: string;
  description: string;
  categories?: string[];
  location?: string;
  enhanceType?: 'title' | 'description' | 'categories' | 'tags' | 'rules' | 'all';
}): Promise<{
  enhancedTitle?: string;
  enhancedDescription?: string;
  suggestedCategories?: string[];
  trendScore?: number;
  suggestedTags?: string[];
  generatedRules?: string;
}> => {
  return apiClient.post<{
    enhancedTitle?: string;
    enhancedDescription?: string;
    suggestedCategories?: string[];
    trendScore?: number;
    suggestedTags?: string[];
    generatedRules?: string;
  }>('/api/events/enhance', data);
};
