// =============================================================================
// VENUE TYPES - Venue Management Module
// =============================================================================

// -----------------------------------------------------------------------------
// Core Venue Types
// -----------------------------------------------------------------------------

export interface Venue {
  venueId: string;
  name: string;
  description: string;
  category: VenueCategory;
  location: VenueLocation;
  capacity: VenueCapacity;
  amenities: string[];
  pricing: VenuePricing;
  images: string[];
  ownerId: string;
  status: VenueStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VenueLocation {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates: [number, number]; // [latitude, longitude]
}

export interface VenueCapacity {
  min: number;
  max: number;
}

export interface VenuePricing {
  basePrice: number;
  currency: string;
  pricingModel: 'hourly' | 'daily' | 'event';
}

export type VenueCategory = 
  | 'conference'
  | 'wedding'
  | 'concert'
  | 'corporate'
  | 'exhibition'
  | 'workshop'
  | 'party'
  | 'sports'
  | 'other';

export type VenueStatus = 'active' | 'inactive' | 'maintenance';

// -----------------------------------------------------------------------------
// Availability Types
// -----------------------------------------------------------------------------

export interface AvailabilitySlot {
  date: string; // YYYY-MM-DD
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  available: boolean;
  bookingId?: string;
}

// -----------------------------------------------------------------------------
// Request Types
// -----------------------------------------------------------------------------

/** POST /api/venues */
export interface CreateVenueRequest {
  name: string;
  description: string;
  category: VenueCategory;
  location: VenueLocation;
  capacity: VenueCapacity;
  amenities: string[];
  pricing: VenuePricing;
  images?: string[];
}

/** PUT /api/venues/:id */
export interface UpdateVenueRequest {
  name?: string;
  description?: string;
  category?: VenueCategory;
  location?: VenueLocation;
  capacity?: VenueCapacity;
  amenities?: string[];
  pricing?: VenuePricing;
  images?: string[];
  status?: VenueStatus;
}

/** POST /api/venues/:id/contact */
export interface ContactOwnerRequest {
  senderName: string;
  senderEmail: string;
  inquiryType?: string;
  subject: string;
  message: string;
}

// -----------------------------------------------------------------------------
// Query & Response Types
// -----------------------------------------------------------------------------

/** GET /api/venues query params */
export interface VenueSearchQuery {
  limit?: number;
  offset?: number;
  city?: string;
  state?: string;
  category?: VenueCategory;
  minCapacity?: number;
  maxCapacity?: number;
  amenities?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'capacity' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/** GET /api/venues response */
export interface VenueListResponse {
  venues: Venue[];
  totalCount: number;
  filters: {
    categories: VenueCategory[];
    cities: string[];
    amenities: string[];
    priceRange: { min: number; max: number };
    capacityRange: { min: number; max: number };
  };
}

/** GET /api/venues/:id/availability query params */
export interface AvailabilityQuery {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

// -----------------------------------------------------------------------------
// Database Types (DynamoDB Single Table)
// -----------------------------------------------------------------------------

export interface VenueRecord {
  PK: string; // VENUE#[venueId]
  SK: string; // METADATA
  GSI1PK: string; // LOCATION#[city]
  GSI1SK: string; // [capacity]#[venueId]
  GSI2PK?: string; // USER#[userId] (for owner queries)
  GSI2SK?: string; // VENUE#[venueId]
  
  // Venue data
  venueId: string;
  name: string;
  description: string;
  category: VenueCategory;
  location: VenueLocation;
  capacity: VenueCapacity;
  amenities: string[];
  pricing: VenuePricing;
  images: string[];
  ownerId: string;
  status: VenueStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityRecord {
  PK: string; // VENUE#[venueId]
  SK: string; // AVAILABILITY#[date]
  GSI1PK: string; // AVAILABLE#[date]
  GSI1SK: string; // VENUE#[venueId]
  
  // Availability data
  venueId: string;
  date: string;
  timeSlots: TimeSlot[];
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Common Amenities List
// -----------------------------------------------------------------------------

export const COMMON_AMENITIES = [
  'parking',
  'wifi',
  'catering',
  'av_equipment',
  'projector',
  'microphone',
  'sound_system',
  'lighting',
  'air_conditioning',
  'heating',
  'restrooms',
  'wheelchair_accessible',
  'security',
  'kitchen',
  'bar',
  'stage',
  'dance_floor',
  'outdoor_space',
  'valet_parking',
  'coat_check'
] as const;

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

/**
 * Generate venue ID
 */
export const generateVenueId = (): string => {
  return `venue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create venue database keys
 */
export const createVenueKeys = (venueId: string) => ({
  PK: `VENUE#${venueId}`,
  SK: 'METADATA'
});

/**
 * Create availability database keys
 */
export const createAvailabilityKeys = (venueId: string, date: string) => ({
  PK: `VENUE#${venueId}`,
  SK: `AVAILABILITY#${date}`
});

/**
 * Create owner lookup keys
 */
export const createOwnerKeys = (venueId: string, userId: string) => ({
  PK: `VENUE#${venueId}`,
  SK: `OWNER#${userId}`,
  GSI1PK: `USER#${userId}`,
  GSI1SK: `VENUE#${venueId}`
});

/**
 * Validate venue data
 */
export const validateVenueData = (data: CreateVenueRequest | UpdateVenueRequest): string[] => {
  const errors: string[] = [];

  if ('name' in data && data.name !== undefined) {
    if (!data.name || data.name.trim().length < 3) {
      errors.push('Name must be at least 3 characters long');
    }
  }

  if ('capacity' in data && data.capacity) {
    if (data.capacity.min < 1) {
      errors.push('Minimum capacity must be at least 1');
    }
    if (data.capacity.max < data.capacity.min) {
      errors.push('Maximum capacity must be greater than minimum capacity');
    }
  }

  if ('pricing' in data && data.pricing) {
    if (data.pricing.basePrice < 0) {
      errors.push('Base price must be non-negative');
    }
  }

  return errors;
};