# CRITICAL: RBAC Setup - DO THIS FIRST

## ⚠️ BEFORE IMPLEMENTING ANY MODULE

**This MUST be the very first thing you do before any module implementation begins!**

## Step 1: Update `backend/src/config/permissions.ts`

Replace the existing `permissions.ts` file with the following updated version that includes all 4 user roles:

```typescript
import { AccessControl } from 'accesscontrol';

/**
 * RBAC Configuration for Inclusive Virtual Classroom
 *
 * Four roles:
 * - admin: Platform administrators, full access
 * - teacher: Educators creating classes and content
 * - student: Learners accessing educational content
 * - parent: Guardians monitoring child progress
 */

// Define module access permissions for each role
const USER_MODULE_ACCESS: Record<string, { any: string[]; own: string[] }> = {
  // User management (from template)
  users: {
    any: [],
    own: ['read', 'update'],
  },

  // Demo module (from template)
  demo: {
    any: ['read'],
    own: [],
  },

  // WebSocket (from template)
  websocket: {
    any: ['read', 'update'],
    own: [],
  },

  // Class Management (F01)
  classes: {
    any: [],
    own: [],
  },

  // Content Library (F02)
  content: {
    any: [],
    own: [],
  },

  // Live Sessions (F03)
  sessions: {
    any: [],
    own: [],
  },

  // Dashboard (F04)
  dashboard: {
    any: [],
    own: ['read'],
  },

  // Attendance (M05)
  attendance: {
    any: [],
    own: [],
  },
};

// TEACHER-specific module access
const TEACHER_MODULE_ACCESS: Record<string, { any: string[]; own: string[] }> = {
  classes: {
    any: ['read'], // Can browse all classes
    own: ['create', 'update', 'delete'], // Full control over own classes
  },
  content: {
    any: ['read'], // Can view all content
    own: ['create', 'update', 'delete'], // Manage own uploads
  },
  sessions: {
    any: ['read'],
    own: ['create', 'update', 'delete'], // Manage own sessions
  },
  attendance: {
    any: [],
    own: ['create', 'read', 'update'], // Mark attendance for own classes
  },
};

// STUDENT-specific module access
const STUDENT_MODULE_ACCESS: Record<string, { any: string[]; own: string[] }> = {
  classes: {
    any: ['read'], // Browse and join classes
    own: ['update'], // Can leave classes they joined
  },
  content: {
    any: ['read'], // View all content
    own: [],
  },
  sessions: {
    any: ['read'], // View and join sessions
    own: [],
  },
  attendance: {
    any: [],
    own: ['read'], // View own attendance
  },
};

// PARENT-specific module access
const PARENT_MODULE_ACCESS: Record<string, { any: string[]; own: string[] }> = {
  classes: {
    any: ['read'], // View child's classes
    own: [],
  },
  content: {
    any: ['read'], // View learning materials
    own: [],
  },
  sessions: {
    any: ['read'], // View child's sessions
    own: [],
  },
  attendance: {
    any: [],
    own: ['read'], // View child's attendance
  },
  dashboard: {
    any: [],
    own: ['read'], // View parent dashboard
  },
};

// All available modules in the system
const ALL_MODULES = [
  'users',
  'demo',
  'admin',
  'websocket',
  'classes',
  'content',
  'sessions',
  'dashboard',
  'attendance',
];

// All CRUD actions
const ALL_ACTIONS = ['create', 'read', 'update', 'delete'] as const;

/**
 * Create and configure the AccessControl instance
 */
const createAccessControl = (): AccessControl => {
  const ac = new AccessControl();

  // =============================================================
  // BASE USER ROLE GRANTS (for backward compatibility)
  // =============================================================
  Object.entries(USER_MODULE_ACCESS).forEach(([moduleName, permissions]) => {
    permissions.any.forEach((action) => {
      const grantMethod = `${action}Any` as 'createAny' | 'readAny' | 'updateAny' | 'deleteAny';
      ac.grant('user')[grantMethod](moduleName);
    });
    permissions.own.forEach((action) => {
      const grantMethod = `${action}Own` as 'createOwn' | 'readOwn' | 'updateOwn' | 'deleteOwn';
      ac.grant('user')[grantMethod](moduleName);
    });
  });

  // =============================================================
  // TEACHER ROLE GRANTS
  // =============================================================
  // Inherit base user permissions
  ac.grant('teacher').extend('user');

  // Add teacher-specific permissions
  Object.entries(TEACHER_MODULE_ACCESS).forEach(([moduleName, permissions]) => {
    permissions.any.forEach((action) => {
      const grantMethod = `${action}Any` as 'createAny' | 'readAny' | 'updateAny' | 'deleteAny';
      ac.grant('teacher')[grantMethod](moduleName);
    });
    permissions.own.forEach((action) => {
      const grantMethod = `${action}Own` as 'createOwn' | 'readOwn' | 'updateOwn' | 'deleteOwn';
      ac.grant('teacher')[grantMethod](moduleName);
    });
  });

  // =============================================================
  // STUDENT ROLE GRANTS
  // =============================================================
  // Inherit base user permissions
  ac.grant('student').extend('user');

  // Add student-specific permissions
  Object.entries(STUDENT_MODULE_ACCESS).forEach(([moduleName, permissions]) => {
    permissions.any.forEach((action) => {
      const grantMethod = `${action}Any` as 'createAny' | 'readAny' | 'updateAny' | 'deleteAny';
      ac.grant('student')[grantMethod](moduleName);
    });
    permissions.own.forEach((action) => {
      const grantMethod = `${action}Own` as 'createOwn' | 'readOwn' | 'updateOwn' | 'deleteOwn';
      ac.grant('student')[grantMethod](moduleName);
    });
  });

  // =============================================================
  // PARENT ROLE GRANTS
  // =============================================================
  // Parents have limited access - only monitoring
  Object.entries(PARENT_MODULE_ACCESS).forEach(([moduleName, permissions]) => {
    permissions.any.forEach((action) => {
      const grantMethod = `${action}Any` as 'createAny' | 'readAny' | 'updateAny' | 'deleteAny';
      ac.grant('parent')[grantMethod](moduleName);
    });
    permissions.own.forEach((action) => {
      const grantMethod = `${action}Own` as 'createOwn' | 'readOwn' | 'updateOwn' | 'deleteOwn';
      ac.grant('parent')[grantMethod](moduleName);
    });
  });

  // =============================================================
  // ADMIN ROLE GRANTS (Full Access)
  // =============================================================
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
export type Role = 'user' | 'admin' | 'teacher' | 'student' | 'parent';
export type Action = (typeof ALL_ACTIONS)[number];
export type ModuleName = (typeof ALL_MODULES)[number];

/**
 * Check if a role has permission to perform an action on a module
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
```

