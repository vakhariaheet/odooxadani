import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClientPortalApi } from '../services/clientPortalApi';
import type {
  ClientDashboard,
  ClientProfile,
  UpdateClientProfileRequest,
  ClientListQuery,
} from '../types/client-portal';

/**
 * Custom hooks for Client Portal data management
 */

// Query keys for React Query
export const clientPortalKeys = {
  all: ['client-portal'] as const,
  dashboard: () => [...clientPortalKeys.all, 'dashboard'] as const,
  proposals: (query?: ClientListQuery) => [...clientPortalKeys.all, 'proposals', query] as const,
  contracts: (query?: ClientListQuery) => [...clientPortalKeys.all, 'contracts', query] as const,
  invoices: (query?: ClientListQuery) => [...clientPortalKeys.all, 'invoices', query] as const,
  profile: () => [...clientPortalKeys.all, 'profile'] as const,
};

/**
 * Hook to fetch client dashboard data
 */
export function useClientDashboard() {
  return useQuery({
    queryKey: clientPortalKeys.dashboard(),
    queryFn: async (): Promise<ClientDashboard> => {
      const response = await ClientPortalApi.getDashboard();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to fetch client proposals
 */
export function useClientProposals(query: ClientListQuery = {}) {
  return useQuery({
    queryKey: clientPortalKeys.proposals(query),
    queryFn: async () => {
      const response = await ClientPortalApi.getProposals(query);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch client contracts
 */
export function useClientContracts(query: ClientListQuery = {}) {
  return useQuery({
    queryKey: clientPortalKeys.contracts(query),
    queryFn: async () => {
      const response = await ClientPortalApi.getContracts(query);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch client invoices
 */
export function useClientInvoices(query: ClientListQuery = {}) {
  return useQuery({
    queryKey: clientPortalKeys.invoices(query),
    queryFn: async () => {
      const response = await ClientPortalApi.getInvoices(query);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch client profile
 */
export function useClientProfile() {
  return useQuery({
    queryKey: clientPortalKeys.profile(),
    queryFn: async (): Promise<ClientProfile> => {
      const response = await ClientPortalApi.getProfile();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to update client profile
 */
export function useUpdateClientProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateClientProfileRequest): Promise<ClientProfile> => {
      const response = await ClientPortalApi.updateProfile(data);
      return response.data;
    },
    onSuccess: (updatedProfile) => {
      // Update the profile cache
      queryClient.setQueryData(clientPortalKeys.profile(), updatedProfile);
      
      // Invalidate dashboard to refresh any profile-related data
      queryClient.invalidateQueries({ queryKey: clientPortalKeys.dashboard() });
    },
  });
}

/**
 * Hook to refresh all client portal data
 */
export function useRefreshClientPortal() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: clientPortalKeys.all });
  };
}