/**
 * Events API Service
 * Handles all event-related API calls
 */

import { apiClient } from './apiClient';
import type {
  CreateEventRequest,
  UpdateEventRequest,
  EventListQuery,
  EventListResponse,
  EventResponse,
  CreateEventResponse,
  UpdateEventResponse,
  DeleteEventResponse,
  EventSearchQuery,
  EventSearchResponse,
  PopularEventsResponse,
  CategoryEventsResponse,
  RecommendedEventsResponse,
} from '../types/event';

// =============================================================================
// EVENTS API
// =============================================================================

export const eventsApi = {
  /**
   * Create a new event
   */
  async createEvent(data: CreateEventRequest): Promise<CreateEventResponse> {
    return apiClient.post<CreateEventResponse>('/api/events', data);
  },

  /**
   * Get list of events with filtering and pagination
   */
  async listEvents(query?: EventListQuery): Promise<EventListResponse> {
    const params = new URLSearchParams();

    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());
    if (query?.category) params.append('category', query.category);
    if (query?.city) params.append('city', query.city);
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.status) params.append('status', query.status);
    if (query?.organizerId) params.append('organizerId', query.organizerId);

    const queryString = params.toString();
    const endpoint = queryString ? `/api/events?${queryString}` : '/api/events';

    // Temporarily use auth for testing until backend is deployed
    return apiClient.get<EventListResponse>(endpoint, true);
  },

  /**
   * Get event details by ID
   */
  async getEvent(eventId: string): Promise<EventResponse> {
    // Temporarily use auth for testing until backend is deployed
    return apiClient.get<EventResponse>(`/api/events/${eventId}`, true);
  },

  /**
   * Update an existing event (own events only)
   */
  async updateEvent(eventId: string, data: UpdateEventRequest): Promise<UpdateEventResponse> {
    return apiClient.put<UpdateEventResponse>(`/api/events/${eventId}`, data);
  },

  /**
   * Delete an event (own events only)
   */
  async deleteEvent(eventId: string): Promise<DeleteEventResponse> {
    return apiClient.delete<DeleteEventResponse>(`/api/events/${eventId}`);
  },

  /**
   * Get user's own events
   */
  async getMyEvents(query?: Omit<EventListQuery, 'organizerId'>): Promise<EventListResponse> {
    // The backend will automatically filter by current user when organizerId matches userId
    // We'll handle this in the hook by getting the current user ID
    return this.listEvents(query);
  },

  /**
   * Publish an event (change status from draft to published)
   */
  async publishEvent(eventId: string): Promise<UpdateEventResponse> {
    return this.updateEvent(eventId, { status: 'published' });
  },

  /**
   * Cancel an event
   */
  async cancelEvent(eventId: string): Promise<UpdateEventResponse> {
    return this.updateEvent(eventId, { status: 'cancelled' });
  },

  /**
   * Mark event as completed
   */
  async completeEvent(eventId: string): Promise<UpdateEventResponse> {
    return this.updateEvent(eventId, { status: 'completed' });
  },

  // =============================================================================
  // M05: ENHANCED DISCOVERY API METHODS
  // =============================================================================

  /**
   * Advanced event search with multiple filters
   */
  async searchEvents(query: EventSearchQuery): Promise<EventSearchResponse> {
    const params = new URLSearchParams();

    if (query.query) params.append('q', query.query);
    if (query.category) params.append('category', query.category);
    if (query.city) params.append('city', query.city);

    // Location filter
    if (query.location) {
      params.append('lat', query.location.lat.toString());
      params.append('lng', query.location.lng.toString());
      if (query.location.radius) params.append('radius', query.location.radius.toString());
    }

    // Price range filter
    if (query.priceRange) {
      if (query.priceRange.min !== undefined)
        params.append('minPrice', query.priceRange.min.toString());
      if (query.priceRange.max !== undefined)
        params.append('maxPrice', query.priceRange.max.toString());
    }

    // Date range filter
    if (query.dateRange) {
      if (query.dateRange.startDate) params.append('startDate', query.dateRange.startDate);
      if (query.dateRange.endDate) params.append('endDate', query.dateRange.endDate);
    }

    // Tags filter
    if (query.tags && query.tags.length > 0) {
      params.append('tags', query.tags.join(','));
    }

    // Sorting
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    // Pagination
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/api/events/search?${queryString}` : '/api/events/search';

    return apiClient.get<EventSearchResponse>(endpoint);
  },

  /**
   * Get events by category
   */
  async getEventsByCategory(category: string, limit?: number): Promise<CategoryEventsResponse> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `/api/events/category/${category}?${queryString}`
      : `/api/events/category/${category}`;

    return apiClient.get<CategoryEventsResponse>(endpoint);
  },

  /**
   * Get personalized event recommendations (requires authentication)
   */
  async getRecommendedEvents(limit?: number): Promise<RecommendedEventsResponse> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `/api/events/recommended?${queryString}`
      : '/api/events/recommended';

    return apiClient.get<RecommendedEventsResponse>(endpoint, true);
  },

  /**
   * Get popular/trending events
   */
  async getPopularEvents(
    timeframe?: 'week' | 'month',
    limit?: number
  ): Promise<PopularEventsResponse> {
    const params = new URLSearchParams();
    if (timeframe) params.append('timeframe', timeframe);
    if (limit) params.append('limit', limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/api/events/popular?${queryString}` : '/api/events/popular';

    return apiClient.get<PopularEventsResponse>(endpoint);
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Format event date for display
 */
export function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format event date range
 */
export function formatEventDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const isSameDay = start.toDateString() === end.toDateString();

  if (isSameDay) {
    return `${start.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })} • ${start.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })} - ${end.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }

  return `${formatEventDate(startDate)} - ${formatEventDate(endDate)}`;
}

/**
 * Format event price
 */
export function formatEventPrice(price: number, currency: string = 'USD'): string {
  if (price === 0) {
    return 'Free';
  }

  // Validate and sanitize currency code
  let validCurrency = 'USD'; // Default fallback

  if (currency && typeof currency === 'string') {
    // Clean the currency code (remove whitespace, convert to uppercase)
    const cleanCurrency = currency.trim().toUpperCase();

    // List of common valid currency codes
    const validCurrencies = [
      'USD',
      'EUR',
      'GBP',
      'JPY',
      'AUD',
      'CAD',
      'CHF',
      'CNY',
      'SEK',
      'NZD',
      'MXN',
      'SGD',
      'HKD',
      'NOK',
      'TRY',
      'RUB',
      'INR',
      'BRL',
      'ZAR',
      'KRW',
    ];

    if (validCurrencies.includes(cleanCurrency)) {
      validCurrency = cleanCurrency;
    }
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: validCurrency,
    }).format(price);
  } catch (error) {
    // Fallback if currency formatting fails
    console.warn(`Invalid currency code: ${currency}, falling back to USD`);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  }
}

/**
 * Check if event is in the past
 */
export function isEventPast(endDate: string): boolean {
  return new Date(endDate) < new Date();
}

/**
 * Check if event is happening now
 */
export function isEventActive(startDate: string, endDate: string): boolean {
  const now = new Date();
  return new Date(startDate) <= now && now <= new Date(endDate);
}

/**
 * Check if event is upcoming
 */
export function isEventUpcoming(startDate: string): boolean {
  return new Date(startDate) > new Date();
}

/**
 * Get event status color
 */
export function getEventStatusColor(status: string): string {
  switch (status) {
    case 'draft':
      return 'gray';
    case 'published':
      return 'green';
    case 'cancelled':
      return 'red';
    case 'completed':
      return 'blue';
    default:
      return 'gray';
  }
}

/**
 * Validate event dates
 */
export function validateEventDates(startDate: string, endDate: string): string | null {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (start >= end) {
    return 'End date must be after start date';
  }

  if (start < now) {
    return 'Start date cannot be in the past';
  }

  return null;
}
