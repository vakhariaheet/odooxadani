import { AccessControl } from 'accesscontrol';

/**
 * RBAC Configuration using accesscontrol library
 *
 * Two roles:
 * - user: Can only access own resources in users module, read-only access to demo
 * - admin: Full access to all modules and all resources
 *
 * Actions follow accesscontrol naming convention:
 * - *Own: Can only perform action on own resources
 * - *Any: Can perform action on any resource
 */

// All available modules in the system (used for admin grants)
const ALL_MODULES = [
  'users',
  'ideas',
  'teams',
  'events',
  'analytics',
  'judging',
  'landing',
  'admin',
  'demo',
  'websocket',
];

// All CRUD actions
const ALL_ACTIONS = ['create', 'read', 'update', 'delete'] as const;

const ROLE_MODULE_ACCESS: Record<string, Record<string, { any: string[]; own: string[] }>> = {
  participant: {
    users: { any: [], own: ['read', 'update'] },
    ideas: { any: ['read'], own: ['create', 'read', 'update', 'delete'] },
    teams: { any: ['read'], own: ['create', 'read', 'update', 'delete'] },
    landing: { any: ['read'], own: [] },
    demo: { any: ['read'], own: [] },
    websocket: { any: ['read', 'update'], own: [] },
  },
  organizer: {
    users: { any: ['read'], own: ['read', 'update'] },
    ideas: { any: ['read', 'update', 'delete'], own: [] }, // Can moderate ideas
    teams: { any: ['read'], own: [] },
    events: { any: ['create', 'read', 'update', 'delete'], own: [] },
    analytics: { any: ['read'], own: [] },
    landing: { any: ['read'], own: [] },
    demo: { any: ['read'], own: [] },
    websocket: { any: ['read', 'update'], own: [] },
  },
  judge: {
    users: { any: [], own: ['read', 'update'] },
    ideas: { any: ['read', 'update'], own: [] }, // Can score and provide feedback
    teams: { any: ['read'], own: [] },
    judging: { any: ['create', 'read', 'update'], own: [] },
    landing: { any: ['read'], own: [] },
    demo: { any: ['read'], own: [] },
    websocket: { any: ['read', 'update'], own: [] },
  },
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
export type Role = keyof typeof ROLE_MODULE_ACCESS;
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
