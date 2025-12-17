# Coding Guidelines

Comprehensive coding standards and best practices for the Odoo Xadani project.

## Table of Contents

- [General Principles](#general-principles)
- [TypeScript Standards](#typescript-standards)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Code Style](#code-style)
- [Testing](#testing)
- [Error Handling](#error-handling)
- [Security](#security)
- [Performance](#performance)
- [Documentation](#documentation)

## General Principles

### Clean Code

- Write code that is self-documenting and easy to understand
- Follow SOLID principles
- Keep functions small and focused (single responsibility)
- Use meaningful names for variables, functions, and classes
- Avoid magic numbers and strings - use constants
- DRY (Don't Repeat Yourself) - extract common logic

### Code Organization

- Group related functionality into modules
- Keep files focused and under 300 lines when possible
- Use barrel exports (`index.ts`) for cleaner imports
- Separate concerns: handlers, services, types, utilities

## TypeScript Standards

### Type Safety

**Always use strict TypeScript:**

```typescript
// ✅ Good - Explicit types
interface UserData {
  id: string;
  email: string;
  role: UserRole;
}

function createUser(data: UserData): Promise<User> {
  // Implementation
}

// ❌ Bad - Using any
function createUser(data: any): any {
  // Implementation
}
```

**Avoid `any` type:**

```typescript
// ✅ Good - Use unknown for truly unknown types
function processData(data: unknown): void {
  if (typeof data === 'string') {
    // Type narrowing
  }
}

// ✅ Good - Use generics
function wrapResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

// ❌ Bad
function processData(data: any): void {
  // No type safety
}
```

### Interfaces vs Types

**Use interfaces for object shapes:**

```typescript
// ✅ Good - Interface for objects
interface User {
  id: string;
  email: string;
  role: UserRole;
}

// ✅ Good - Type for unions and primitives
type UserRole = 'admin' | 'user';
type ID = string | number;
```

### Enums

**Use enums for fixed sets of values:**

```typescript
// ✅ Good - String enum
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

// ✅ Good - Const enum for better tree-shaking
export const enum HttpStatus {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
}
```

### Null Safety

**Handle null/undefined explicitly:**

```typescript
// ✅ Good - Optional chaining and nullish coalescing
const email = user?.emailAddresses?.[0]?.email ?? 'no-email@example.com';

// ✅ Good - Type guards
function isValidUser(user: User | null): user is User {
  return user !== null && user.id !== undefined;
}

if (isValidUser(user)) {
  // TypeScript knows user is not null here
  console.log(user.id);
}

// ❌ Bad - Unsafe access
const email = user.emailAddresses[0].email;
```

## Backend Architecture

### Module Structure

Follow this structure for all backend modules:

```
backend/src/modules/[module-name]/
├── handlers/           # Lambda handlers (thin layer)
│   ├── createUser.ts
│   └── listUsers.ts
├── services/          # Business logic (thick layer)
│   └── UserService.ts
├── types.ts           # Type definitions
└── functions/         # Serverless function configs
    ├── createUser.yml
    └── listUsers.yml
```

### Handlers (Thin Layer)

**Handlers should be thin - only handle HTTP concerns:**

```typescript
// ✅ Good - Thin handler
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { UserService } from '../services/UserService';
import { successResponse, handleAsyncError } from '@shared/response';
import { AuthenticatedAPIGatewayEvent } from '@shared/types';
import { withRbac } from '@shared/auth/rbacMiddleware';

const userService = new UserService();

/**
 * Base handler for creating a user
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    // 1. Parse and validate input
    const body = JSON.parse(event.body || '{}');

    // 2. Call service layer
    const user = await userService.createUser(body);

    // 3. Return response
    return successResponse(user, 201);
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * Create user handler - Admin only
 *
 * @route POST /api/admin/users
 */
export const handler = withRbac(baseHandler, 'users', 'create');
```

**Handler responsibilities:**

- Parse request (body, query params, path params)
- Basic validation
- Call service layer
- Format response
- Handle errors

**Handler should NOT:**

- Contain business logic
- Make direct database calls
- Make direct API calls to external services

### Services (Thick Layer)

**Services contain all business logic:**

```typescript
// ✅ Good - Service with business logic
export class UserService {
  private clerkClient: ReturnType<typeof createClerkClient>;

  constructor() {
    this.clerkClient = createClerkClient({
      secretKey: process.env['CLERK_SECRET_KEY']!,
    });
  }

  /**
   * Create a new user with validation
   */
  async createUser(data: CreateUserInput): Promise<UserResponse> {
    // 1. Validate business rules
    this.validateUserData(data);

    // 2. Check for duplicates
    const existing = await this.findUserByEmail(data.email);
    if (existing) {
      throw new Error('User already exists');
    }

    // 3. Create user
    const user = await this.clerkClient.users.createUser({
      emailAddress: [data.email],
      firstName: data.firstName,
      lastName: data.lastName,
    });

    // 4. Map to response
    return this.mapToUserResponse(user);
  }

  /**
   * Validate user data
   */
  private validateUserData(data: CreateUserInput): void {
    if (!data.email || !this.isValidEmail(data.email)) {
      throw new Error('Invalid email address');
    }

    if (!data.firstName || data.firstName.length < 2) {
      throw new Error('First name must be at least 2 characters');
    }
  }

  /**
   * Check if email is valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Map Clerk user to our response format
   */
  private mapToUserResponse(user: any): UserResponse {
    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.publicMetadata?.['role'] || UserRole.USER,
      createdAt: user.createdAt,
    };
  }
}
```

**Service responsibilities:**

- Business logic and validation
- Data transformation
- External API calls
- Database operations
- Complex calculations

### Response Handling

**Always use standard response helpers:**

```typescript
// ✅ Good - Use response helpers
import { successResponse, commonErrors, handleAsyncError } from '@shared/response';

// Success response
return successResponse(data);
return successResponse(data, 201); // Created

// Error responses
return commonErrors.badRequest('Invalid input');
return commonErrors.unauthorized();
return commonErrors.forbidden();
return commonErrors.notFound('User');
return commonErrors.conflict('Email already exists');

// Catch-all error handler
try {
  // Your code
} catch (error) {
  return handleAsyncError(error);
}
```

### Authentication & Authorization

**Use RBAC middleware for protected routes:**

```typescript
// ✅ Good - RBAC middleware
import { withRbac } from '@shared/auth/rbacMiddleware';

const baseHandler = async (event: AuthenticatedAPIGatewayEvent) => {
  // Handler logic
  // event.user is guaranteed to exist and have required permissions
};

// Wrap with RBAC
export const handler = withRbac(baseHandler, 'users', 'create');
```

**Available RBAC actions:**

- `create` - Create new resources
- `read` - Read/view resources
- `update` - Update existing resources
- `delete` - Delete resources

### Environment Variables

**Always validate required environment variables:**

```typescript
// ✅ Good - Validate at startup
const requiredEnvVars = ['CLERK_SECRET_KEY', 'AWS_REGION', 'DYNAMODB_TABLE'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// ✅ Good - Use with non-null assertion after validation
const clerkClient = createClerkClient({
  secretKey: process.env['CLERK_SECRET_KEY']!,
});

// ❌ Bad - No validation
const apiKey = process.env['API_KEY'];
```

## Frontend Architecture

### Component Structure

**Organize components by feature:**

```
client/src/
├── components/
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   └── card.tsx
│   ├── admin/           # Admin-specific components
│   │   ├── UserList.tsx
│   │   └── UserInvite.tsx
│   └── shared/          # Shared components
│       └── Header.tsx
├── pages/               # Route pages
│   ├── DashboardPage.tsx
│   └── AdminPage.tsx
├── hooks/               # Custom hooks
│   ├── useApi.ts
│   └── useAuth.ts
├── services/            # API clients
│   └── apiClient.ts
└── utils/               # Utilities
    └── formatters.ts
```

### Component Best Practices

**Keep components focused and small:**

```typescript
// ✅ Good - Small, focused component
interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.firstName} {user.lastName}</CardTitle>
        <CardDescription>{user.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <Badge>{user.role}</Badge>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onEdit(user)}>Edit</Button>
        <Button variant="destructive" onClick={() => onDelete(user.id)}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

// ❌ Bad - Too many responsibilities
export function UserManagement() {
  // Fetching, filtering, sorting, editing, deleting all in one component
  // 500+ lines of code
}
```

### Custom Hooks

**Extract reusable logic into hooks:**

```typescript
// ✅ Good - Custom hook for API calls
export function useUsers() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiClient.get('/api/admin/users');
      return response.data;
    },
  });

  return {
    users: data?.users || [],
    totalCount: data?.totalCount || 0,
    isLoading,
    error,
    refetch,
  };
}

// Usage in component
function UserList() {
  const { users, isLoading, error } = useUsers();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {users.map(user => <UserCard key={user.id} user={user} />)}
    </div>
  );
}
```

### State Management

**Use React Query for server state:**

```typescript
// ✅ Good - React Query for server state
const { data, isLoading } = useQuery({
  queryKey: ['users', filters],
  queryFn: () => fetchUsers(filters),
});

const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});

// ✅ Good - useState for local UI state
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedUser, setSelectedUser] = useState<User | null>(null);
```

### API Client

**Centralize API calls:**

```typescript
// ✅ Good - Centralized API client
import { useAuth } from '@clerk/clerk-react';

class ApiClient {
  private baseURL: string;
  private getToken: () => Promise<string | null>;

  constructor(baseURL: string, getToken: () => Promise<string | null>) {
    this.baseURL = baseURL;
    this.getToken = getToken;
  }

  async get<T>(path: string): Promise<T> {
    const token = await this.getToken();
    const response = await fetch(`${this.baseURL}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }

  async post<T>(path: string, data: any): Promise<T> {
    const token = await this.getToken();
    const response = await fetch(`${this.baseURL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient(import.meta.env.VITE_API_URL, async () => {
  // Get token from Clerk
  return null; // Implement token retrieval
});
```

## Code Style

### Formatting

**Use Prettier for consistent formatting:**

- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- 100 character line length
- Trailing commas in ES5 (objects, arrays)

```typescript
// ✅ Good - Follows Prettier config
const user = {
  id: '123',
  email: 'user@example.com',
  role: UserRole.USER,
};

// ❌ Bad - Inconsistent formatting
const user = {
  id: '123',
  email: 'user@example.com',
  role: UserRole.USER,
};
```

### Naming Conventions

**Variables and functions - camelCase:**

```typescript
const userName = 'John';
function getUserById(id: string) {}
```

**Classes and interfaces - PascalCase:**

```typescript
class UserService {}
interface UserResponse {}
```

**Constants - UPPER_SNAKE_CASE:**

```typescript
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';
```

**Private class members - prefix with underscore:**

```typescript
class UserService {
  private _cache: Map<string, User>;

  private _validateEmail(email: string): boolean {
    // Implementation
  }
}
```

**Boolean variables - use is/has/should prefix:**

```typescript
const isLoading = true;
const hasPermission = false;
const shouldRetry = true;
```

### Imports

**Order imports logically:**

```typescript
// 1. External dependencies
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { createClerkClient } from '@clerk/backend';

// 2. Internal shared modules
import { successResponse, handleAsyncError } from '@shared/response';
import { AuthenticatedAPIGatewayEvent } from '@shared/types';

// 3. Local module imports
import { UserService } from '../services/UserService';
import { CreateUserInput } from '../types';

// 4. Type-only imports (if needed)
import type { User } from '../types';
```

### Comments

**Write self-documenting code, use comments for "why" not "what":**

```typescript
// ✅ Good - Explains why
// Retry up to 3 times because the external API is flaky
const MAX_RETRY_ATTEMPTS = 3;

// ✅ Good - JSDoc for public APIs
/**
 * Create a new user with the given data
 *
 * @param data - User creation data
 * @returns Created user
 * @throws {Error} If email already exists
 */
async createUser(data: CreateUserInput): Promise<User> {
  // Implementation
}

// ❌ Bad - States the obvious
// Set the user name to John
const userName = 'John';

// ❌ Bad - Outdated comment
// TODO: Fix this later (from 2 years ago)
```

## Testing

### Test Structure

**Follow AAA pattern (Arrange, Act, Assert):**

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };
      const userService = new UserService();

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
      expect(result.firstName).toBe(userData.firstName);
    });

    it('should throw error when email already exists', async () => {
      // Arrange
      const userData = { email: 'existing@example.com' };
      const userService = new UserService();

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow('User already exists');
    });
  });
});
```

### Test Naming

**Use descriptive test names:**

```typescript
// ✅ Good - Descriptive
it('should return 401 when token is missing', async () => {});
it('should create user with admin role when invoked by admin', async () => {});

// ❌ Bad - Vague
it('works', async () => {});
it('test user creation', async () => {});
```

### Mocking

**Mock external dependencies:**

```typescript
// ✅ Good - Mock external services
jest.mock('@clerk/backend', () => ({
  createClerkClient: jest.fn(() => ({
    users: {
      createUser: jest.fn().mockResolvedValue({
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
      }),
    },
  })),
}));

describe('UserService', () => {
  it('should create user', async () => {
    const service = new UserService();
    const result = await service.createUser({ email: 'test@example.com' });
    expect(result.id).toBe('user_123');
  });
});
```

### Test Coverage

**Aim for high coverage on critical paths:**

- Services: 80%+ coverage
- Handlers: 70%+ coverage
- Utilities: 90%+ coverage
- UI Components: 60%+ coverage (focus on logic, not rendering)

## Error Handling

### Backend Error Handling

**Always handle errors gracefully:**

```typescript
// ✅ Good - Comprehensive error handling
async function createUser(data: CreateUserInput): Promise<User> {
  try {
    // Validate input
    if (!data.email) {
      throw new ValidationError('Email is required');
    }

    // Business logic
    const user = await this.clerkClient.users.createUser(data);
    return this.mapToUserResponse(user);
  } catch (error) {
    // Log error with context
    console.error('[UserService] Failed to create user:', {
      error,
      email: data.email,
    });

    // Re-throw with meaningful message
    if (error instanceof ValidationError) {
      throw error;
    }

    if (error.code === 'email_exists') {
      throw new ConflictError('User with this email already exists');
    }

    throw new Error('Failed to create user');
  }
}
```

**Custom error classes:**

```typescript
// ✅ Good - Custom error classes
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}
```

### Frontend Error Handling

**Handle errors in UI:**

```typescript
// ✅ Good - Error handling in React Query
const { data, error, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});

