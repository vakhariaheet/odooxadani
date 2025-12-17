# Quick Reference Card

Essential commands, patterns, and conventions for daily development.

## 🚀 Getting Started

```bash
# Clone and setup
git clone <repo-url>
cd odooxadani
npm install

# Start development
npm run backend  # Backend dev server
npm run client   # Frontend dev server

# Run tests
npm test

# Deploy
cd backend
./deploy.sh heet  # Your dev stage
```

## 📝 Git Workflow

### Branch Naming

```bash
feat/feature-name       # New feature
fix/bug-name           # Bug fix
docs/doc-name          # Documentation
refactor/refactor-name # Refactoring
test/test-name         # Tests
chore/task-name        # Maintenance
```

### Commit Format

```bash
type(scope): subject

# Examples
feat(users): add user invitation system
fix(websocket): resolve connection timeout
docs(deploy): update deployment guide
refactor(users): extract user service
test(api): add integration tests
chore(deps): update AWS SDK
```

### Common Git Commands

```bash
# Create branch
git checkout -b feat/new-feature

# Commit
git add .
git commit -m "feat(users): add feature"

# Push
git push -u origin feat/new-feature

# Update branch
git fetch origin
git rebase origin/main

# Undo last commit (keep changes)
git reset --soft HEAD~1
```

## 🏗️ Backend Patterns

### Handler Structure

```typescript
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { successResponse, handleAsyncError } from '@shared/response';
import { AuthenticatedAPIGatewayEvent } from '@shared/types';
import { withRbac } from '@shared/auth/rbacMiddleware';

const service = new MyService();

const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    // 1. Parse input
    const body = JSON.parse(event.body || '{}');

    // 2. Call service
    const result = await service.doSomething(body);

    // 3. Return response
    return successResponse(result);
  } catch (error) {
    return handleAsyncError(error);
  }
};

export const handler = withRbac(baseHandler, 'resource', 'action');
```

### Service Structure

```typescript
export class MyService {
  private client: SomeClient;

  constructor() {
    this.client = createClient({
      apiKey: process.env['API_KEY']!,
    });
  }

  async doSomething(input: Input): Promise<Output> {
    // 1. Validate
    this.validate(input);

    // 2. Business logic
    const result = await this.client.call(input);

    // 3. Transform
    return this.transform(result);
  }

  private validate(input: Input): void {
    if (!input.field) {
      throw new ValidationError('Field is required');
    }
  }

  private transform(data: any): Output {
    return {
      id: data.id,
      name: data.name,
    };
  }
}
```

### Response Helpers

```typescript
// Success
return successResponse(data);
return successResponse(data, 201);

// Errors
return commonErrors.badRequest('Invalid input');
return commonErrors.unauthorized();
return commonErrors.forbidden();
return commonErrors.notFound('User');
return commonErrors.conflict('Email exists');
return handleAsyncError(error);
```

## ⚛️ Frontend Patterns

### Component Structure

```typescript
interface Props {
  user: User;
  onEdit: (user: User) => void;
}

export function UserCard({ user, onEdit }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{user.email}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onEdit(user)}>Edit</Button>
      </CardFooter>
    </Card>
  );
}
```

### Custom Hook

```typescript
export function useUsers() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiClient.get('/api/users');
      return response.data;
    },
  });

  return {
    users: data?.users || [],
    isLoading,
    error,
    refetch,
  };
}
```

### Mutation

```typescript
const mutation = useMutation({
  mutationFn: (data: CreateUserInput) => apiClient.post('/api/users', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    toast.success('User created');
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

// Usage
mutation.mutate({ email: 'user@example.com' });
```

## 🔌 API Design

### URL Structure

```
GET    /api/users              # List users
GET    /api/users/:id          # Get user
POST   /api/users              # Create user
PUT    /api/users/:id          # Update user (full)
PATCH  /api/users/:id          # Update user (partial)
DELETE /api/users/:id          # Delete user
POST   /api/users/:id/ban      # Action
```

### Query Parameters

```
GET /api/users?limit=20&offset=0&orderBy=created_at&role=admin
```

### Response Format

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Status Codes

```
200 OK                    # Success (GET, PUT, PATCH)
201 Created               # Success (POST)
204 No Content            # Success (DELETE)
400 Bad Request           # Invalid request
401 Unauthorized          # Not authenticated
403 Forbidden             # Not authorized
404 Not Found             # Resource not found
409 Conflict              # Resource exists
422 Unprocessable Entity  # Validation error
500 Internal Server Error # Server error
```

## 🗄️ DynamoDB Patterns

### Query

```typescript
// Query by partition key
const result = await dynamoClient.send(
  new QueryCommand({
    TableName: 'MainTable',
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': { S: `USER#${userId}` },
    },
  })
);

