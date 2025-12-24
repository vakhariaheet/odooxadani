// Export all services
<<<<<<< Updated upstream
export { apiClient } from './apiClient';
export type { ApiClient } from './apiClient';
export { StorageService, SessionStorageService } from './storage';
export { usersApi, authApi } from './usersApi';
export { contractsApi } from './contractsApi';
=======
export { apiClient } from './apiClient'
export type { ApiClient } from './apiClient'
export { StorageService, SessionStorageService } from './storage'
export { usersApi, authApi } from './usersApi'
export { ClientPortalApi } from './clientPortalApi'
>>>>>>> Stashed changes
export type {
  User,
  UserRole,
  UserListResponse,
  UserDetailsResponse,
  AdminStatsResponse,
  InviteUserRequest,
  InviteUserResponse,
  ChangeRoleRequest,
  ChangeRoleResponse,
  BanUserRequest,
  BanUserResponse,
  DeleteUserResponse,
  WhoAmIResponse,
} from './usersApi';
export { proposalsApi } from './proposalsApi';
export type {
  Proposal,
  CreateProposalRequest,
  UpdateProposalRequest,
  ListProposalsQuery,
  ListProposalsResponse,
  GetProposalResponse,
  CreateProposalResponse,
  UpdateProposalResponse,
} from './proposalsApi';
