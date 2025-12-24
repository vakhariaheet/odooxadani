/**
 * Event Types for Frontend
 * Matches the backend event management API
 */

// =============================================================================
// CORE EVENT TYPES
// =============================================================================

export interface EventLocation {
  address: string;
  city: string;
  coordinates?: [number, number]; // [lat, lng]
}

export type EventCategory =
  | 'music'
  | 'sports'
  | 'business'
  | 'technology'
  | 'arts'
  | 'food'
  | 'education'
  | 'health'
  | 'other';

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

export interface Event {
  eventId: string;
  title: string;
  description: string;
  category: EventCategory;
  startDate: string; // ISO string
  endDate: string; // ISO string
  location: EventLocation;
  maxAttendees: number;
  currentAttendees: number;
  price: number;
  currency: string;
  status: EventStatus;
  organizerId: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// REQUEST TYPES
// =============================================================================

export interface CreateEventRequest {
  title: string;
  description: string;
  category: EventCategory;
  startDate: string;
  endDate: string;
  location: EventLocation;
  maxAttendees: number;
  price: number;
  currency?: string;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  category?: EventCategory;
  startDate?: string;
  endDate?: string;
  location?: EventLocation;
  maxAttendees?: number;
  price?: number;
  currency?: string;
  status?: EventStatus;
}

// =============================================================================
// QUERY TYPES
// =============================================================================

export interface EventListQuery {
  limit?: number;
  offset?: number;
  category?: EventCategory;
  city?: string;
  startDate?: string; // ISO string for filtering events after this date
  endDate?: string; // ISO string for filtering events before this date
  status?: EventStatus;
  organizerId?: string; // For filtering own events
}

// =============================================================================
// RESPONSE TYPES
// =============================================================================

export interface EventListResponse {
  success: boolean;
  data: {
    events: Event[];
    totalCount: number;
    hasMore: boolean;
  };
}

export interface EventResponse {
  success: boolean;
  data: Event;
}

export interface CreateEventResponse {
  success: boolean;
  data: Event;
}

export interface UpdateEventResponse {
  success: boolean;
  data: Event;
}

export interface DeleteEventResponse {
  success: boolean;
  data: {
    message: string;
  };
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const EVENT_CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: 'music', label: 'Music' },
  { value: 'sports', label: 'Sports' },
  { value: 'business', label: 'Business' },
  { value: 'technology', label: 'Technology' },
  { value: 'arts', label: 'Arts & Culture' },
  { value: 'food', label: 'Food & Drink' },
  { value: 'education', label: 'Education' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'other', label: 'Other' },
];

export const EVENT_STATUSES: { value: EventStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'published', label: 'Published', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
  { value: 'completed', label: 'Completed', color: 'blue' },
];

export const DEFAULT_CURRENCY = 'USD';
export const MAX_EVENTS_PER_PAGE = 50;
export const DEFAULT_EVENTS_PER_PAGE = 20;

// =============================================================================
// FORM TYPES
// =============================================================================

export interface EventFormData {
  title: string;
  description: string;
  category: EventCategory;
  startDate: string;
  endDate: string;
  address: string;
  city: string;
  maxAttendees: number;
  price: number;
  currency: string;
}

// =============================================================================
// FILTER TYPES
// =============================================================================

export interface EventFilters {
  category?: EventCategory;
  city?: string;
  startDate?: string;
  endDate?: string;
  status?: EventStatus;
  priceRange?: {
    min?: number;
    max?: number;
  };
}

// =============================================================================
// M05: ENHANCED DISCOVERY TYPES
// =============================================================================

export interface EventSearchQuery {
  query?: string; // Full-text search query
  category?: EventCategory;
  city?: string;
  location?: {
    lat: number;
    lng: number;
    radius?: number; // in kilometers
  };
  priceRange?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
  tags?: string[];
  sortBy?: 'relevance' | 'date' | 'popularity' | 'price';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface EnhancedEventFilters {
  categories?: EventCategory[];
  cities?: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
  location?: {
    lat: number;
    lng: number;
    radius: number;
  };
}

export interface RecommendationRequest {
  userId: string;
  limit?: number;
  categories?: EventCategory[];
  location?: {
    lat: number;
    lng: number;
    radius?: number;
  };
}

export interface PopularEventsResponse {
  success: boolean;
  data: {
    events: Event[];
    timeframe: 'week' | 'month';
    totalCount: number;
  };
}

export interface CategoryEventsResponse {
  success: boolean;
  data: {
    events: Event[];
    category: EventCategory;
    totalCount: number;
  };
}

export interface RecommendedEventsResponse {
  success: boolean;
  data: {
    events: Event[];
    userId: string;
    totalCount: number;
  };
}

export interface EventSearchResponse {
  success: boolean;
  data: {
    events: Event[];
    totalCount: number;
    hasMore: boolean;
  };
}

// =============================================================================
// API ERROR TYPE
// =============================================================================

export interface EventApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