if (error) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {error.message || 'Failed to load users'}
      </AlertDescription>
    </Alert>
  );
}

// ✅ Good - Error boundaries for unexpected errors
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

## Security

### Input Validation

**Always validate and sanitize input:**

```typescript
// ✅ Good - Validate input
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

function validateUserId(userId: string): boolean {
  // Clerk user IDs start with 'user_'
  return /^user_[a-zA-Z0-9]+$/.test(userId);
}

// ✅ Good - Sanitize input
function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
```

### Authentication

**Never trust client-side data:**

```typescript
// ✅ Good - Verify token on every request
const baseHandler = async (event: AuthenticatedAPIGatewayEvent) => {
  // event.user is verified by middleware
  const userId = event.user.sub;

  // Use verified user ID
  const user = await userService.getUserById(userId);
};

// ❌ Bad - Trust user ID from request body
const baseHandler = async (event: APIGatewayProxyEvent) => {
  const body = JSON.parse(event.body || '{}');
  const userId = body.userId; // Never trust this!
};
```

### Secrets Management

**Never commit secrets:**

```typescript
// ✅ Good - Use environment variables
const apiKey = process.env['API_KEY']!;

// ❌ Bad - Hardcoded secrets
const apiKey = 'sk_live_abc123';

// ✅ Good - .env.example for documentation
// .env.example
CLERK_SECRET_KEY = sk_test_your_key_here;
AWS_REGION = us - east - 1;

// ❌ Bad - Real secrets in .env.example
// .env.example
CLERK_SECRET_KEY = sk_live_real_secret_key;
```

