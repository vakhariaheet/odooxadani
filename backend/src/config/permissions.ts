import { AccessControl } from 'accesscontrol';

/**
 * RBAC Configuration for Team Hackathon Matcher & Idea Validator
 *
 * Four roles:
 * - participant: Can manage own profile, ideas, votes, and teams
 * - organizer: Can moderate content, manage teams, and view analytics
 * - judge: Can score ideas and view participant profiles
 * - admin: Full access to all modules and resources
 *
 * Actions follow accesscontrol naming convention:
 * - *Own: Can only perform action on own resources
 * - *Any: Can perform action on any resource
 */

// Define module access permissions for each role
const ROLE_MODULE_ACCESS: Record<string, Record<string, { any: string[]; own: string[] }>> = {
  participant: {
    profiles: { any: ['read'], own: ['read', 'update'] },
    ideas: { any: ['read'], own: ['create', 'read', 'update', 'delete'] },
    votes: { any: [], own: ['create', 'read', 'delete'] },
    teams: { any: ['read'], own: ['create', 'read', 'update', 'delete'] },
    notifications: { any: [], own: ['read', 'update'] },
    websocket: { any: ['read', 'update'], own: [] },
  },
  organizer: {
    profiles: { any: ['read', 'update'], own: [] },
    ideas: { any: ['read', 'update', 'delete'], own: [] },
    votes: { any: ['read'], own: [] },
    teams: { any: ['read', 'update'], own: [] },
    notifications: { any: ['create', 'read', 'update'], own: [] },
    moderation: { any: ['create', 'read', 'update', 'delete'], own: [] },
    analytics: { any: ['read'], own: [] },
    websocket: { any: ['create', 'read', 'update', 'delete'], own: [] },
  },
  judge: {
    profiles: { any: ['read'], own: ['read', 'update'] },
    ideas: { any: ['read'], own: [] },
    votes: { any: [], own: [] },
    teams: { any: ['read'], own: [] },
    scoring: { any: ['create', 'read', 'update'], own: [] },
    notifications: { any: [], own: ['read', 'update'] },
    websocket: { any: ['read', 'update'], own: [] },
  },
  admin: {
    profiles: { any: ['create', 'read', 'update', 'delete'], own: [] },
    ideas: { any: ['create', 'read', 'update', 'delete'], own: [] },
    votes: { any: ['create', 'read', 'update', 'delete'], own: [] },
    teams: { any: ['create', 'read', 'update', 'delete'], own: [] },
    notifications: { any: ['create', 'read', 'update', 'delete'], own: [] },
    moderation: { any: ['create', 'read', 'update', 'delete'], own: [] },
    scoring: { any: ['create', 'read', 'update', 'delete'], own: [] },
    analytics: { any: ['create', 'read', 'update', 'delete'], own: [] },
    websocket: { any: ['create', 'read', 'update', 'delete'], own: [] },
  },
};

// All available modules in the system
const ALL_MODULES = [
  'profiles',
  'ideas',
  'votes',
  'teams',
  'notifications',
  'moderation',
  'scoring',
  'analytics',
  'websocket',
];

// All CRUD actions
const ALL_ACTIONS = ['create', 'read', 'update', 'delete'] as const;

/**
 * Create and configure the AccessControl instance
 */
const createAccessControl = (): AccessControl => {
  const ac = new AccessControl();

  Object.entries(ROLE_MODULE_ACCESS).forEach(([role, modules]) => {
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
export type Role = 'participant' | 'organizer' | 'judge' | 'admin';
export type Action = (typeof ALL_ACTIONS)[number];
export type ModuleName = (typeof ALL_MODULES)[number];

/**
 * Get all available roles in the system
 */
export const getAvailableRoles = (): string[] => {
  return Object.keys(ROLE_MODULE_ACCESS);
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
