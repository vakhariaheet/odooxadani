// Export all custom hooks
export { useApi } from './useApi';
export { useLocalStorage } from './useLocalStorage';
export { useDebounce, useDebouncedCallback } from './useDebounce';
export { useAsync, useAsyncCallback } from './useAsync';
export { useConfirmDialog } from './useConfirmDialog';
export { useWebSocket, useWebSocketChat, useWebSocketNotifications } from './useWebSocket';

// User API hooks
export {
  useUsers,
  useUserDetails,
  useAdminStats,
  useWhoAmI,
  useInviteUser,
  useInvitations,
  useRevokeInvitation,
  useResendInvitation,
  useChangeRole,
  useBanUser,
  useUnbanUser,
  useDeleteUser,
  userKeys,
  authKeys,
} from './useUsers';

// Contract API hooks
export {
  useContracts,
  useContract,
  useCreateContract,
  useUpdateContract,
  useSendContract,
  useSignContract,
  useDeleteContract,
  contractKeys,
} from './useContracts';
// Proposal API hooks
export {
  useProposals,
  useProposal,
  useCreateProposal,
  useUpdateProposal,
  useDeleteProposal,
  useSendProposal,
  useAcceptProposal,
  useRejectProposal,
  proposalKeys,
} from './useProposals';
