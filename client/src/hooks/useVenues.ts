/**
 * React Query Hooks for Venues API
 * Provides caching, refetching, and mutation support
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { venuesApi } from '../services/venuesApi';
import type {
  CreateVenueRequest,
  UpdateVenueRequest,
  VenueSearchQuery,
  AvailabilityQuery,
  VenueListResponse,
  Venue,
} from '../types/venue';

// =============================================================================
// QUERY KEYS
// =============================================================================

export const venueKeys = {
  all: ['venues'] as const,
  lists: () => [...venueKeys.all, 'list'] as const,
  list: (params?: VenueSearchQuery) => [...venueKeys.lists(), params] as const,
  details: () => [...venueKeys.all, 'detail'] as const,
  detail: (id: string) => [...venueKeys.details(), id] as const,
  availability: (id: string, query?: AvailabilityQuery) => 
    [...venueKeys.all, 'availability', id, query] as const,
  myVenues: () => [...venueKeys.all, 'my'] as const,
};

// =============================================================================
// VENUE QUERIES
// =============================================================================

/**
 * Hook to fetch list of venues with search and filtering
 */
export function useVenues(query?: VenueSearchQuery & { enabled?: boolean }) {
  const { enabled = true, ...searchQuery } = query || {};

  const queryKey = venueKeys.list(searchQuery);

  return useQuery({
    queryKey,
    queryFn: () => venuesApi.listVenues(searchQuery),
    enabled,
    staleTime: 5 * 1000, // 5 seconds - shorter for search responsiveness
  });
}

/**
 * Hook to fetch venue details
 */
export function useVenueDetails(venueId: string, enabled = true) {
  return useQuery({
    queryKey: venueKeys.detail(venueId),
    queryFn: () => venuesApi.getVenue(venueId),
    enabled: enabled && !!venueId,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch venue availability
 */
export function useVenueAvailability(
  venueId: string, 
  query: AvailabilityQuery,
  enabled = true
) {
  return useQuery({
    queryKey: venueKeys.availability(venueId, query),
    queryFn: () => venuesApi.getAvailability(venueId, query),
    enabled: enabled && !!venueId && !!query.startDate && !!query.endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch venues owned by current user
 */
export function useMyVenues(enabled = true) {
  return useQuery({
    queryKey: venueKeys.myVenues(),
    queryFn: () => venuesApi.getMyVenues(),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// =============================================================================
// VENUE MUTATIONS
// =============================================================================

/**
 * Hook to create a new venue
 */
export function useCreateVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVenueRequest) => venuesApi.createVenue(data),
    onSuccess: (response) => {
      // Add new venue to cache
      const newVenue = response.data;

      // Update venue lists
      queryClient.setQueriesData(
        { queryKey: venueKeys.lists() },
        (oldData: VenueListResponse | undefined) => {
          if (!oldData?.data) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              venues: [newVenue, ...oldData.data.venues],
              totalCount: oldData.data.totalCount + 1,
            },
          };
        }
      );

      // Update my venues cache
      queryClient.setQueryData(venueKeys.myVenues(), (oldData: VenueListResponse | undefined) => {
        if (!oldData?.data) return oldData;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            venues: [newVenue, ...oldData.data.venues],
            totalCount: oldData.data.totalCount + 1,
          },
        };
      });

      // Set individual venue cache
      queryClient.setQueryData(venueKeys.detail(newVenue.venueId), {
        success: true,
        data: newVenue,
      });

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
    },
  });
}

/**
 * Hook to update a venue
 */
export function useUpdateVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ venueId, data }: { venueId: string; data: UpdateVenueRequest }) =>
      venuesApi.updateVenue(venueId, data),
    onMutate: async ({ venueId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: venueKeys.detail(venueId) });
      await queryClient.cancelQueries({ queryKey: venueKeys.lists() });

      // Snapshot previous values
      const previousVenue = queryClient.getQueryData(venueKeys.detail(venueId));
      const previousLists = queryClient.getQueriesData({ queryKey: venueKeys.lists() });

      // Optimistically update venue detail
      queryClient.setQueryData(venueKeys.detail(venueId), (oldData: unknown) => {
        const typedOldData = oldData as { data?: Venue } | undefined;
        if (!typedOldData?.data) return oldData;
        return {
          ...typedOldData,
          data: { ...typedOldData.data, ...data, updatedAt: new Date().toISOString() },
        };
      });

      // Optimistically update venue in lists
      queryClient.setQueriesData(
        { queryKey: venueKeys.lists() },
        (oldData: VenueListResponse | undefined) => {
          if (!oldData?.data?.venues) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              venues: oldData.data.venues.map((venue) =>
                venue.venueId === venueId 
                  ? { ...venue, ...data, updatedAt: new Date().toISOString() }
                  : venue
              ),
            },
          };
        }
      );

      return { previousVenue, previousLists };
    },
    onSuccess: (response, { venueId }) => {
      // Update with server response
      queryClient.setQueryData(venueKeys.detail(venueId), {
        success: true,
        data: response.data,
      });

      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
    },
    onError: (_err, { venueId }, context) => {
      // Rollback on error
      if (context?.previousVenue) {
        queryClient.setQueryData(venueKeys.detail(venueId), context.previousVenue);
      }
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
  });
}

