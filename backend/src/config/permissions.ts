import { AccessControl } from 'accesscontrol';

/**
 * RBAC Configuration using accesscontrol library
 *
 * Four roles with proper separation of concerns:
 * - user: Regular attendees - can browse events/venues, manage own bookings and profile
 * - venue_owner: Venue managers - can manage their venues, view bookings, access analytics
 * - event_organizer: Event creators - can create/manage events, handle event bookings
 * - admin: Full access to all modules and all resources
 *
 * Actions follow accesscontrol naming convention:
 * - *Own: Can only perform action on own resources
 * - *Any: Can perform action on any resource
 */

// Define module access permissions for each role
const ROLE_MODULE_ACCESS: Record<string, Record<string, { any: string[]; own: string[] }>> = {
  user: {
    users: { any: [], own: ['read', 'update'] },
    demo: { any: ['read'], own: [] },
    websocket: { any: ['read', 'update'], own: [] },
    events: { any: ['read'], own: [] }, // Users can only browse events, not create them
    venues: { any: ['read'], own: [] },
    bookings: { any: [], own: ['create', 'read', 'update', 'delete'] }, // Full CRUD on own bookings
    landing: { any: ['read'], own: [] },
  },
  venue_owner: {
    users: { any: [], own: ['read', 'update'] },
    demo: { any: ['read'], own: [] },
    websocket: { any: ['read', 'update'], own: [] },
    events: { any: ['read'], own: [] }, // Can browse events but not create them
    venues: { any: ['read'], own: ['create', 'read', 'update', 'delete'] }, // Full CRUD on own venues
    bookings: { any: ['read', 'update'], own: [] }, // Can view/manage bookings for their venues
    landing: { any: ['read'], own: [] },
    analytics: { any: [], own: ['read'] }, // Analytics for their own venues
  },
  event_organizer: {
    users: { any: [], own: ['read', 'update'] },
    demo: { any: ['read'], own: [] },
    websocket: { any: ['read', 'update'], own: [] },
    events: { any: ['read'], own: ['create', 'read', 'update', 'delete'] }, // Full CRUD on own events
    venues: { any: ['read'], own: [] }, // Can browse venues to book for events
    bookings: { any: [], own: ['create', 'read', 'update', 'delete'] }, // Manage bookings for their events
    landing: { any: ['read'], own: [] },
  },
};

// All available modules in the system (used for admin grants)
const ALL_MODULES = [
  'users',
  'demo',
  'admin',
  'websocket',
  'events',
  'venues',
  'bookings',
  'landing',
  'analytics',
];

// All CRUD actions
const ALL_ACTIONS = ['create', 'read', 'update', 'delete'] as const;

const ROLE_MODULE_ACCESS_WITH_ADMIN: Record<
  string,
  Record<string, { any: string[]; own: string[] }>
> = {
  ...ROLE_MODULE_ACCESS,
  admin: ALL_MODULES.reduce(
    (modules, moduleName) => {
      modules[moduleName] = { any: [...ALL_ACTIONS], own: [] };
      return modules;
    },
    {} as Record<string, { any: string[]; own: string[] }>
  ),
};

/**
 * Create and configure the AccessControl instance
 */
const createAccessControl = (): AccessControl => {
  const ac = new AccessControl();

  Object.entries(ROLE_MODULE_ACCESS_WITH_ADMIN).forEach(([role, modules]) => {
    Object.entries(modules).forEach(([moduleName, permissions]) => {
      permissions.any.forEach((action) => {
        const grantMethod = `${action}Any` as 'createAny' | 'readAny' | 'updateAny' | 'deleteAny';
        ac.grant(role)[grantMethod](moduleName);
      });

      permissions.own.forEach((action) => {
        const grantMethod = `${action}Own` as 'createOwn' | 'readOwn' | 'updateOwn' | 'deleteOwn';
        ac.grant(role)[grantMethod](moduleName);
      });
    });
  });

  return ac;
};

// Export singleton AccessControl instance
export const ac = createAccessControl();

// Export helper types
export type Role = keyof typeof ROLE_MODULE_ACCESS_WITH_ADMIN;
export type Action = (typeof ALL_ACTIONS)[number];
export type ModuleName = (typeof ALL_MODULES)[number];

/**
 * Get all available roles in the system
 */
export const getAvailableRoles = (): string[] => {
  return Object.keys(ROLE_MODULE_ACCESS_WITH_ADMIN);
};

/**
 * Get all available modules in the system
 */
export const getAvailableModules = (): string[] => {
  return [...ALL_MODULES];
};

/**
 * Get all available actions in the system
 */
export const getAvailableActions = (): string[] => {
  return [...ALL_ACTIONS];
};

/**
 * Check if a role has permission to perform an action on a module
 * This is a convenience wrapper around ac.can()
 */
export const hasPermission = (
  role: string,
  action: Action,
  moduleName: string,
  isOwner: boolean = false
): boolean => {
  const permission = isOwner
    ? ac.can(role)[`${action}Own`](moduleName)
    : ac.can(role)[`${action}Any`](moduleName);

  return permission.granted;
};

/**
 * Get all granted permissions for a role
 * Useful for debugging and admin dashboards
 */
export const getRolePermissions = (role: string): Record<string, string[]> => {
  const permissions: Record<string, string[]> = {};

  ALL_MODULES.forEach((moduleName) => {
    const modulePerms: string[] = [];

    ALL_ACTIONS.forEach((action) => {
      if (ac.can(role)[`${action}Any`](moduleName).granted) {
        modulePerms.push(`${action}Any`);
      }
      if (ac.can(role)[`${action}Own`](moduleName).granted) {
        modulePerms.push(`${action}Own`);
      }
    });

    if (modulePerms.length > 0) {
      permissions[moduleName] = modulePerms;
    }
  });

  return permissions;
};
