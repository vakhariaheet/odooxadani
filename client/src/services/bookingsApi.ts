/**
 * Bookings API Service
 *
 * Handles all booking-related API calls
 */

import { apiClient } from './apiClient';

// Types
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
  bookingType: 'venue' | 'event';
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  attendeeCount: number;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentId?: string;
  specialRequests?: string;
  contactInfo: ContactInfo;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
}

export interface CreateBookingRequest {
  venueId?: string;
  eventId?: string;
  bookingType: 'venue' | 'event';
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  attendeeCount: number;
  specialRequests?: string;
  contactInfo: ContactInfo;
}

export interface UpdateBookingRequest {
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  attendeeCount?: number;
  specialRequests?: string;
  contactInfo?: ContactInfo;
}

export interface ListBookingsQuery {
  limit?: number;
  offset?: number;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  bookingType?: 'venue' | 'event';
  venueId?: string;
  eventId?: string;
  startDate?: string;
  endDate?: string;
}

export interface BookingListResponse {
  bookings: Booking[];
  totalCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export class BookingsApi {
  /**
   * Create a new booking
   */
  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    const response = await apiClient.post<ApiResponse<Booking>>('/api/bookings', data);
    return response.data;
  }

  /**
   * Get user's bookings with optional filtering
   */
  async listBookings(query: ListBookingsQuery = {}): Promise<BookingListResponse> {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/api/bookings?${queryString}` : '/api/bookings';

    const response = await apiClient.get<ApiResponse<BookingListResponse>>(endpoint);
    return response.data;
  }

  /**
   * Get a specific booking by ID
   */
  async getBooking(bookingId: string): Promise<Booking> {
    const response = await apiClient.get<ApiResponse<Booking>>(`/api/bookings/${bookingId}`);
    return response.data;
  }

  /**
   * Update a booking
   */
  async updateBooking(bookingId: string, data: UpdateBookingRequest): Promise<Booking> {
    const response = await apiClient.put<ApiResponse<Booking>>(`/api/bookings/${bookingId}`, data);
    return response.data;
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string): Promise<Booking> {
    const response = await apiClient.delete<ApiResponse<Booking>>(`/api/bookings/${bookingId}`);
    return response.data;
  }

  /**
   * Confirm a booking (venue owner action)
   */
  async confirmBooking(bookingId: string): Promise<Booking> {
    const response = await apiClient.post<ApiResponse<Booking>>(
      `/api/bookings/${bookingId}/confirm`
    );
    return response.data;
  }
}

// Export singleton instance
export const bookingsApi = new BookingsApi();
