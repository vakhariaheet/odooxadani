import { useUser } from '@clerk/clerk-react';

/**
 * Hook to check user permissions based on roles
 */
export function usePermissions() {
  const { user } = useUser();

  // Get user roles from Clerk public metadata
  // Support both 'role' (singular) and 'roles' (array) for flexibility
  const userRole = user?.publicMetadata?.role as string;
  const userRoles = (user?.publicMetadata?.roles as string[]) || (userRole ? [userRole] : []);
  const primaryRole = userRoles[0] || 'user';

  /**
   * Check if user has permission to perform an action on a resource
   */
  const hasPermission = (action: string, resource: string, isOwner: boolean = false): boolean => {
    // Admin has all permissions
    if (userRoles.includes('admin')) {
      return true;
    }

    // Define role-based permissions
    const permissions: Record<string, Record<string, { any: string[]; own: string[] }>> = {
      user: {
        venues: { any: ['read'], own: [] },
        bookings: { any: [], own: ['create', 'read', 'update', 'delete'] },
      },
      venue_owner: {
        venues: { any: ['read'], own: ['create', 'read', 'update', 'delete'] },
        bookings: { any: ['read', 'update'], own: [] },
      },
      event_organizer: {
        venues: { any: ['read'], own: [] },
        bookings: { any: [], own: ['create', 'read', 'update', 'delete'] },
      },
    };

    const rolePermissions = permissions[primaryRole];
    if (!rolePermissions || !rolePermissions[resource]) {
      return false;
    }

    const resourcePermissions = rolePermissions[resource];

    if (isOwner && resourcePermissions.own.includes(action)) {
      return true;
    }

    if (resourcePermissions.any.includes(action)) {
      return true;
    }

    return false;
  };

  /**
   * Check if user can edit venues (either any venue or own venues)
   */
  const canEditVenues = (isOwner: boolean = false): boolean => {
    return hasPermission('update', 'venues', isOwner);
  };

  /**
   * Check if user can delete venues (either any venue or own venues)
   */
  const canDeleteVenues = (isOwner: boolean = false): boolean => {
    return hasPermission('delete', 'venues', isOwner);
  };

  /**
   * Check if user can create venues
   */
  const canCreateVenues = (): boolean => {
    return hasPermission('create', 'venues', true); // venue creation is always "own"
  };

  /**
   * Check if user is a venue owner
   */
  const isVenueOwner = (): boolean => {
    return userRoles.includes('venue_owner');
  };

  /**
   * Check if user is an admin
   */
  const isAdmin = (): boolean => {
    return userRoles.includes('admin');
  };

  /**
   * Get current user ID
   */
  const getCurrentUserId = (): string | undefined => {
    return user?.id;
  };

  return {
    userRoles,
    primaryRole,
    hasPermission,
    canEditVenues,
    canDeleteVenues,
    canCreateVenues,
    isVenueOwner,
    isAdmin,
    getCurrentUserId,
  };
}
