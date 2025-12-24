/**
 * Booking Hooks - React Query Integration
 *
 * Custom hooks for booking operations with caching and state management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  bookingsApi,
  type CreateBookingRequest,
  type UpdateBookingRequest,
  type ListBookingsQuery,
} from '../services/bookingsApi';

// Query keys for consistent caching
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (filters: ListBookingsQuery) => [...bookingKeys.lists(), filters] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
};

/**
 * Hook to fetch user's bookings with filtering
 */
export const useBookings = (query: ListBookingsQuery = {}) => {
  return useQuery({
    queryKey: bookingKeys.list(query),
    queryFn: () => bookingsApi.listBookings(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch a specific booking
 */
export const useBooking = (bookingId: string) => {
  return useQuery({
    queryKey: bookingKeys.detail(bookingId),
    queryFn: () => bookingsApi.getBooking(bookingId),
    enabled: !!bookingId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to create a new booking
 */
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingsApi.createBooking(data),
    onSuccess: (newBooking) => {
      // Invalidate and refetch bookings list
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });

      // Add the new booking to cache
      queryClient.setQueryData(bookingKeys.detail(newBooking.bookingId), newBooking);

      toast.success('Booking created successfully!', {
        description: `Booking ID: ${newBooking.bookingId}`,
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to create booking', {
        description: error.message,
      });
    },
  });
};

/**
 * Hook to update a booking
 */
export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, data }: { bookingId: string; data: UpdateBookingRequest }) =>
      bookingsApi.updateBooking(bookingId, data),
    onSuccess: (updatedBooking) => {
      // Update the specific booking in cache
      queryClient.setQueryData(bookingKeys.detail(updatedBooking.bookingId), updatedBooking);

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });

      toast.success('Booking updated successfully!');
    },
    onError: (error: Error) => {
      toast.error('Failed to update booking', {
        description: error.message,
      });
    },
  });
};

/**
 * Hook to cancel a booking
 */
export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => bookingsApi.cancelBooking(bookingId),
    onSuccess: (cancelledBooking) => {
      // Update the specific booking in cache
      queryClient.setQueryData(bookingKeys.detail(cancelledBooking.bookingId), cancelledBooking);

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });

      toast.success('Booking cancelled successfully', {
        description: 'Refund will be processed within 3-5 business days',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to cancel booking', {
        description: error.message,
      });
    },
  });
};

/**
 * Hook to confirm a booking (venue owner action)
 */
export const useConfirmBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => bookingsApi.confirmBooking(bookingId),
    onSuccess: (confirmedBooking) => {
      // Update the specific booking in cache
      queryClient.setQueryData(bookingKeys.detail(confirmedBooking.bookingId), confirmedBooking);

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });

      toast.success('Booking confirmed successfully!');
    },
    onError: (error: Error) => {
      toast.error('Failed to confirm booking', {
        description: error.message,
      });
    },
  });
};

/**
 * Hook to get booking statistics (derived from bookings list)
 */
export const useBookingStats = () => {
  const { data: bookingsData, ...query } = useBookings();

  const stats = bookingsData
    ? {
        total: bookingsData.totalCount,
        pending: bookingsData.bookings.filter((b) => b.status === 'pending').length,
        confirmed: bookingsData.bookings.filter((b) => b.status === 'confirmed').length,
        cancelled: bookingsData.bookings.filter((b) => b.status === 'cancelled').length,
        completed: bookingsData.bookings.filter((b) => b.status === 'completed').length,
        totalAmount: bookingsData.bookings
          .filter((b) => b.status !== 'cancelled')
          .reduce((sum, b) => sum + b.totalAmount, 0),
      }
    : null;

  return {
    ...query,
    data: stats,
  };
};
