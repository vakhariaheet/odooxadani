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

// Define module access permissions for each role
const ROLE_MODULE_ACCESS: Record<string, Record<string, { any: string[]; own: string[] }>> = {
  freelancer: {
    users: { any: [], own: ['read', 'update'] },
    proposals: { any: [], own: ['create', 'read', 'update', 'delete'] },
    contracts: { any: [], own: ['read', 'update'] }, // Can update for signatures
    invoices: { any: [], own: ['create', 'read', 'update'] },
    payments: { any: [], own: ['read'] }, // Read-only payment status
    templates: { any: ['read'], own: ['create', 'read', 'update', 'delete'] },
    websocket: { any: ['read', 'update'], own: [] },
  },
  client: {
    users: { any: [], own: ['read', 'update'] },
    proposals: { any: [], own: ['read'] }, // Can view proposals sent to them
    contracts: { any: [], own: ['read', 'update'] }, // Can sign contracts
    invoices: { any: [], own: ['read'] }, // Can view invoices
    payments: { any: [], own: ['create', 'read'] }, // Can make payments
    websocket: { any: ['read', 'update'], own: [] },
  },
  admin: {
    users: { any: ['create', 'read', 'update', 'delete'], own: [] },
    proposals: { any: ['create', 'read', 'update', 'delete'], own: [] },
    contracts: { any: ['create', 'read', 'update', 'delete'], own: [] },
    invoices: { any: ['create', 'read', 'update', 'delete'], own: [] },
    payments: { any: ['create', 'read', 'update', 'delete'], own: [] },
    templates: { any: ['create', 'read', 'update', 'delete'], own: [] },
    analytics: { any: ['read'], own: [] },
    demo: { any: ['create', 'read', 'update', 'delete'], own: [] },
    websocket: { any: ['create', 'read', 'update', 'delete'], own: [] },
  },
};

// All available modules in the system
const ALL_MODULES = [
  'users',
  'proposals',
  'contracts',
  'invoices',
  'payments',
  'templates',
  'analytics',
  'demo',
  'admin',
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
export type Role = 'freelancer' | 'client' | 'admin';
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
