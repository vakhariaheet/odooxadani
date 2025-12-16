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

// Define module access permissions for the 'user' role
// This makes it easy to see at a glance what each role can do per module
const USER_MODULE_ACCESS: Record<string, { any: string[]; own: string[] }> = {
  users: {
    any: [],                      // Cannot list all users or access other profiles
    own: ['read', 'update']       // Can read and update own profile only
  },
  demo: {
    any: ['read'],                // Can access demo endpoints (for testing)
    own: []
  },
  websocket: {
    any: ['read', 'update'],      // Can connect and send messages via WebSocket
    own: []
  }
};

// All available modules in the system (used for admin grants)
const ALL_MODULES = ['users', 'demo', 'admin', 'websocket'];

// All CRUD actions
const ALL_ACTIONS = ['create', 'read', 'update', 'delete'] as const;

/**
 * Create and configure the AccessControl instance
 */
const createAccessControl = (): AccessControl => {
  const ac = new AccessControl();

  // =============================================================
  // USER ROLE GRANTS
  // =============================================================
  // Programmatically generate grants from USER_MODULE_ACCESS config
  Object.entries(USER_MODULE_ACCESS).forEach(([moduleName, permissions]) => {
    // Grant 'Any' permissions (can access any resource)
    permissions.any.forEach((action) => {
      const grantMethod = `${action}Any` as 'createAny' | 'readAny' | 'updateAny' | 'deleteAny';
      ac.grant('user')[grantMethod](moduleName);
    });

    // Grant 'Own' permissions (can only access own resources)
    permissions.own.forEach((action) => {
      const grantMethod = `${action}Own` as 'createOwn' | 'readOwn' | 'updateOwn' | 'deleteOwn';
      ac.grant('user')[grantMethod](moduleName);
    });
  });

  // =============================================================
  // ADMIN ROLE GRANTS
  // =============================================================
  // Admin gets full access to all modules with all CRUD actions as *Any
  ALL_MODULES.forEach((moduleName) => {
    ALL_ACTIONS.forEach((action) => {
      const grantMethod = `${action}Any` as 'createAny' | 'readAny' | 'updateAny' | 'deleteAny';
      ac.grant('admin')[grantMethod](moduleName);
    });
  });

  return ac;
};

// Export singleton AccessControl instance
export const ac = createAccessControl();

// Export helper types
export type Role = 'user' | 'admin';
export type Action = typeof ALL_ACTIONS[number];
export type ModuleName = keyof typeof USER_MODULE_ACCESS | 'admin';

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
