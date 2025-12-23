import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesApi } from '../services/templatesApi';
import type {
  CreateTemplateRequest,
  UpdateTemplateRequest,
  ListTemplatesQuery,
  TemplateCategory,
} from '../types/template';

// Query Keys
export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (query: ListTemplatesQuery) => [...templateKeys.lists(), query] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
  categories: () => [...templateKeys.all, 'categories'] as const,
  public: () => [...templateKeys.all, 'public'] as const,
  my: () => [...templateKeys.all, 'my'] as const,
};

/**
 * Hook for listing templates with filtering and pagination
 */
export function useTemplates(query: ListTemplatesQuery = {}) {
  return useQuery({
    queryKey: templateKeys.list(query),
    queryFn: () => templatesApi.listTemplates(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for getting a single template
 */
export function useTemplate(id: string) {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: () => templatesApi.getTemplate(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for getting public templates
 */
export function usePublicTemplates(limit = 20) {
  return useQuery({
    queryKey: templateKeys.public(),
    queryFn: () => templatesApi.getPublicTemplates(limit),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for getting user's own templates
 */
export function useMyTemplates(limit = 20) {
  return useQuery({
    queryKey: templateKeys.my(),
    queryFn: () => templatesApi.getMyTemplates(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates for own templates)
  });
}

/**
 * Hook for template mutations (create, update, delete)
 */
export function useTemplateMutations() {
  const queryClient = useQueryClient();

  const createTemplate = useMutation({
    mutationFn: (data: CreateTemplateRequest) => templatesApi.createTemplate(data),
    onSuccess: () => {
      // Invalidate and refetch template lists
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.my() });
      if (queryClient.getQueryData(templateKeys.public())) {
        queryClient.invalidateQueries({ queryKey: templateKeys.public() });
      }
    },
  });

  const updateTemplate = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateRequest }) =>
      templatesApi.updateTemplate(id, data),
    onSuccess: (updatedTemplate, { id }) => {
      // Update the specific template in cache
      queryClient.setQueryData(templateKeys.detail(id), updatedTemplate);

      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.my() });

      // If template is public, invalidate public templates
      if (updatedTemplate.isPublic) {
        queryClient.invalidateQueries({ queryKey: templateKeys.public() });
      }
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: (id: string) => templatesApi.deleteTemplate(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: templateKeys.detail(id) });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.my() });
      queryClient.invalidateQueries({ queryKey: templateKeys.public() });
    },
  });

  return {
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}

/**
 * Hook for template search with debouncing
 */
export function useTemplateSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = searchQuery; // Simplified for now

  const searchResults = useQuery({
    queryKey: templateKeys.list({ search: debouncedQuery }),
    queryFn: () => templatesApi.searchTemplates(debouncedQuery),
    enabled: debouncedQuery.length > 0,
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching: searchResults.isLoading,
  };
}

/**
 * Hook for templates by category
 */
export function useTemplatesByCategory(category: TemplateCategory, limit = 20) {
  return useQuery({
    queryKey: templateKeys.list({ category, limit }),
    queryFn: () => templatesApi.getTemplatesByCategory(category, limit),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for template statistics and management
 */
export function useTemplateManagement() {
  const queryClient = useQueryClient();

  const refreshTemplates = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: templateKeys.all });
  }, [queryClient]);

  const prefetchTemplate = useCallback(
    (id: string) => {
      queryClient.prefetchQuery({
        queryKey: templateKeys.detail(id),
        queryFn: () => templatesApi.getTemplate(id),
        staleTime: 10 * 60 * 1000,
      });
    },
    [queryClient]
  );

  return {
    refreshTemplates,
    prefetchTemplate,
  };
}
