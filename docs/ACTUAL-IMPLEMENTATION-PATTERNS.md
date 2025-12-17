# Actual Implementation Patterns

This document describes the **actual** implementation patterns used in this project, based on the real codebase.

## Architecture Overview

```
User → Vercel (React + Vite + Clerk)
     → API Gateway v2 (Native JWT Authorizer)
     → Individual Lambda Functions
     → Clerk API (User Management)
     → Optional: S3, SQS, OpenSearch, Gemini
```

**Key Principle:** One Lambda function per API endpoint (no Express app)

## Backend Patterns

### 1. Lambda Handler Structure

Each API endpoint has:

- **Handler file**: `src/modules/[domain]/handlers/[action]Entity.ts`
- **Function config**: `src/modules/[domain]/functions/[action]Entity.yml`

**Example Handler** (`handlers/listUsers.ts`):

```typescript
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { ClerkUserService } from '../services/ClerkUserService';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';

const userService = new ClerkUserService();

const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const query = event.queryStringParameters || {};
    const result = await userService.listUsers(query);
    return successResponse(result);
  } catch (error) {
    return handleAsyncError(error);
  }
};

export const handler = withRbac(baseHandler, 'users', 'read');
```

**Example Function Config** (`functions/listUsers.yml`):

```yaml
listUsers:
  handler: src/modules/users/handlers/listUsers.handler
  events:
    - httpApi:
        path: /api/admin/users
        method: GET
        authorizer:
          name: clerkJwtAuthorizer
```

### 2. RBAC Middleware

Two middleware wrappers for authorization:

**withRbac** - For "Any" permissions (typically admin):

```typescript
export const handler = withRbac(baseHandler, 'users', 'read');
// Checks if user role can readAny('users')
```

**withRbacOwn** - For "Own" permissions (user accessing their own data):

```typescript
export const handler = withRbacOwn(baseHandler, 'profile', 'update');
// Checks if user role can updateOwn('profile')
```

### 3. Response Helpers

Located in `src/shared/response.ts`:

```typescript
// Success response
return successResponse({ data: users, totalCount: 100 });

// Error handling
return handleAsyncError(error);

// Common errors
return commonErrors.badRequest('Invalid input');
return commonErrors.unauthorized('Not authenticated');
return commonErrors.forbidden('No permission');
return commonErrors.notFound('User not found');
```

### 4. Service Layer Pattern

Business logic in service classes (e.g., `ClerkUserService`):

```typescript
class ClerkUserService {
  async listUsers(query: ListUsersQuery): Promise<ListUsersResponse> {
    // Clerk API calls
    const users = await clerkClient.users.getUserList({
      limit: query.limit || 20,
      offset: query.offset || 0,
    });

    return {
      users: users.data.map(this.mapClerkUserToResponse),
      totalCount: users.totalCount,
    };
  }

  async inviteUser(email: string, role: UserRole): Promise<{ invitationId: string }> {
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: { role },
    });

    return { invitationId: invitation.id };
  }
}
```

### 5. Type Safety

Shared types across backend:

```typescript
// src/shared/types.ts
export interface AuthenticatedAPIGatewayEvent extends APIGatewayProxyEventV2 {
  requestContext: {
    authorizer: {
      jwt: {
        claims: {
          sub: string;
          email: string;
          role: string;
        };
      };
    };
  };
}

// src/modules/users/types.ts
export interface ListUsersQuery {
  limit?: number;
  offset?: number;
  orderBy?: 'created_at' | 'updated_at' | 'last_sign_in_at';
}

export interface UserResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  banned: boolean;
  createdAt: number;
}
```

## Frontend Patterns

### 1. Custom Hooks

**useApi Hook** - For API calls with Clerk authentication:

```typescript
import { useApi } from '@/hooks/useApi';

function MyComponent() {
  const { data, loading, error, get, post } = useApi();

  const fetchUsers = async () => {
    try {
      await get('/api/admin/users');
      // data is automatically set
    } catch (err) {
      // error is automatically set
    }
  };

  const inviteUser = async (email: string, role: string) => {
    await post('/api/admin/users/invite', { email, role });
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

**useAsync Hook** - For async operations:

```typescript
import { useAsync } from '@/hooks/useAsync';

function MyComponent() {
  const { data, loading, error, execute } = useAsync(
    async () => {
      const response = await fetch('/api/data');
      return response.json();
    },
    [] // dependencies
  );

  return <div>{loading ? 'Loading...' : JSON.stringify(data)}</div>;
}
```

**useAsyncCallback Hook** - For user-triggered async operations:

```typescript
import { useAsyncCallback } from '@/hooks/useAsync';

function MyComponent() {
  const { loading, error, execute } = useAsyncCallback(
    async (userId: string) => {
      await apiClient.delete(`/api/users/${userId}`);
    }
  );

  return (
    <button onClick={() => execute('user_123')} disabled={loading}>
      {loading ? 'Deleting...' : 'Delete User'}
    </button>
  );
}
```

### 2. API Client

Singleton client with automatic Clerk token injection:

```typescript
import { apiClient } from '@/services/apiClient';
import { useAuth } from '@clerk/clerk-react';

function App() {
  const { getToken } = useAuth();

  useEffect(() => {
    // Set auth provider once at app level
    apiClient.setAuthProvider(getToken);
  }, [getToken]);

  // Now apiClient automatically includes auth token
  const fetchData = async () => {
    const data = await apiClient.get('/api/users');
    return data;
  };
}
```

### 3. Component Patterns

**Admin Dashboard Components** - Modular, reusable:

```typescript
// AdminStats.tsx - Statistics display
<AdminStats stats={stats} isLoading={loading} error={error} />

