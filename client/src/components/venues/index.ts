/**
 * Venue Management Module - Handoff Interface
 * 
 * This file exports all venue components and types for use by booking modules (F04 & M08)
 * 
 * ⚠️ HANDOFF NOTICE ⚠️
 * These exports are provided for the booking system modules to build upon
 * Do not modify these exports without coordinating with booking module development
 */

// Import types first
import type {
  Venue,
  VenueLocation,
  VenueCapacity,
  VenuePricing,
  VenueCategory,
  VenueStatus,
  CreateVenueRequest,
  UpdateVenueRequest,
  VenueSearchQuery,
  AvailabilitySlot,
  TimeSlot,
  AvailabilityQuery,
  VenueListResponse,
  VenueDetailsResponse,
  AvailabilityResponse
} from '../../types/venue';

// Core venue components for booking modules to use
export { VenueList } from './VenueList';
export { VenueCard } from './VenueCard';
export { VenueDetails } from './VenueDetails';
export { VenueForm } from './VenueForm';
export { AvailabilityCalendar } from './AvailabilityCalendar';
export { ContactOwnerDialog } from './ContactOwnerDialog';

// Re-export venue types for booking modules
export type {
  Venue,
  VenueLocation,
  VenueCapacity,
  VenuePricing,
  VenueCategory,
  VenueStatus,
  CreateVenueRequest,
  UpdateVenueRequest,
  VenueSearchQuery,
  AvailabilitySlot,
  TimeSlot,
  AvailabilityQuery,
  VenueListResponse,
  VenueDetailsResponse,
  AvailabilityResponse
};

// Venue data interface for booking modules
export interface VenueForBooking {
  venueId: string;
  name: string;
  description: string;
  category: VenueCategory;
  location: VenueLocation;
  capacity: VenueCapacity;
  pricing: VenuePricing;
  amenities: string[];
  images: string[];
  ownerId: string;
  status: VenueStatus;
  createdAt: string;
  updatedAt: string;
}

// Availability interface for booking modules
export interface VenueAvailabilityForBooking {
  venueId: string;
  date: string;
  timeSlots: TimeSlot[];
}

// Component props interfaces for booking modules to extend
export interface VenueSelectionProps {
  onVenueSelect?: (venue: Venue) => void;
  selectedVenueId?: string;
  showOwnerActions?: boolean;
}

export interface TimeSlotSelectionProps {
  venueId: string;
  onTimeSlotSelect?: (date: string, timeSlot: TimeSlot) => void;
  selectedDate?: string;
  selectedTimeSlot?: TimeSlot;
  maxCapacity?: number;
}