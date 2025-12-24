// =============================================================================
// EVENT TYPES - Event Management Module
// =============================================================================

// -----------------------------------------------------------------------------
// Core Event Types
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Request Types
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Query & Response Types
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// M05: Enhanced Discovery Types
// -----------------------------------------------------------------------------

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

export interface EventFilters {
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
  events: Event[];
  timeframe: 'week' | 'month';
  totalCount: number;
}

export interface CategoryEventsResponse {
  events: Event[];
  category: EventCategory;
  totalCount: number;
}

// Enhanced Event interface for M05
export interface EnhancedEvent extends Event {
  tags?: string[];
  viewCount?: number;
  bookingCount?: number;
  popularityScore?: number;
  searchableText?: string;
  distance?: number; // For location-based searches
}

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

export interface EventListResponse {
  events: Event[];
  totalCount: number;
  hasMore: boolean;
}

// -----------------------------------------------------------------------------
// Database Schema Types
// -----------------------------------------------------------------------------

export interface EventDynamoDBItem extends Event {
  PK: string; // EVENT#[eventId]
  SK: string; // METADATA
  GSI1PK: string; // CATEGORY#[category]
  GSI1SK: string; // [startDate]
  GSI2PK?: string; // USER#[organizerId] (for user's events)
  GSI2SK?: string; // EVENT#[eventId]
}

export interface EventOrganizerDynamoDBItem {
  PK: string; // EVENT#[eventId]
  SK: string; // ORGANIZER#[userId]
  GSI1PK: string; // USER#[userId]
  GSI1SK: string; // EVENT#[eventId]
  eventId: string;
  organizerId: string;
  createdAt: string;
}

// -----------------------------------------------------------------------------
// Helper Constants
// -----------------------------------------------------------------------------

export const EVENT_CATEGORIES: EventCategory[] = [
  'music',
  'sports',
  'business',
  'technology',
  'arts',
  'food',
  'education',
  'health',
  'other',
];

export const EVENT_STATUSES: EventStatus[] = ['draft', 'published', 'cancelled', 'completed'];

export const DEFAULT_CURRENCY = 'USD';
export const MAX_EVENTS_PER_PAGE = 50;
export const DEFAULT_EVENTS_PER_PAGE = 20;
