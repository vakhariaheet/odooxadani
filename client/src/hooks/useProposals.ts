/**
 * React Query Hooks for Proposals API
 * Provides caching, refetching, and mutation support
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { proposalsApi } from '../services/proposalsApi';
import type {
  CreateProposalRequest,
  UpdateProposalRequest,
  ListProposalsQuery,
  ListProposalsResponse,
} from '../types/proposal';

// =============================================================================
// QUERY KEYS
// =============================================================================

export const proposalKeys = {
  all: ['proposals'] as const,
  lists: () => [...proposalKeys.all, 'list'] as const,
  list: (params?: ListProposalsQuery) => [...proposalKeys.lists(), params] as const,
  details: () => [...proposalKeys.all, 'detail'] as const,
  detail: (id: string) => [...proposalKeys.details(), id] as const,
};

// =============================================================================
// PROPOSAL QUERIES
// =============================================================================

/**
 * Hook to fetch list of proposals
 */
export function useProposals(params?: ListProposalsQuery & { enabled?: boolean }) {
  const { enabled = true, ...queryParams } = params || {};

  return useQuery({
    queryKey: proposalKeys.list(queryParams),
    queryFn: () => proposalsApi.listProposals(queryParams),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch proposal details
 */
export function useProposal(proposalId: string, enabled = true) {
  return useQuery({
    queryKey: proposalKeys.detail(proposalId),
    queryFn: () => proposalsApi.getProposal(proposalId),
    enabled: enabled && !!proposalId,
    staleTime: 60 * 1000, // 1 minute
  });
}

// =============================================================================
// PROPOSAL MUTATIONS
// =============================================================================

/**
 * Hook to create a new proposal
 */
export function useCreateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProposalRequest) => proposalsApi.createProposal(data),
    onSuccess: (response) => {
      // Add new proposal to cache
      const newProposal = response.data.proposal;

      // Invalidate and refetch proposal lists
      queryClient.invalidateQueries({ queryKey: proposalKeys.lists() });

      // Set the new proposal in detail cache
      queryClient.setQueryData(proposalKeys.detail(newProposal.id), {
        success: true,
        data: { proposal: newProposal },
      });
    },
  });
}

/**
 * Hook to update a proposal
 */
export function useUpdateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ proposalId, data }: { proposalId: string; data: UpdateProposalRequest }) =>
      proposalsApi.updateProposal(proposalId, data),
    onMutate: async ({ proposalId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: proposalKeys.detail(proposalId) });
      await queryClient.cancelQueries({ queryKey: proposalKeys.lists() });

      // Snapshot the previous values
      const previousProposal = queryClient.getQueryData(proposalKeys.detail(proposalId));
      const previousLists = queryClient.getQueriesData({ queryKey: proposalKeys.lists() });

      // Optimistically update proposal detail
      queryClient.setQueryData(proposalKeys.detail(proposalId), (oldData: any) => {
        if (!oldData?.data?.proposal) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            proposal: {
              ...oldData.data.proposal,
              ...data,
              updatedAt: new Date().toISOString(),
            },
          },
        };
      });

      // Optimistically update proposal in lists
      queryClient.setQueriesData(
        { queryKey: proposalKeys.lists() },
        (oldData: ListProposalsResponse | undefined) => {
          if (!oldData?.data?.proposals) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              proposals: oldData.data.proposals.map((proposal) =>
                proposal.id === proposalId
                  ? { ...proposal, ...data, updatedAt: new Date().toISOString() }
                  : proposal
              ),
            },
          };
        }
      );

      return { previousProposal, previousLists };
    },
    onSuccess: (response, { proposalId }) => {
      // Update with actual server response
      const updatedProposal = response.data.proposal;

      queryClient.setQueryData(proposalKeys.detail(proposalId), {
        success: true,
        data: { proposal: updatedProposal },
      });

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: proposalKeys.lists() });
    },
    onError: (_err, { proposalId }, context) => {
      // Rollback on error
      if (context?.previousProposal) {
        queryClient.setQueryData(proposalKeys.detail(proposalId), context.previousProposal);
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
 * Hook to delete a proposal
 */
export function useDeleteProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (proposalId: string) => proposalsApi.deleteProposal(proposalId),
    onMutate: async (proposalId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: proposalKeys.lists() });

      // Snapshot the previous values
      const previousLists = queryClient.getQueriesData({ queryKey: proposalKeys.lists() });

      // Optimistically remove proposal from lists
      queryClient.setQueriesData(
        { queryKey: proposalKeys.lists() },
        (oldData: ListProposalsResponse | undefined) => {
          if (!oldData?.data?.proposals) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              proposals: oldData.data.proposals.filter((proposal) => proposal.id !== proposalId),
              totalCount: Math.max(0, oldData.data.totalCount - 1),
            },
          };
        }
      );

      return { previousLists };
    },
    onSuccess: (_, proposalId) => {
      // Remove proposal detail from cache
      queryClient.removeQueries({ queryKey: proposalKeys.detail(proposalId) });

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: proposalKeys.lists() });
    },
    onError: (_err, _proposalId, context) => {
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
 * Hook to send a proposal (change status from draft to sent)
 */
export function useSendProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (proposalId: string) => proposalsApi.sendProposal(proposalId),
    onSuccess: (response, proposalId) => {
      const updatedProposal = response.data.proposal;

      // Update proposal detail
      queryClient.setQueryData(proposalKeys.detail(proposalId), {
        success: true,
        data: { proposal: updatedProposal },
      });

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: proposalKeys.lists() });
    },
  });
}

/**
 * Hook to accept a proposal (client action)
 */
export function useAcceptProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (proposalId: string) => proposalsApi.acceptProposal(proposalId),
    onSuccess: (response, proposalId) => {
      const updatedProposal = response.data.proposal;

      // Update proposal detail
      queryClient.setQueryData(proposalKeys.detail(proposalId), {
        success: true,
        data: { proposal: updatedProposal },
      });

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: proposalKeys.lists() });
    },
  });
}

/**
 * Hook to reject a proposal (client action)
 */
export function useRejectProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (proposalId: string) => proposalsApi.rejectProposal(proposalId),
    onSuccess: (response, proposalId) => {
      const updatedProposal = response.data.proposal;

      // Update proposal detail
      queryClient.setQueryData(proposalKeys.detail(proposalId), {
        success: true,
        data: { proposal: updatedProposal },
      });

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: proposalKeys.lists() });
    },
  });
}