### SQL Injection Prevention

**Use parameterized queries:**

```typescript
// ✅ Good - Parameterized query (DynamoDB)
await dynamoClient.send(
  new GetCommand({
    TableName: 'Users',
    Key: { id: userId }, // Safe - uses parameters
  })
);

// ❌ Bad - String concatenation (if using SQL)
const query = `SELECT * FROM users WHERE id = '${userId}'`; // SQL injection risk!
```

## Performance

### Backend Performance

**Optimize Lambda cold starts:**

```typescript
// ✅ Good - Initialize clients outside handler
const clerkClient = createClerkClient({
  secretKey: process.env['CLERK_SECRET_KEY']!,
});

export const handler = async (event: APIGatewayProxyEvent) => {
  // Use pre-initialized client
  const users = await clerkClient.users.getUserList();
};

// ❌ Bad - Initialize inside handler
export const handler = async (event: APIGatewayProxyEvent) => {
  const clerkClient = createClerkClient({
    secretKey: process.env['CLERK_SECRET_KEY']!,
  });
  const users = await clerkClient.users.getUserList();
};
```

**Use pagination:**

```typescript
// ✅ Good - Paginated query
async listUsers(query: ListUsersQuery): Promise<ListUsersResponse> {
  const { limit = 20, offset = 0 } = query;

  const response = await this.clerkClient.users.getUserList({
    limit: Math.min(limit, 100), // Cap at 100
    offset,
  });

  return {
    users: response.data,
    totalCount: response.totalCount,
  };
}

// ❌ Bad - Fetch all records
async listUsers(): Promise<User[]> {
  const response = await this.clerkClient.users.getUserList({
    limit: 10000, // Too many!
  });
  return response.data;
}
```