// UsersTable.tsx - Table with pagination
<UsersTable
  users={users}
  isLoading={loading}
  error={error}
  loadingStates={loadingStates}
  onChangeRole={handleChangeRole}
  onBan={handleBan}
  onUnban={handleUnban}
  onDelete={handleDelete}
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={totalItems}
  itemsPerPage={itemsPerPage}
  onPageChange={setCurrentPage}
/>

// InviteModal.tsx - Modal for inviting users
<InviteModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onInvite={handleInvite}
  isLoading={inviteLoading}
/>
```

### 4. Type Safety

Frontend types matching backend:

```typescript
// types/user.ts
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  role: UserRole;
  banned: boolean;
  createdAt: number;
  updatedAt: number;
  lastSignInAt?: number;
}

export interface AdminStats {
  totalUsers: number;
  usersByRole?: {
    admin?: number;
    user?: number;
  };
  bannedUsers: number;
  activeUsers: number;
}
```

## Deployment Patterns

### 1. Serverless Framework Configuration

**serverless.yml** structure:

```yaml
service: odoo-xadani-backend
provider:
  name: aws
  runtime: nodejs20.x
  region: ap-south-1
  stage: ${opt:stage, 'dev-heet'}

  httpApi:
    cors: true
    authorizers:
      clerkJwtAuthorizer:
        type: jwt
        identitySource: $request.header.Authorization
        issuerUrl: ${env:CLERK_ISSUER_URL}
        audience:
          - ${env:CLERK_AUDIENCE}

functions:
  - ${file(src/modules/users/functions/listUsers.yml)}
  - ${file(src/modules/users/functions/inviteUser.yml)}
  # ... one import per function
```

### 2. Deployment Script

**deploy.sh** handles:

- AWS role assumption (DevRole)
- TypeScript type checking
- Serverless Framework deployment
- Custom domain setup
- Cloudflare DNS updates

```bash
# Deploy to dev environment
./deploy.sh dev-heet

# Deploy to production
./deploy.sh prod

# Skip DNS updates
./deploy.sh dev-heet --skip-dns

# Only update custom domain
./deploy.sh dev-heet --domain-only
```

## Key Differences from Documentation

### What's Different:

1. **No Express App**: Individual Lambda functions, not Express with serverless-express
2. **No DynamoDB**: Using Clerk API for user management (no database needed)
3. **Native JWT Authorizer**: API Gateway v2 handles JWT validation, not custom middleware
4. **Modular Components**: Admin dashboard split into 15+ small components
5. **Custom Hooks**: useApi, useAsync, useAsyncCallback for state management

### What's the Same:

1. **Serverless Framework**: Still using serverless.yml for infrastructure
2. **Clerk Authentication**: Still using Clerk for auth
3. **RBAC**: Still using accesscontrol library with custom middleware
4. **shadcn/ui**: Still using shadcn components
5. **TypeScript**: Full type safety across frontend and backend

## AI Prompting Guidelines

### For Backend Development:

```
Create a TypeScript Lambda handler for [functionality]:
- File: src/modules/[domain]/handlers/[action]Entity.ts
- Export handler wrapped with withRbac(baseHandler, 'module', 'action')
- Use AuthenticatedAPIGatewayEvent type
- Return successResponse() or handleAsyncError()
- Include corresponding YAML in functions/[action]Entity.yml

Also create the function YAML config:
- Path: /api/[domain]/[entity]
- Method: [GET/POST/PUT/DELETE]
- Include clerkJwtAuthorizer
```

### For Frontend Development:

```
Create a React component for [functionality]:
- Use shadcn/ui components (Button, Card, Table, Dialog)
- Use useApi hook for API calls with loading/error states
- Include TypeScript types matching backend
- Handle loading, error, and success states
- Make it responsive and accessible
```

### For Service Layer:

```
Create a TypeScript service class for [domain]:
- Use Clerk API via @clerk/backend
- Include methods for [list of operations]
- Return typed responses matching types.ts
- Handle errors with proper error messages
- Include JSDoc comments
```

## Common Patterns Summary

| Pattern              | Location                        | Purpose                         |
| -------------------- | ------------------------------- | ------------------------------- |
| `withRbac()`         | `shared/auth/rbacMiddleware.ts` | Wrap handlers for authorization |
| `successResponse()`  | `shared/response.ts`            | Return success responses        |
| `handleAsyncError()` | `shared/response.ts`            | Handle errors consistently      |
| `useApi()`           | `hooks/useApi.ts`               | API calls with auth             |
| `useAsync()`         | `hooks/useAsync.ts`             | Async operations                |
| `apiClient`          | `services/apiClient.ts`         | Singleton API client            |
| `ClerkUserService`   | `modules/users/services/`       | User management via Clerk       |
| Individual YAMLs     | `modules/*/functions/`          | One config per endpoint         |

## File Structure Quick Reference

```
backend/
├── serverless.yml                    # Main config
├── deploy.sh                         # Deployment script
└── src/
    ├── shared/
    │   ├── types.ts                  # Shared types
    │   ├── response.ts               # Response helpers
    │   └── auth/rbacMiddleware.ts    # RBAC wrappers
    └── modules/
        └── [domain]/
            ├── handlers/             # Lambda functions
            ├── functions/            # YAML configs
            ├── services/             # Business logic
            └── types.ts              # Domain types

client/
└── src/
    ├── hooks/
    │   ├── useApi.ts                 # API hook
    │   ├── useAsync.ts               # Async hook
    │   └── useLocalStorage.ts        # Storage hook
    ├── services/
    │   └── apiClient.ts              # API client
    ├── components/
    │   ├── ui/                       # shadcn components
    │   └── admin/                    # Admin components
    └── types/
        └── user.ts                   # User types
```

This document reflects the **actual implementation** as of the current codebase state.
