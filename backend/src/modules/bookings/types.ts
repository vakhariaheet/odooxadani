// =============================================================================
// BOOKING TYPES - Booking System Module
// =============================================================================

// -----------------------------------------------------------------------------
// Core Booking Types
// -----------------------------------------------------------------------------

export type BookingType = 'venue' | 'event';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

export interface Booking {
  bookingId: string;
  userId: string;
  venueId?: string;
  eventId?: string;
  bookingType: BookingType;
  startDate: string; // ISO string
  endDate: string; // ISO string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  attendeeCount: number;
  totalAmount: number;
  currency: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  specialRequests?: string;
  contactInfo: ContactInfo;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
}

// -----------------------------------------------------------------------------
// Request Types
// -----------------------------------------------------------------------------

/** POST /api/bookings */
export interface CreateBookingRequest {
  venueId?: string;
  eventId?: string;
  bookingType: BookingType;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  attendeeCount: number;
  specialRequests?: string;
  contactInfo: ContactInfo;
}

/** PUT /api/bookings/:id */
export interface UpdateBookingRequest {
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  attendeeCount?: number;
  specialRequests?: string;
  contactInfo?: ContactInfo;
}

/** GET /api/bookings query params */
export interface ListBookingsQuery {
  limit?: number;
  offset?: number;
  status?: BookingStatus;
  bookingType?: BookingType;
  venueId?: string;
  eventId?: string;
  startDate?: string; // Filter by date range
  endDate?: string;
}

// -----------------------------------------------------------------------------
// Response Types
// -----------------------------------------------------------------------------

/** GET /api/bookings response */
export interface BookingListResponse {
  bookings: Booking[];
  totalCount: number;
}

/** Booking conflict check */
export interface BookingConflictCheck {
  hasConflict: boolean;
  conflictingBookings?: Booking[];
}

/** Payment processing result */
export interface PaymentResult {
  success: boolean;
  paymentId: string;
  amount: number;
  currency: string;
}

// -----------------------------------------------------------------------------
// Database Schema Types (DynamoDB Single Table)
// -----------------------------------------------------------------------------

export interface BookingDynamoItem extends Record<string, unknown> {
  PK: string; // BOOKING#[bookingId]
  SK: string; // METADATA | VENUE#[venueId] | EVENT#[eventId]
  GSI1PK: string; // USER#[userId] | VENUE#[venueId] | EVENT#[eventId]
  GSI1SK: string; // [createdAt] | [startDate]

  // Booking data
  bookingId: string;
  userId: string;
  venueId?: string;
  eventId?: string;
  bookingType: BookingType;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  attendeeCount: number;
  totalAmount: number;
  currency: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  specialRequests?: string;
  contactInfo: ContactInfo;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
}