// Query with sort key
const result = await dynamoClient.send(
  new QueryCommand({
    TableName: 'MainTable',
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': { S: `USER#${userId}` },
      ':sk': { S: 'ORDER#' },
    },
  })
);
```

### Put with Condition

```typescript
await dynamoClient.send(new PutCommand({
  TableName: 'MainTable',
  Item: { PK: 'USER#123', SK: 'PROFILE', ... },
  ConditionExpression: 'attribute_not_exists(PK)',
}));
```

## 🧪 Testing

### Test Structure

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { email: 'test@example.com' };
      const service = new UserService();

      // Act
      const result = await service.createUser(userData);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
    });

    it('should throw error when email exists', async () => {
      // Arrange
      const userData = { email: 'existing@example.com' };
      const service = new UserService();

      // Act & Assert
      await expect(service.createUser(userData)).rejects.toThrow('User already exists');
    });
  });
});
```

### Run Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Specific file
npm test -- users.test.ts
```

## 📦 Common Commands

### Backend

```bash
cd backend

# Development
npm run dev

# Deploy
./deploy.sh heet
./deploy.sh dev-heet
./deploy.sh test
./deploy.sh prod

# Logs
npm run logs:dev -- functionName
npm run logs:prod -- functionName

# Info
npm run info:dev
npm run info:prod

# Remove
npm run remove:dev
npm run remove:prod

# Tests
npm test
npm run test:watch

# Lint
npm run lint
npm run lint:fix

# Type check
npm run typecheck
```

### Client

```bash
cd client

# Development
npm run dev

# Build
npm run build

# Preview
npm run preview

# Tests
npm test

# Lint
npm run lint
npm run lint:fix

# Type check
npm run typecheck
```

### Root

```bash
# Run both
npm run backend  # Terminal 1
npm run client   # Terminal 2

# Tests
npm test

# Lint all
npm run lint
npm run lint:fix

# Type check all
npm run typecheck

# Format
npm run format
npm run format:check
```

## 🔐 Environment Variables

### Backend (.env)

```bash
# Clerk
CLERK_SECRET_KEY=sk_test_...
CLERK_REDIRECT_URL=http://localhost:5173

# AWS
AWS_REGION=us-east-1
AWS_PROFILE=default

# Stage
STAGE=dev
```

### Client (.env.local)

```bash
# API
VITE_API_URL=https://api-dev.example.com

# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

## 🎨 Code Style

### TypeScript

```typescript
// Variables - camelCase
const userName = 'John';

// Functions - camelCase
function getUserById(id: string) {}

// Classes/Interfaces - PascalCase
class UserService {}
interface UserResponse {}

// Constants - UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;

// Enums - PascalCase
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

// Booleans - is/has/should prefix
const isLoading = true;
const hasPermission = false;
const shouldRetry = true;
```

### Imports

```typescript
// 1. External
import { APIGatewayProxyEvent } from 'aws-lambda';

// 2. Shared
import { successResponse } from '@shared/response';

// 3. Local
import { UserService } from '../services/UserService';

// 4. Types
import type { User } from '../types';
```

## 🚨 Common Errors

### TypeScript Errors

```bash
# Type error
error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'

# Fix: Use correct type
const id: number = parseInt(userId);
```

### ESLint Errors

```bash
# Unused variable
error: 'user' is defined but never used

# Fix: Remove or use underscore prefix
const _user = getUser(); // Intentionally unused
```

### Git Errors

```bash
# Commit message format
error: subject may not be empty
error: type may not be empty

# Fix: Use conventional commit format
git commit -m "feat(users): add feature"
```

## 📚 Resources

### Documentation

- [Coding Guidelines](./CODING_GUIDELINES.md)
- [API Design](./API_DESIGN.md)
- [Git Workflow](./GIT_WORKFLOW.md)
- [Infrastructure](./INFRASTRUCTURE.md)
- [Main README](../README.md)
- [Contributing](../CONTRIBUTING.md)

### External

- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [React Docs](https://react.dev/)
- [AWS Lambda Docs](https://docs.aws.amazon.com/lambda/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 💡 Tips

- **Before committing:** Run `npm run lint` and `npm test`
- **Before PR:** Deploy to your dev stage and test
- **Keep PRs small:** < 400 lines of changes
- **Write tests:** Especially for critical paths
- **Use TypeScript:** Avoid `any` type
- **Handle errors:** Always use try-catch
- **Log properly:** Use structured logging
- **Document:** Add JSDoc for public APIs

## 🆘 Getting Help

1. Check this quick reference
2. Read relevant guideline document
3. Search existing code for examples
4. Ask in team chat
5. Create GitHub issue

---

**Remember:** This is a quick reference. For detailed information, see the full guideline documents.
