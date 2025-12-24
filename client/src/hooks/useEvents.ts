/**
 * React Query Hooks for Events API
 * Provides caching, refetching, and mutation support for events
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import { eventsApi } from '../services/eventsApi';
import type {
  CreateEventRequest,
  UpdateEventRequest,
  EventListQuery,
  EventListResponse,
} from '../types/event';

// =============================================================================
// QUERY KEYS
// =============================================================================

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (params?: EventListQuery) => [...eventKeys.lists(), params] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  myEvents: () => [...eventKeys.all, 'my-events'] as const,
};

// =============================================================================
// EVENT QUERIES
// =============================================================================

/**
 * Hook to fetch list of events with filtering and pagination
 */
export function useEvents(params?: EventListQuery & { enabled?: boolean }) {
  const { enabled = true, ...queryParams } = params || {};

  return useQuery({
    queryKey: eventKeys.list(queryParams),
    queryFn: () => eventsApi.listEvents(queryParams),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch event details by ID
 */
export function useEvent(eventId: string, enabled = true) {
  return useQuery({
    queryKey: eventKeys.detail(eventId),
    queryFn: () => eventsApi.getEvent(eventId),
    enabled: enabled && !!eventId,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch current user's events
 */
export function useMyEvents(params?: Omit<EventListQuery, 'organizerId'> & { enabled?: boolean }) {
  const { user } = useUser();
  const { enabled = true, ...queryParams } = params || {};

  return useQuery({
    queryKey: [...eventKeys.myEvents(), queryParams],
    queryFn: () => eventsApi.listEvents({ ...queryParams, organizerId: user?.id }),
    enabled: enabled && !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch published events (public)
 */
export function usePublishedEvents(
  params?: Omit<EventListQuery, 'status'> & { enabled?: boolean }
) {
  const { enabled = true, ...queryParams } = params || {};

  return useQuery({
    queryKey: eventKeys.list({ ...queryParams, status: 'published' }),
    queryFn: () => eventsApi.listEvents({ ...queryParams, status: 'published' }),
    enabled,
    staleTime: 60 * 1000, // 1 minute for public events
  });
}

// =============================================================================
// EVENT MUTATIONS
// =============================================================================

/**
 * Hook to create a new event
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventRequest) => eventsApi.createEvent(data),
    onSuccess: (response) => {
      const newEvent = response.data;

      // Add to my events cache
      queryClient.setQueriesData(
        { queryKey: eventKeys.myEvents() },
        (oldData: EventListResponse | undefined) => {
          if (!oldData?.data) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              events: [newEvent, ...oldData.data.events],
              totalCount: oldData.data.totalCount + 1,
            },
          };
        }
      );

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.myEvents() });
    },
  });
}

/**
 * Hook to update an event
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: UpdateEventRequest }) =>
      eventsApi.updateEvent(eventId, data),
    onMutate: async ({ eventId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: eventKeys.detail(eventId) });
      await queryClient.cancelQueries({ queryKey: eventKeys.lists() });

      // Snapshot the previous values
      const previousEvent = queryClient.getQueryData(eventKeys.detail(eventId));
      const previousLists = queryClient.getQueriesData({ queryKey: eventKeys.lists() });

      // Optimistically update event detail
      queryClient.setQueryData(eventKeys.detail(eventId), (oldData: any) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: { ...oldData.data, ...data, updatedAt: new Date().toISOString() },
        };
      });

      // Optimistically update in lists
      queryClient.setQueriesData(
        { queryKey: eventKeys.lists() },
        (oldData: EventListResponse | undefined) => {
          if (!oldData?.data?.events) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              events: oldData.data.events.map((event) =>
                event.eventId === eventId
                  ? { ...event, ...data, updatedAt: new Date().toISOString() }
                  : event
              ),
            },
          };
        }
      );

      return { previousEvent, previousLists };
    },
    onSuccess: (response, { eventId }) => {
      // Update with actual server response
      queryClient.setQueryData(eventKeys.detail(eventId), response);

      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.myEvents() });
    },
    onError: (_err, { eventId }, context) => {
      // Rollback on error
      if (context?.previousEvent) {
        queryClient.setQueryData(eventKeys.detail(eventId), context.previousEvent);
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
 * Hook to delete an event
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => eventsApi.deleteEvent(eventId),
    onMutate: async (eventId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: eventKeys.lists() });

      // Snapshot the previous values
      const previousLists = queryClient.getQueriesData({ queryKey: eventKeys.lists() });

      // Optimistically remove from all lists
      queryClient.setQueriesData(
        { queryKey: eventKeys.lists() },
        (oldData: EventListResponse | undefined) => {
          if (!oldData?.data?.events) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              events: oldData.data.events.filter((event) => event.eventId !== eventId),
              totalCount: Math.max(0, oldData.data.totalCount - 1),
            },
          };
        }
      );

      return { previousLists };
    },
    onSuccess: (_, eventId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: eventKeys.detail(eventId) });

      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.myEvents() });
    },
    onError: (_err, _eventId, context) => {
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
 * Hook to publish an event (change status to published)
 */
export function usePublishEvent() {
  const updateEvent = useUpdateEvent();

  return useMutation({
    mutationFn: (eventId: string) => eventsApi.publishEvent(eventId),
    onSuccess: (_, eventId) => {
      // Trigger the update event success logic
      updateEvent.mutate({ eventId, data: { status: 'published' } });
    },
  });
}

/**
 * Hook to cancel an event
 */
export function useCancelEvent() {
  const updateEvent = useUpdateEvent();

  return useMutation({
    mutationFn: (eventId: string) => eventsApi.cancelEvent(eventId),
    onSuccess: (_, eventId) => {
      // Trigger the update event success logic
      updateEvent.mutate({ eventId, data: { status: 'cancelled' } });
    },
  });
}

/**
 * Hook to mark event as completed
 */
export function useCompleteEvent() {
  const updateEvent = useUpdateEvent();

  return useMutation({
    mutationFn: (eventId: string) => eventsApi.completeEvent(eventId),
    onSuccess: (_, eventId) => {
      // Trigger the update event success logic
      updateEvent.mutate({ eventId, data: { status: 'completed' } });
    },
  });
}
