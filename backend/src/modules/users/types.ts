// =============================================================================
// USER TYPES - Admin Management Module (Clerk-based)
// =============================================================================

// -----------------------------------------------------------------------------
// Clerk User (simplified view for admin)
// -----------------------------------------------------------------------------
export interface UserResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string;
  role: UserRole;
  banned: boolean;
  createdAt: number;
  updatedAt: number;
  lastSignInAt: number | null;
}

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------
export enum UserRole {
  FREELANCE = 'freelancer',
  ADMIN = 'admin',
  CLIENT = 'client',
}

// -----------------------------------------------------------------------------
// Admin Request Types
// -----------------------------------------------------------------------------

/** POST /api/admin/users/invite */
export interface InviteUserRequest {
  email: string;
  role?: UserRole;
  redirectUrl?: string;
}

/** PUT /api/admin/users/{userId}/role */
export interface ChangeRoleRequest {
  role: UserRole;
}

/** POST /api/admin/users/{userId}/ban */
export interface BanUserRequest {
  // No body needed
}

// -----------------------------------------------------------------------------
// Query & Response Types
// -----------------------------------------------------------------------------

/** GET /api/admin/users query params */
export interface ListUsersQuery {
  limit?: number;
  offset?: number;
  orderBy?: 'created_at' | 'updated_at' | 'last_sign_in_at';
}

/** GET /api/admin/users response */
export interface ListUsersResponse {
  users: UserResponse[];
  totalCount: number;
}

/** GET /api/admin/stats response */
export interface AdminStatsResponse {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  usersByRole: Record<string, number>;
}

// -----------------------------------------------------------------------------
// Invitation Types
// -----------------------------------------------------------------------------

/** Invitation object from Clerk */
export interface InvitationResponse {
  id: string;
  emailAddress: string;
  status: 'pending' | 'accepted' | 'revoked';
  publicMetadata: {
    role?: UserRole;
  };
  createdAt: number;
  updatedAt: number;
}

/** GET /api/admin/invitations response */
export interface ListInvitationsResponse {
  invitations: InvitationResponse[];
  totalCount: number;
}
