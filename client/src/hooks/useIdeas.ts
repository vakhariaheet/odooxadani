import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ideasApi } from '../services/ideasApi';
import type {
  Idea,
  CreateIdeaRequest,
  UpdateIdeaRequest,
  EnhanceIdeaRequest,
  ListIdeasQuery,
} from '../types/idea';

// Query keys
const QUERY_KEYS = {
  ideas: ['ideas'] as const,
  idea: (id: string) => ['ideas', id] as const,
  myIdeas: ['ideas', 'my'] as const,
} as const;

/**
 * Hook to list ideas with filtering and pagination
 */
export const useIdeas = (query?: ListIdeasQuery) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ideas, query],
    queryFn: () => ideasApi.listIdeas(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get a single idea by ID
 */
export const useIdea = (id?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.idea(id || ''),
    queryFn: () => ideasApi.getIdea(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get current user's ideas
 */
export const useMyIdeas = (query?: Omit<ListIdeasQuery, 'creatorId'>) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.myIdeas, query],
    queryFn: () => ideasApi.getMyIdeas(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to create a new idea
 */
export const useCreateIdea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIdeaRequest) => ideasApi.createIdea(data),
    onSuccess: (newIdea) => {
      // Invalidate and refetch ideas list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ideas });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myIdeas });

      // Add the new idea to the cache
      queryClient.setQueryData(QUERY_KEYS.idea(newIdea.id), newIdea);

      toast.success('Idea created successfully!');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to create idea';
      toast.error(message);
    },
  });
};

/**
 * Hook to update an existing idea
 */
export const useUpdateIdea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIdeaRequest }) =>
      ideasApi.updateIdea(id, data),
    onSuccess: (updatedIdea) => {
      // Update the specific idea in cache
      queryClient.setQueryData(QUERY_KEYS.idea(updatedIdea.id), updatedIdea);

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ideas });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myIdeas });

      toast.success('Idea updated successfully!');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to update idea';
      toast.error(message);
    },
  });
};

/**
 * Hook to delete an idea
 */
export const useDeleteIdea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ideasApi.deleteIdea(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.idea(deletedId) });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ideas });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myIdeas });

      toast.success('Idea deleted successfully!');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to delete idea';
      toast.error(message);
    },
  });
};

/**
 * Hook to enhance idea description using AI
 */
export const useEnhanceIdea = () => {
  return useMutation({
    mutationFn: (data: EnhanceIdeaRequest) => ideasApi.enhanceIdea(data),
    onError: (error: any) => {
      const message = error?.message || 'Failed to enhance idea';
      toast.error(message);
    },
  });
};

/**
 * Hook to prefetch an idea (useful for hover states)
 */
export const usePrefetchIdea = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.idea(id),
      queryFn: () => ideasApi.getIdea(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
};

/**
 * Utility hook to get optimistic updates for ideas
 */
export const useOptimisticIdea = (id: string) => {
  const queryClient = useQueryClient();

  const updateOptimistically = (updates: Partial<Idea>) => {
    queryClient.setQueryData(QUERY_KEYS.idea(id), (old: Idea | undefined) => {
      if (!old) return old;
      return { ...old, ...updates };
    });
  };

  const revertOptimisticUpdate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.idea(id) });
  };

  return { updateOptimistically, revertOptimisticUpdate };
};