## Step 2: Verify Clerk Setup

Ensure Clerk user metadata includes the role field:

### In Clerk Dashboard:

1. Go to "Users" → Select a user → "Metadata"
2. Add to `public_metadata`:
   ```json
   {
     "role": "teacher"
   }
   ```

### Possible role values:

- `"admin"` - Platform administrators
- `"teacher"` - Educators
- `"student"` - Learners
- `"parent"` - Guardians

### In Clerk JWT Template:

Ensure the JWT template includes role in claims:

```json
{
  "userId": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "role": "{{user.public_metadata.role}}"
}
```

## Step 3: Test RBAC Setup

Create a simple test to verify permissions work:

```typescript
// Test in Node.js console or Jest
import { ac } from './src/config/permissions';

// Teacher can create classes
console.log(ac.can('teacher').createOwn('classes').granted); // true

// Student can read classes
console.log(ac.can('student').readAny('classes').granted); // true

// Student cannot create classes
console.log(ac.can('student').createAny('classes').granted); // false

// Parent can read dashboard
console.log(ac.can('parent').readOwn('dashboard').granted); // true

// Admin has full access
console.log(ac.can('admin').createAny('classes').granted); // true
console.log(ac.can('admin').deleteAny('users').granted); // true
```

## Why This Is Critical

1. **All modules depend on RBAC** - Every handler uses `withRbac()` middleware
2. **Foundation modules need roles defined** - F01-F04 all check permissions
3. **Type safety** - TypeScript needs `Role` type for all handlers
4. **Security** - Without proper RBAC, unauthorized access possible

## Checklist Before Starting Module Implementation

- [ ] Updated `permissions.ts` with all 4 roles
- [ ] Verified Clerk users have role in public_metadata
- [ ] Tested RBAC permissions programmatically
- [ ] All developers understand role hierarchy
- [ ] JWT template includes role claim

---

**🚨 DO NOT SKIP THIS STEP! All module implementations will fail without proper RBAC setup!**
