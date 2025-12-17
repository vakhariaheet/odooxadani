# Developer Cheat Sheet

One-page reference for the most common patterns and commands.

## Git Workflow

```bash
# Create feature branch
git checkout -b feat/feature-name

# Commit (conventional format)
git commit -m "feat(scope): description"

# Push
git push -u origin feat/feature-name

# Update branch
git fetch origin && git rebase origin/main

# Undo last commit (keep changes)
git reset --soft HEAD~1
```

**Commit types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`  
**Scopes:** `backend`, `client`, `api`, `auth`, `users`, `websocket`, `deploy`

## Backend Handler

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
    const body = JSON.parse(event.body || '{}');
    const result = await service.doSomething(body);
    return successResponse(result);
  } catch (error) {
    return handleAsyncError(error);
  }
};

export const handler = withRbac(baseHandler, 'resource', 'action');
```

## Backend Service

```typescript
export class MyService {
  private client: Client;

  constructor() {
    this.client = createClient({
      apiKey: process.env['API_KEY']!,
    });
  }

  async doSomething(input: Input): Promise<Output> {
    this.validate(input);
    const result = await this.client.call(input);
    return this.transform(result);
  }

  private validate(input: Input): void {
    if (!input.field) throw new ValidationError('Required');
  }

  private transform(data: any): Output {
    return { id: data.id, name: data.name };
  }
}
```

## Response Helpers

```typescript
// Success
return successResponse(data);
return successResponse(data, 201);

// Errors
return commonErrors.badRequest('Invalid');
return commonErrors.unauthorized();
return commonErrors.forbidden();
return commonErrors.notFound('User');
return commonErrors.conflict('Exists');
return handleAsyncError(error);
```

## React Component

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

## Custom Hook

```typescript
export function useUsers() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.get('/api/users'),
  });

  return {
    users: data?.users || [],
    isLoading,
    error,
  };
}
```

## Mutation

```typescript
const mutation = useMutation({
  mutationFn: (data) => apiClient.post('/api/users', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});

mutation.mutate({ email: 'user@example.com' });
```

## API Endpoints

```
GET    /api/users              # List
GET    /api/users/:id          # Get
POST   /api/users              # Create
PUT    /api/users/:id          # Update (full)
PATCH  /api/users/:id          # Update (partial)
DELETE /api/users/:id          # Delete
POST   /api/users/:id/action   # Action
```

## Status Codes

```
200 OK                    # Success
201 Created               # Created
204 No Content            # Deleted
400 Bad Request           # Invalid
401 Unauthorized          # Not authenticated
403 Forbidden             # Not authorized
404 Not Found             # Not found
409 Conflict              # Exists
422 Unprocessable Entity  # Validation
500 Internal Server Error # Error
```

## DynamoDB Query

```typescript
// By partition key
await dynamoClient.send(
  new QueryCommand({
    TableName: 'Table',
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': { S: `USER#${id}` },
    },
  })
);

// With sort key
await dynamoClient.send(
  new QueryCommand({
    TableName: 'Table',
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': { S: `USER#${id}` },
      ':sk': { S: 'ORDER#' },
    },
  })
);
```

## Test Structure

```typescript
describe('Service', () => {
  describe('method', () => {
    it('should do something', async () => {
      // Arrange
      const input = { field: 'value' };

      // Act
      const result = await service.method(input);

      // Assert
      expect(result).toBeDefined();
      expect(result.field).toBe('value');
    });
  });
});
```

## Common Commands

```bash
# Backend
cd backend
npm run dev              # Dev server
./deploy.sh heet         # Deploy
npm test                 # Tests
npm run lint             # Lint
npm run typecheck        # Type check

# Client
cd client
npm run dev              # Dev server
npm run build            # Build
npm test                 # Tests
npm run lint             # Lint

# Root
npm run backend          # Backend dev
npm run client           # Client dev
npm test                 # All tests
npm run lint             # Lint all
npm run format           # Format all
```

## Code Style

```typescript
// Variables - camelCase
const userName = 'John';

// Functions - camelCase
function getUser() {}

// Classes/Interfaces - PascalCase
class UserService {}
interface User {}

// Constants - UPPER_SNAKE_CASE
const MAX_ATTEMPTS = 3;

// Enums - PascalCase
enum UserRole {
  ADMIN = 'admin',
}

// Booleans - is/has/should
const isLoading = true;
```

## TypeScript

```typescript
// ✅ Use explicit types
function getUser(id: string): Promise<User> {}

// ✅ Use interfaces
interface User {
  id: string;
  email: string;
}

// ✅ Use enums
enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

// ✅ Handle null
const email = user?.email ?? 'default';

// ❌ Avoid any
function process(data: any) {} // Bad
```

## Environment Variables

```bash
# Backend .env
CLERK_SECRET_KEY=sk_test_...
AWS_REGION=us-east-1
STAGE=dev

# Client .env.local
VITE_API_URL=https://api-dev.example.com
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

## Serverless Function

```yaml
functions:
  myFunction:
    handler: src/handlers/myFunction.handler
    memorySize: 512
    timeout: 30
    environment:
      TABLE_NAME: ${self:custom.tableName}
    events:
      - http:
          path: /api/resource
          method: get
          cors: true
```

## Lambda Best Practices

```typescript
// ✅ Initialize outside handler
const client = new Client();

export const handler = async (event) => {
  // Use client
};

// ✅ Structured logging
logger.info('Event', { userId, action });

// ✅ Handle errors
try {
  // code
} catch (error) {
  logger.error('Error', { error });
  throw error;
}
```

## Quick Tips

- **Before commit:** `npm run lint && npm test`
- **Before PR:** Deploy to dev stage and test
- **Keep PRs small:** < 400 lines
- **Write tests:** For critical paths
- **Use TypeScript:** Avoid `any`
- **Handle errors:** Always try-catch
- **Log properly:** Structured logging
- **Document:** JSDoc for public APIs

---

**Full docs:** See `guidelines/` folder for comprehensive guidelines.
