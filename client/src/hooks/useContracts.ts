/**
 * React Query Hooks for Contracts API
 * Provides caching, refetching, and mutation support
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractsApi } from '../services/contractsApi';
import type {
  Contract,
  CreateContractRequest,
  UpdateContractRequest,
  SignContractRequest,
  ListContractsQuery,
} from '../types/contract';
import { ContractStatus } from '../types/contract';

// =============================================================================
// QUERY KEYS
// =============================================================================

export const contractKeys = {
  all: ['contracts'] as const,
  lists: () => [...contractKeys.all, 'list'] as const,
  list: (params?: ListContractsQuery) => [...contractKeys.lists(), params] as const,
  details: () => [...contractKeys.all, 'detail'] as const,
  detail: (id: string) => [...contractKeys.details(), id] as const,
};

// =============================================================================
// CONTRACT QUERIES
// =============================================================================

/**
 * Hook to fetch list of contracts
 */
export function useContracts(params?: ListContractsQuery & { enabled?: boolean }) {
  const { enabled = true, ...queryParams } = params || {};

  return useQuery({
    queryKey: contractKeys.list(queryParams),
    queryFn: () => contractsApi.listContracts(queryParams),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch contract details
 */
export function useContract(contractId: string, enabled = true) {
  return useQuery({
    queryKey: contractKeys.detail(contractId),
    queryFn: () => contractsApi.getContract(contractId),
    enabled: enabled && !!contractId,
    staleTime: 60 * 1000, // 1 minute
  });
}

// =============================================================================
// CONTRACT MUTATIONS
// =============================================================================

/**
 * Hook to create a new contract
 */
export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContractRequest) => contractsApi.createContract(data),
    onSuccess: (response) => {
      // Add new contract to cache
      const newContract = response.data.contract;

      queryClient.setQueriesData({ queryKey: contractKeys.lists() }, (oldData: any) => {
        if (!oldData?.data) return oldData;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            contracts: [newContract, ...oldData.data.contracts],
            totalCount: oldData.data.totalCount + 1,
          },
        };
      });

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
    },
  });
}

/**
 * Hook to update a contract
 */
export function useUpdateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contractId, data }: { contractId: string; data: UpdateContractRequest }) =>
      contractsApi.updateContract(contractId, data),
    onMutate: async ({ contractId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: contractKeys.detail(contractId) });
      await queryClient.cancelQueries({ queryKey: contractKeys.lists() });

      // Snapshot the previous values
      const previousContract = queryClient.getQueryData(contractKeys.detail(contractId));
      const previousLists = queryClient.getQueriesData({ queryKey: contractKeys.lists() });

      // Optimistically update contract detail
      queryClient.setQueryData(contractKeys.detail(contractId), (oldData: any) => {
        if (!oldData?.data?.contract) return oldData;
        return {
          ...oldData,
          data: {
            contract: { ...oldData.data.contract, ...data, updatedAt: new Date().toISOString() },
          },
        };
      });

      // Optimistically update contract in lists
      queryClient.setQueriesData({ queryKey: contractKeys.lists() }, (oldData: any) => {
        if (!oldData?.data?.contracts) return oldData;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            contracts: oldData.data.contracts.map((contract: Contract) =>
              contract.id === contractId
                ? { ...contract, ...data, updatedAt: new Date().toISOString() }
                : contract
            ),
          },
        };
      });

      return { previousContract, previousLists };
    },
    onSuccess: (response, { contractId }) => {
      // Update with actual server response
      const updatedContract = response.data.contract;

      queryClient.setQueryData(contractKeys.detail(contractId), {
        success: true,
        data: { contract: updatedContract },
      });

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
    },
    onError: (_err, { contractId }, context) => {
      // Rollback on error
      if (context?.previousContract) {
        queryClient.setQueryData(contractKeys.detail(contractId), context.previousContract);
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
 * Hook to send a contract (change status from draft to sent)
 */
export function useSendContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contractId: string) => contractsApi.sendContract(contractId),
    onMutate: async (contractId) => {
      await queryClient.cancelQueries({ queryKey: contractKeys.detail(contractId) });
      await queryClient.cancelQueries({ queryKey: contractKeys.lists() });

      const previousContract = queryClient.getQueryData(contractKeys.detail(contractId));
      const previousLists = queryClient.getQueriesData({ queryKey: contractKeys.lists() });

      // Optimistically update status
      const now = new Date().toISOString();
      const updates = {
        status: ContractStatus.SENT,
        sentAt: now,
        updatedAt: now,
      };

      queryClient.setQueryData(contractKeys.detail(contractId), (oldData: any) => {
        if (!oldData?.data?.contract) return oldData;
        return {
          ...oldData,
          data: {
            contract: { ...oldData.data.contract, ...updates },
          },
        };
      });

      queryClient.setQueriesData({ queryKey: contractKeys.lists() }, (oldData: any) => {
        if (!oldData?.data?.contracts) return oldData;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            contracts: oldData.data.contracts.map((contract: Contract) =>
              contract.id === contractId ? { ...contract, ...updates } : contract
            ),
          },
        };
      });

      return { previousContract, previousLists };
    },
    onSuccess: (response, contractId) => {
      const updatedContract = response.data.contract;

      queryClient.setQueryData(contractKeys.detail(contractId), {
        success: true,
        data: { contract: updatedContract },
      });

      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
    },
    onError: (_err, contractId, context) => {
      if (context?.previousContract) {
        queryClient.setQueryData(contractKeys.detail(contractId), context.previousContract);
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
 * Hook to sign a contract
 */
export function useSignContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contractId, data }: { contractId: string; data: SignContractRequest }) =>
      contractsApi.signContract(contractId, data),
    onSuccess: (response, { contractId }) => {
      const updatedContract = response.data.contract;

      // Update contract detail
      queryClient.setQueryData(contractKeys.detail(contractId), {
        success: true,
        data: { contract: updatedContract },
      });

      // Update contract in lists
      queryClient.setQueriesData({ queryKey: contractKeys.lists() }, (oldData: any) => {
        if (!oldData?.data?.contracts) return oldData;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            contracts: oldData.data.contracts.map((contract: Contract) =>
              contract.id === contractId ? updatedContract : contract
            ),
          },
        };
      });

      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
    },
  });
}

/**
 * Hook to delete a contract
 */
export function useDeleteContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contractId: string) => contractsApi.deleteContract(contractId),
    onMutate: async (contractId) => {
      await queryClient.cancelQueries({ queryKey: contractKeys.lists() });

      const previousLists = queryClient.getQueriesData({ queryKey: contractKeys.lists() });

      // Optimistically remove contract from lists
      queryClient.setQueriesData({ queryKey: contractKeys.lists() }, (oldData: any) => {
        if (!oldData?.data?.contracts) return oldData;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            contracts: oldData.data.contracts.filter(
              (contract: Contract) => contract.id !== contractId
            ),
            totalCount: Math.max(0, oldData.data.totalCount - 1),
          },
        };
      });

      return { previousLists };
    },
    onError: (_err, _contractId, context) => {
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: (_, __, contractId) => {
      // Remove contract detail from cache
      queryClient.removeQueries({ queryKey: contractKeys.detail(contractId) });
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
    },
  });
}
