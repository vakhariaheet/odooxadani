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
