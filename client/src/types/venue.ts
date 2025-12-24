/**
 * Venue Types for Frontend
 * Matches the backend venue module responses
 */

// Core Venue Types
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

// Availability Types
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

// Request Types
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

// Query Types
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

export interface AvailabilityQuery {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

// Response Types
export interface VenueListResponse {
  success: boolean;
  data: {
    venues: Venue[];
    totalCount: number;
    filters: {
      categories: VenueCategory[];
      cities: string[];
      amenities: string[];
      priceRange: { min: number; max: number };
      capacityRange: { min: number; max: number };
    };
  };
}

export interface VenueDetailsResponse {
  success: boolean;
  data: Venue;
}

export interface CreateVenueResponse {
  success: boolean;
  data: Venue;
}

export interface UpdateVenueResponse {
  success: boolean;
  data: Venue;
}

export interface DeleteVenueResponse {
  success: boolean;
  message: string;
}

export interface AvailabilityResponse {
  success: boolean;
  data: AvailabilitySlot[];
}

// Common Amenities
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

// Venue Categories with Display Names
export const VENUE_CATEGORIES: Record<VenueCategory, string> = {
  conference: 'Conference',
  wedding: 'Wedding',
  concert: 'Concert',
  corporate: 'Corporate',
  exhibition: 'Exhibition',
  workshop: 'Workshop',
  party: 'Party',
  sports: 'Sports',
  other: 'Other'
};

// Amenity Display Names
export const AMENITY_LABELS: Record<string, string> = {
  parking: 'Parking',
  wifi: 'Wi-Fi',
  catering: 'Catering',
  av_equipment: 'A/V Equipment',
  projector: 'Projector',
  microphone: 'Microphone',
  sound_system: 'Sound System',
  lighting: 'Professional Lighting',
  air_conditioning: 'Air Conditioning',
  heating: 'Heating',
  restrooms: 'Restrooms',
  wheelchair_accessible: 'Wheelchair Accessible',
  security: 'Security',
  kitchen: 'Kitchen',
  bar: 'Bar',
  stage: 'Stage',
  dance_floor: 'Dance Floor',
  outdoor_space: 'Outdoor Space',
  valet_parking: 'Valet Parking',
  coat_check: 'Coat Check'
};

// Helper Functions
export const formatPrice = (pricing: VenuePricing): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: pricing.currency || 'USD',
  });
  
  const price = formatter.format(pricing.basePrice);
  const model = pricing.pricingModel === 'hourly' ? '/hour' : 
                pricing.pricingModel === 'daily' ? '/day' : '/event';
  
  return `${price}${model}`;
};

export const formatCapacity = (capacity: VenueCapacity): string => {
  if (capacity.min === capacity.max) {
    return `${capacity.max} guests`;
  }
  return `${capacity.min}-${capacity.max} guests`;
};

export const formatAddress = (location: VenueLocation): string => {
  return `${location.address}, ${location.city}, ${location.state} ${location.zipCode}`;
};