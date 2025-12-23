import { createClerkClient } from '@clerk/backend';
import { getAvailableRoles } from '../../../config/permissions';
import {
  UserResponse,
  UserRole,
  ListUsersQuery,
  ListUsersResponse,
  AdminStatsResponse,
  InvitationResponse,
} from '../types';

// Initialize Clerk client
const clerkClient = createClerkClient({
  secretKey: process.env['CLERK_SECRET_KEY']!,
});

/**
 * Maps Clerk user to our simplified UserResponse
 */
function mapClerkUserToResponse(user: any): UserResponse {
  const primaryEmail = user.emailAddresses?.find(
    (e: any) => e.id === user.primaryEmailAddressId
  );
  
  return {
    id: user.id,
    email: primaryEmail?.emailAddress || '',
    firstName: user.firstName,
    lastName: user.lastName,
    profileImageUrl: user.imageUrl || '',
    role: user.publicMetadata?.['role'] as UserRole,
    banned: user.banned || false,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastSignInAt: user.lastSignInAt,
  };
}

export class ClerkUserService {
  /**
   * List all users with pagination
   */
  async listUsers(query: ListUsersQuery): Promise<ListUsersResponse> {
    const { limit = 20, offset = 0, orderBy = 'created_at' } = query;

    const response = await clerkClient.users.getUserList({
      limit,
      offset,
      orderBy: `-${orderBy}`, // Descending order
    });

    return {
      users: response.data.map(mapClerkUserToResponse),
      totalCount: response.totalCount,
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserResponse> {
    const user = await clerkClient.users.getUser(userId);
    return mapClerkUserToResponse(user);
  }

  /**
   * Invite a new user via Clerk invitation
   */
  async inviteUser(
    email: string,
    role: UserRole,
    redirectUrl?: string
  ): Promise<{ invitationId: string }> {
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: redirectUrl || process.env['CLERK_REDIRECT_URL'],
      publicMetadata: {
        role: role,
      },
    });

    return { invitationId: invitation.id };
  }

  /**
   * Change user's role via publicMetadata
   */
  async changeUserRole(userId: string, newRole: UserRole, adminUserId: string): Promise<UserResponse> {
    // Validate role
    if (!Object.values(UserRole).includes(newRole)) {
      throw new Error('Invalid role');
    }

    // Prevent admin from changing their own role
    if (userId === adminUserId) {
      throw new Error('Cannot change your own role');
    }

    const user = await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: newRole,
      },
    });

    return mapClerkUserToResponse(user);
  }

  /**
   * Ban a user
   */
  async banUser(userId: string, adminUserId: string): Promise<UserResponse> {
    // Prevent admin from banning themselves
    if (userId === adminUserId) {
      throw new Error('Cannot ban yourself');
    }

    const user = await clerkClient.users.banUser(userId);
    return mapClerkUserToResponse(user);
  }

  /**
   * Unban a user
   */
  async unbanUser(userId: string): Promise<UserResponse> {
    const user = await clerkClient.users.unbanUser(userId);
    return mapClerkUserToResponse(user);
  }

  /**
   * Delete a user permanently
   */
  async deleteUser(userId: string, adminUserId: string): Promise<void> {
    // Prevent admin from deleting themselves
    if (userId === adminUserId) {
      throw new Error('Cannot delete yourself');
    }

    await clerkClient.users.deleteUser(userId);
  }

  /**
   * Get admin statistics
   */
  async getAdminStats(): Promise<AdminStatsResponse> {
    // Get all users (Clerk returns max 500 per request)
    const response = await clerkClient.users.getUserList({
      limit: 500,
    });

    // Dynamically create usersByRole object with all available roles
    const availableRoles = getAvailableRoles();
    const usersByRole: Record<string, number> = {};

    // Initialize all roles with 0 count
    availableRoles.forEach((role: string) => {
      usersByRole[role] = 0;
    });

    const stats: AdminStatsResponse = {
      totalUsers: response.totalCount,
      activeUsers: 0,
      bannedUsers: 0,
      usersByRole,
    };

    for (const user of response.data) {
      // Count banned users
      if (user.banned) {
        stats.bannedUsers++;
      } else {
        stats.activeUsers++;
      }

      // Count by role
      const role = (user.publicMetadata?.['role'] as string) || 'user';

      // Only count if it's a valid role, otherwise count as 'user' (fallback)
      if (stats.usersByRole[role] !== undefined) {
        stats.usersByRole[role]++;
      } else {
        // Fallback to 'user' role if role doesn't exist
        stats.usersByRole['user'] = (stats.usersByRole['user'] || 0) + 1;
      }
    }

    return stats;
  }

  /**
   * Revoke a pending invitation
   */
  async revokeInvitation(invitationId: string): Promise<void> {
    try {
      await clerkClient.invitations.revokeInvitation(invitationId);
    } catch (error: any) {
      // If the invitation is already revoked, treat it as success
      if (error?.errors?.[0]?.code === 'invitation_already_revoked') {
        return; // Silently succeed - the desired state is achieved
      }
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * List pending invitations with pagination and search
   */
  async listInvitations(query?: { 
    limit?: number; 
    offset?: number; 
    email?: string; 
  }): Promise<{ invitations: InvitationResponse[]; totalCount: number }> {
    const { limit = 20, offset = 0, email } = query || {};
    
    const response = await clerkClient.invitations.getInvitationList({
      status: 'pending' as const,
      limit: Math.min(limit, 100), // Clerk max limit is 100
      offset,
    });
    
    let filteredData = response.data;
    
    // Client-side filtering by email if provided (Clerk doesn't support server-side email filtering)
    if (email) {
      const emailLower = email.toLowerCase();
      filteredData = response.data.filter((invitation: any) => 
        invitation.emailAddress.toLowerCase().includes(emailLower)
      );
    }
    
    const invitations = filteredData.map((invitation: any): InvitationResponse => ({
      id: invitation.id,
      emailAddress: invitation.emailAddress,
      status: invitation.status,
      publicMetadata: invitation.publicMetadata || {},
      createdAt: invitation.createdAt,
      updatedAt: invitation.updatedAt,
    }));
    
    return {
      invitations,
      totalCount: email ? filteredData.length : response.totalCount
    };
  }

  /**
   * Resend a pending invitation
   */
  async resendInvitation(invitationId: string): Promise<{ newInvitationId: string; emailAddress: string }> {
    // Get the existing invitation details
    const invitations = await clerkClient.invitations.getInvitationList({
      status: 'pending' as const,
    });
    
    const invitation = invitations.data.find((inv: any) => inv.id === invitationId);
    if (!invitation) {
      throw new Error('Invitation not found or already accepted');
    }

    // Revoke the old invitation
    await clerkClient.invitations.revokeInvitation(invitationId);

    // Create a new invitation with the same details
    const newInvitation = await clerkClient.invitations.createInvitation({
      emailAddress: invitation.emailAddress,
      redirectUrl: process.env['CLERK_REDIRECT_URL'],
      publicMetadata: invitation.publicMetadata || {},
    });

    return {
      newInvitationId: newInvitation.id,
      emailAddress: invitation.emailAddress,
    };
  }
}
