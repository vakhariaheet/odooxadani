import { AccessControl } from 'accesscontrol';

/**
 * RBAC Configuration for Freelancer Invoice & Contract Generator
 *
 * Three roles:
 * - freelancer: Can manage own proposals, invoices, and clients
 * - client: Can view proposals/invoices sent to them, sign contracts
 * - admin: Full access to all modules and resources
 *
 * Actions follow accesscontrol naming convention:
 * - *Own: Can only perform action on own resources
 * - *Any: Can perform action on any resource
 */

// Define module access permissions per role
const ROLE_MODULE_ACCESS: Record<string, Record<string, { any: string[]; own: string[] }>> = {
  freelancer: {
    users: {
      any: [], // Cannot manage other users
      own: ['read', 'update'], // Can read and update own profile
    },
    proposals: {
      any: [], // Cannot access other freelancers' proposals
      own: ['create', 'read', 'update', 'delete'], // Full control over own proposals
    },
    contracts: {
      any: [], // Cannot access other freelancers' contracts
      own: ['create', 'read', 'update', 'delete'], // Full control over own contracts
    },
    invoices: {
      any: [], // Cannot access other freelancers' invoices
      own: ['create', 'read', 'update', 'delete'], // Full control over own invoices
    },
    clients: {
      any: [], // Cannot access other freelancers' clients
      own: ['create', 'read', 'update', 'delete'], // Full control over own clients
    },
    payments: {
      any: [], // Cannot access other freelancers' payments
      own: ['read', 'update'], // Can view and update payment status
    },
    templates: {
      any: ['read'], // Can view public templates
      own: ['create', 'read', 'update', 'delete'], // Full control over own templates
    },
    notifications: {
      any: [],
      own: ['read', 'update'], // Can read and mark own notifications
    },
    demo: {
      any: ['read'], // Can access demo endpoints
      own: [],
    },
    websocket: {
      any: ['read', 'update'], // Can connect and send messages
      own: [],
    },
  },
  client: {
    users: {
      any: [],
      own: ['read', 'update'], // Can read and update own profile
    },
    proposals: {
      any: [], // Cannot create proposals
      own: ['read'], // Can view proposals sent to them
    },
    contracts: {
      any: [],
      own: ['read', 'update'], // Can view and sign contracts sent to them
    },
    invoices: {
      any: [],
      own: ['read'], // Can view invoices sent to them
    },
    clients: {
      any: [],
      own: ['read'], // Can view own client profile
    },
    payments: {
      any: [],
      own: ['read', 'create'], // Can view invoices and make payments
    },
    templates: {
      any: [], // Cannot access templates
      own: [],
    },
    notifications: {
      any: [],
      own: ['read', 'update'], // Can read and mark own notifications
    },
    demo: {
      any: ['read'],
      own: [],
    },
    websocket: {
      any: ['read', 'update'],
      own: [],
    },
  },
  admin: {
    users: {
      any: ['create', 'read', 'update', 'delete'],
      own: [],
    },
    proposals: {
      any: ['create', 'read', 'update', 'delete'],
      own: [],
    },
    contracts: {
      any: ['create', 'read', 'update', 'delete'],
      own: [],
    },
    invoices: {
      any: ['create', 'read', 'update', 'delete'],
      own: [],
    },
    clients: {
      any: ['create', 'read', 'update', 'delete'],
      own: [],
    },
    payments: {
      any: ['create', 'read', 'update', 'delete'],
      own: [],
    },
    templates: {
      any: ['create', 'read', 'update', 'delete'],
      own: [],
    },
    notifications: {
      any: ['create', 'read', 'update', 'delete'],
      own: [],
    },
    demo: {
      any: ['create', 'read', 'update', 'delete'],
      own: [],
    },
    admin: {
      any: ['create', 'read', 'update', 'delete'],
      own: [],
    },
    websocket: {
      any: ['create', 'read', 'update', 'delete'],
      own: [],
    },
  },
};

// All available modules in the system
const ALL_MODULES = [
  'users',
  'proposals',
  'contracts',
  'invoices',
  'clients',
  'payments',
  'templates',
  'notifications',
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
export type Role = keyof typeof ROLE_MODULE_ACCESS;
export type Action = (typeof ALL_ACTIONS)[number];
export type ModuleName = (typeof ALL_MODULES)[number];

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
