/**
 * React Query Hooks for Ideas API
 * Provides caching, refetching, and mutation support for idea management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ideasApi } from '../services/ideasApi';
import type {
  Idea,
  CreateIdeaRequest,
  UpdateIdeaRequest,
  ListIdeasQuery,
  IdeaListResponse,
} from '../types/idea';

// =============================================================================
// QUERY KEYS
// =============================================================================

export const ideaKeys = {
  all: ['ideas'] as const,
  lists: () => [...ideaKeys.all, 'list'] as const,
  list: (params?: ListIdeasQuery) => [...ideaKeys.lists(), params] as const,
  details: () => [...ideaKeys.all, 'detail'] as const,
  detail: (id: string) => [...ideaKeys.details(), id] as const,
};

// =============================================================================
// IDEA QUERIES
// =============================================================================

/**
 * Hook to fetch list of ideas
 */
export function useIdeas(params?: ListIdeasQuery & { enabled?: boolean }) {
  const { enabled = true, ...queryParams } = params || {};

  return useQuery({
    queryKey: ideaKeys.list(queryParams),
    queryFn: () => ideasApi.listIdeas(queryParams),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch idea details
 */
export function useIdeaDetails(ideaId: string, enabled = true) {
  return useQuery({
    queryKey: ideaKeys.detail(ideaId),
    queryFn: () => ideasApi.getIdea(ideaId),
    enabled: enabled && !!ideaId,
  });
}

// =============================================================================
// IDEA MUTATIONS
// =============================================================================

/**
 * Hook to create a new idea
 */
export function useCreateIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIdeaRequest) => ideasApi.createIdea(data),
    onSuccess: (response) => {
      // Optimistically add new idea to cache
      const newIdea = response.data;

      queryClient.setQueriesData(
        { queryKey: ideaKeys.lists() },
        (oldData: IdeaListResponse | undefined) => {
          if (!oldData?.data) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              ideas: [newIdea, ...oldData.data.ideas],
              totalCount: oldData.data.totalCount + 1,
            },
          };
        }
      );

      // Invalidate lists to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ideaKeys.lists() });
    },
  });
}

/**
 * Hook to update an idea
 */
export function useUpdateIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIdeaRequest }) =>
      ideasApi.updateIdea(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ideaKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: ideaKeys.lists() });

      // Snapshot the previous values
      const previousIdea = queryClient.getQueryData(ideaKeys.detail(id));
      const previousLists = queryClient.getQueriesData({ queryKey: ideaKeys.lists() });

      // Optimistically update
      queryClient.setQueryData(ideaKeys.detail(id), (oldData: any) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: { ...oldData.data, ...data, updatedAt: new Date().toISOString() },
        };
      });

      queryClient.setQueriesData(
        { queryKey: ideaKeys.lists() },
        (oldData: IdeaListResponse | undefined) => {
          if (!oldData?.data?.ideas) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              ideas: oldData.data.ideas.map((idea) =>
                idea.id === id ? { ...idea, ...data, updatedAt: new Date().toISOString() } : idea
              ),
            },
          };
        }
      );

      return { previousIdea, previousLists };
    },
    onSuccess: (response, { id }) => {
      // Update with actual server response
      queryClient.setQueryData(ideaKeys.detail(id), response);
      queryClient.invalidateQueries({ queryKey: ideaKeys.lists() });
    },
    onError: (_err, { id }, context) => {
      // Rollback on error
      if (context?.previousIdea) {
        queryClient.setQueryData(ideaKeys.detail(id), context.previousIdea);
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
 * Hook to delete an idea
 */
export function useDeleteIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ideasApi.deleteIdea(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ideaKeys.lists() });

      const previousLists = queryClient.getQueriesData({ queryKey: ideaKeys.lists() });

      // Optimistically remove idea from all lists
      queryClient.setQueriesData(
        { queryKey: ideaKeys.lists() },
        (oldData: IdeaListResponse | undefined) => {
          if (!oldData?.data?.ideas) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              ideas: oldData.data.ideas.filter((idea) => idea.id !== id),
              totalCount: Math.max(0, oldData.data.totalCount - 1),
            },
          };
        }
      );

      return { previousLists };
    },
    onError: (_err, _id, context) => {
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: (_, __, id) => {
      // Remove idea detail from cache on success
      queryClient.removeQueries({ queryKey: ideaKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ideaKeys.lists() });
    },
  });
}

/**
 * Hook to vote on an idea
 */
export function useVoteIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, vote }: { id: string; vote: number }) => ideasApi.voteIdea(id, vote),
    onMutate: async ({ id, vote }) => {
      await queryClient.cancelQueries({ queryKey: ideaKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: ideaKeys.lists() });

      const previousIdea = queryClient.getQueryData(ideaKeys.detail(id));
      const previousLists = queryClient.getQueriesData({ queryKey: ideaKeys.lists() });

      // Optimistically update vote count
      const updateVotes = (idea: Idea) => ({
        ...idea,
        votes: Math.max(0, idea.votes + vote),
      });

      queryClient.setQueryData(ideaKeys.detail(id), (oldData: any) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: updateVotes(oldData.data),
        };
      });

      queryClient.setQueriesData(
        { queryKey: ideaKeys.lists() },
        (oldData: IdeaListResponse | undefined) => {
          if (!oldData?.data?.ideas) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              ideas: oldData.data.ideas.map((idea) => (idea.id === id ? updateVotes(idea) : idea)),
            },
          };
        }
      );

      return { previousIdea, previousLists };
    },
    onError: (_err, { id }, context) => {
      // Rollback on error
      if (context?.previousIdea) {
        queryClient.setQueryData(ideaKeys.detail(id), context.previousIdea);
      }
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: (_, __, { id }) => {
      // Refetch to ensure accuracy
      queryClient.invalidateQueries({ queryKey: ideaKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ideaKeys.lists() });
    },
  });
}