### Frontend Performance

**Lazy load routes:**

```typescript
// ✅ Good - Lazy loading
const AdminPage = lazy(() => import('./pages/AdminPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Suspense>
  );
}
```

**Memoize expensive computations:**

```typescript
// ✅ Good - useMemo for expensive calculations
const sortedUsers = useMemo(() => {
  return users.sort((a, b) => a.name.localeCompare(b.name));
}, [users]);

// ✅ Good - useCallback for stable function references
const handleUserClick = useCallback(
  (userId: string) => {
    navigate(`/users/${userId}`);
  },
  [navigate]
);
```

**Debounce user input:**

```typescript
// ✅ Good - Debounce search input
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 300);

useEffect(() => {
  if (debouncedSearch) {
    searchUsers(debouncedSearch);
  }
}, [debouncedSearch]);
```

## Documentation

### Code Documentation

**Document public APIs with JSDoc:**

````typescript
/**
 * Create a new user with the given data
 *
 * @param data - User creation data including email, name, and role
 * @returns Promise resolving to the created user
 * @throws {ValidationError} If input data is invalid
 * @throws {ConflictError} If user with email already exists
 *
 * @example
 * ```typescript
 * const user = await userService.createUser({
 *   email: 'john@example.com',
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   role: UserRole.USER,
 * });
 * ```
 */