/**
 * Hook to delete a venue
 */
export function useDeleteVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (venueId: string) => venuesApi.deleteVenue(venueId),
    onMutate: async (venueId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: venueKeys.lists() });

      // Snapshot previous values
      const previousLists = queryClient.getQueriesData({ queryKey: venueKeys.lists() });

      // Optimistically remove venue from lists
      queryClient.setQueriesData(
        { queryKey: venueKeys.lists() },
        (oldData: VenueListResponse | undefined) => {
          if (!oldData?.data?.venues) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              venues: oldData.data.venues.filter((venue) => venue.venueId !== venueId),
              totalCount: Math.max(0, oldData.data.totalCount - 1),
            },
          };
        }
      );

      return { previousLists };
    },
    onSuccess: (_, venueId) => {
      // Remove venue detail from cache
      queryClient.removeQueries({ queryKey: venueKeys.detail(venueId) });
      
      // Remove availability data
      queryClient.removeQueries({ 
        queryKey: [...venueKeys.all, 'availability', venueId] 
      });

      // Clean up wishlist - remove deleted venue from all users' wishlists
      // This is handled client-side since wishlist is localStorage-based
      try {
        // Get all localStorage keys that match wishlist pattern
        const wishlistKeys = Object.keys(localStorage).filter(key => 
          key.startsWith('venue_wishlist_')
        );
        
        wishlistKeys.forEach(key => {
          try {
            const wishlistData = localStorage.getItem(key);
            if (wishlistData) {
              const items = JSON.parse(wishlistData);
              const filteredItems = items.filter((item: { venueId: string }) => item.venueId !== venueId);
              
              if (filteredItems.length !== items.length) {
                localStorage.setItem(key, JSON.stringify(filteredItems));
                console.log(`Removed deleted venue ${venueId} from wishlist ${key}`);
              }
            }
          } catch (error) {
            console.warn(`Failed to clean wishlist ${key}:`, error);
          }
        });

        // Dispatch custom event to notify wishlist hooks to refresh
        window.dispatchEvent(new CustomEvent('venue-deleted', { 
          detail: { venueId } 
        }));
      } catch (error) {
        console.warn('Failed to clean wishlists after venue deletion:', error);
      }

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
    },
    onError: (_err, _venueId, context) => {
      // Rollback on error
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
  });
}

/**
 * Hook to search venues with debounced query
 */
export function useVenueSearch(query: VenueSearchQuery, debounceMs = 300) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return useVenues(debouncedQuery);
}

// Import useState and useEffect for the search hook
import { useState, useEffect } from 'react';

// =============================================================================
// HANDOFF INTERFACE FOR BOOKING MODULES (F04 & M08)
// =============================================================================

/**
 * ⚠️ HANDOFF NOTICE ⚠️
 * The following interfaces are provided for booking system modules to build upon
 * Do not modify these interfaces without coordinating with booking module development
 */

// Venue data access interface for booking modules
export interface VenueHooksForBooking {
  // Read-only venue data access
  useVenueDetails: typeof useVenueDetails;
  useVenueAvailability: typeof useVenueAvailability;
  useVenues: typeof useVenues;
  
  // Query keys for cache management
  venueKeys: typeof venueKeys;
}

// Availability checking interface for booking modules
export interface AvailabilityHooksForBooking {
  useVenueAvailability: typeof useVenueAvailability;
  
  // Future: booking modules will extend this with booking-specific availability
  // useBookingAvailability?: (venueId: string, bookingId?: string) => any;
  // useAvailabilityConflicts?: (venueId: string, timeSlot: TimeSlot) => any;
}