async createUser(data: CreateUserInput): Promise<UserResponse> {
  // Implementation
}
````

### README Files

**Every module should have a README:**

````markdown
# User Management Module

Handles user CRUD operations, invitations, and role management.

## Features

- List users with pagination
- Invite new users via email
- Change user roles
- Ban/unban users
- Delete users

## API Endpoints

- `GET /api/admin/users` - List users
- `POST /api/admin/users/invite` - Invite user
- `PUT /api/admin/users/{id}/role` - Change role

## Usage

```typescript
const userService = new UserService();
const users = await userService.listUsers({ limit: 20 });
```
````

## Testing

```bash
npm test -- users
```

````

### Inline Comments

**Use comments sparingly and meaningfully:**
```typescript
// ✅ Good - Explains complex logic
// We need to retry because Clerk's API occasionally returns 429
// when rate limits are hit during bulk operations
const MAX_RETRY_ATTEMPTS = 3;

// ✅ Good - Explains business rule
// Users can only change their own profile, unless they're an admin
if (userId !== requestingUserId && !isAdmin(requestingUser)) {
  throw new ForbiddenError();
}

// ❌ Bad - States the obvious
// Increment counter by 1
counter++;
````

---

## Quick Reference

### File Naming

- Components: `PascalCase.tsx` (e.g., `UserCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Types: `camelCase.ts` or `types.ts`
- Tests: `*.test.ts` or `*.spec.ts`

### Import Aliases

- `@shared/*` - Backend shared modules
- `@modules/*` - Backend feature modules

### Common Patterns

- Handlers: Thin layer, HTTP concerns only
- Services: Thick layer, business logic
- Use RBAC middleware for auth
- Use React Query for server state
- Use standard response helpers
- Always validate input
- Always handle errors
- Write tests for critical paths

---

For more information, see:

- [Contributing Guide](../CONTRIBUTING.md)
- [Backend README](../backend/README.md)
- [Deployment Guide](../backend/DEPLOYMENT.md)
