# API Design Guidelines

Best practices for designing consistent and maintainable REST APIs.

## General Principles

### RESTful Design

- Use nouns for resources, not verbs
- Use HTTP methods correctly (GET, POST, PUT, PATCH, DELETE)
- Use proper HTTP status codes
- Keep URLs simple and intuitive

### Consistency

- Follow the same patterns across all endpoints
- Use consistent naming conventions
- Return consistent response structures
- Handle errors consistently

## URL Structure

### Resource Naming

**Use plural nouns for collections:**

```
✅ Good
GET /api/users
GET /api/users/123
POST /api/users

❌ Bad
GET /api/user
GET /api/getUser/123
POST /api/createUser
```

**Use kebab-case for multi-word resources:**

```
✅ Good
GET /api/user-invitations
GET /api/admin-stats

❌ Bad
GET /api/userInvitations
GET /api/user_invitations
```

**Nest resources logically:**

```
✅ Good
GET /api/users/123/orders
GET /api/users/123/orders/456

❌ Bad
GET /api/orders?userId=123
GET /api/getUserOrders/123
```

### Query Parameters

**Use query params for filtering, sorting, pagination:**

```
✅ Good
GET /api/users?role=admin&limit=20&offset=0&orderBy=created_at

❌ Bad
GET /api/users/admin/20/0
```

**Common query parameters:**

- `limit` - Number of items to return (default: 20, max: 100)
- `offset` - Number of items to skip (default: 0)
- `page` - Page number (alternative to offset)
- `orderBy` - Field to sort by
- `order` - Sort direction (asc/desc)
- `search` - Search term
- `filter` - Filter criteria

## HTTP Methods

### GET - Retrieve Resources

**List resources:**

```typescript
/**
 * @route GET /api/users
 * @query limit - Number of items (default: 20)
 * @query offset - Number to skip (default: 0)
 * @query role - Filter by role
 */
GET /api/users?limit=20&offset=0&role=admin

Response: 200 OK
{
  "success": true,
  "data": {
    "users": [...],
    "totalCount": 150
  }
}
```

**Get single resource:**

```typescript
/**
 * @route GET /api/users/:id
 * @param id - User ID
 */
GET /api/users/user_123

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "john@example.com",
    ...
  }
}
```

### POST - Create Resources

**Create new resource:**

```typescript
/**
 * @route POST /api/users
 * @body User creation data
 */
POST /api/users
Content-Type: application/json

{
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "john@example.com",
    ...
  }
}
```

**Trigger action (non-resource creation):**

```typescript
/**
 * @route POST /api/users/:id/ban
 * @param id - User ID
 */
POST /api/users/user_123/ban

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "user_123",
    "banned": true,
    ...
  }
}
```

### PUT - Full Update

**Replace entire resource:**

```typescript
/**
 * @route PUT /api/users/:id
 * @param id - User ID
 * @body Complete user data
 */
PUT /api/users/user_123
Content-Type: application/json

{
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "admin"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "user_123",
    ...
  }
}
```

### PATCH - Partial Update

**Update specific fields:**

```typescript
/**
 * @route PATCH /api/users/:id
 * @param id - User ID
 * @body Partial user data
 */
PATCH /api/users/user_123
Content-Type: application/json

{
  "role": "admin"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "user_123",
    "role": "admin",
    ...
  }
}
```

### DELETE - Remove Resources

**Delete resource:**

```typescript
/**
 * @route DELETE /api/users/:id
 * @param id - User ID
 */
DELETE /api/users/user_123

Response: 204 No Content
```

**Soft delete (alternative):**

```typescript
DELETE /api/users/user_123

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "user_123",
    "deleted": true,
    "deletedAt": "2024-01-15T10:30:00Z"
  }
}
```

## Response Format

### Success Response

**Standard structure:**

```typescript
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

**List response with pagination:**

```typescript
{
  "success": true,
  "data": {
    "users": [...],
    "totalCount": 150,
    "limit": 20,
    "offset": 0
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Response

**Standard error structure:**

```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email address",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Common error codes:**

- `BAD_REQUEST` - Invalid request format
- `UNAUTHORIZED` - Missing or invalid authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource already exists
- `VALIDATION_ERROR` - Input validation failed
- `INTERNAL_SERVER_ERROR` - Server error

## HTTP Status Codes

### Success Codes (2xx)

- `200 OK` - Successful GET, PUT, PATCH, or action
- `201 Created` - Successful POST (resource created)
- `204 No Content` - Successful DELETE (no response body)

### Client Error Codes (4xx)

- `400 Bad Request` - Invalid request format
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `422 Unprocessable Entity` - Validation error

### Server Error Codes (5xx)

- `500 Internal Server Error` - Unexpected server error
- `502 Bad Gateway` - Upstream service error
- `503 Service Unavailable` - Service temporarily unavailable

## Request Validation

### Input Validation

**Validate all inputs:**

```typescript
interface CreateUserInput {
  email: string; // Required, valid email
  firstName: string; // Required, 2-50 chars
  lastName: string; // Required, 2-50 chars
  role?: UserRole; // Optional, valid enum value
}

function validateCreateUserInput(input: any): CreateUserInput {
  // Email validation
  if (!input.email || typeof input.email !== 'string') {
    throw new ValidationError('Email is required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(input.email)) {
    throw new ValidationError('Invalid email address');
  }

  // Name validation
  if (!input.firstName || input.firstName.length < 2) {
    throw new ValidationError('First name must be at least 2 characters');
  }

  if (input.firstName.length > 50) {
    throw new ValidationError('First name must be less than 50 characters');
  }

  // Role validation
  if (input.role && !Object.values(UserRole).includes(input.role)) {
    throw new ValidationError('Invalid role');
  }

  return {
    email: input.email.toLowerCase().trim(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    role: input.role || UserRole.USER,
  };
}
```

### Query Parameter Validation

**Validate and sanitize query params:**

```typescript
function parseListUsersQuery(params: any): ListUsersQuery {
  const query: ListUsersQuery = {};

  // Limit validation
  if (params.limit) {
    const limit = parseInt(params.limit, 10);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }
    query.limit = limit;
  }

  // Offset validation
  if (params.offset) {
    const offset = parseInt(params.offset, 10);
    if (isNaN(offset) || offset < 0) {
      throw new ValidationError('Offset must be non-negative');
    }
    query.offset = offset;
  }

  // OrderBy validation
  const validOrderBy = ['created_at', 'updated_at', 'email'];
  if (params.orderBy && !validOrderBy.includes(params.orderBy)) {
    throw new ValidationError(`OrderBy must be one of: ${validOrderBy.join(', ')}`);
  }

  return query;
}
```

## Pagination

### Offset-based Pagination

**Request:**

```
GET /api/users?limit=20&offset=40
```

**Response:**

```typescript
{
  "success": true,
  "data": {
    "users": [...],
    "totalCount": 150,
    "limit": 20,
    "offset": 40,
    "hasMore": true
  }
}
```

### Cursor-based Pagination

**Request:**

```
GET /api/users?limit=20&cursor=eyJpZCI6IjEyMyJ9
```

**Response:**

```typescript
{
  "success": true,
  "data": {
    "users": [...],
    "nextCursor": "eyJpZCI6IjE0MyJ9",
    "hasMore": true
  }
}
```

## Filtering and Sorting

### Filtering

**Simple filters:**

```
GET /api/users?role=admin&banned=false
```

**Complex filters (JSON):**

```
GET /api/users?filter={"role":"admin","createdAt":{"gte":"2024-01-01"}}
```

### Sorting

**Single field:**

```
GET /api/users?orderBy=created_at&order=desc
```

**Multiple fields:**

```
GET /api/users?orderBy=role,created_at&order=asc,desc
```

## Versioning

### URL Versioning (Recommended)

```
✅ Good
GET /api/v1/users
GET /api/v2/users

❌ Bad
GET /api/users (no version)
```

### Header Versioning (Alternative)

```
GET /api/users
Accept: application/vnd.api+json; version=1
```

## Rate Limiting

### Response Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
```

### Rate Limit Exceeded

```
Response: 429 Too Many Requests
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retryAfter": 60
    }
  }
}
```

## Authentication

### Bearer Token

```
GET /api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### API Key (Alternative)

```
GET /api/users
X-API-Key: sk_live_abc123...
```

## CORS Headers

**Required headers:**

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

## Documentation

### OpenAPI/Swagger

**Document all endpoints:**

```yaml
paths:
  /api/users:
    get:
      summary: List users
      description: Returns a paginated list of users
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            minimum: 1
            maximum: 100
        - name: offset
          in: query
          schema:
            type: integer
            default: 0
            minimum: 0
      responses:
        200:
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserListResponse'
```

### Inline Documentation

**Document handlers:**

```typescript
/**
 * List users handler - Admin only
 * Returns paginated list of all users
 *
 * @route GET /api/admin/users
 * @query limit - Number of items (default: 20, max: 100)
 * @query offset - Number to skip (default: 0)
 * @query role - Filter by role (optional)
 * @query orderBy - Sort field (default: created_at)
 *
 * @returns 200 - List of users with pagination
 * @returns 400 - Invalid query parameters
 * @returns 401 - Unauthorized
 * @returns 403 - Forbidden (not admin)
 */
export const handler = withRbac(baseHandler, 'users', 'read');
```

## Best Practices

### Do's

- ✅ Use nouns for resources
- ✅ Use HTTP methods correctly
- ✅ Return consistent response structures
- ✅ Validate all inputs
- ✅ Use proper status codes
- ✅ Document all endpoints
- ✅ Version your API
- ✅ Implement rate limiting
- ✅ Use pagination for lists
- ✅ Handle errors gracefully

### Don'ts

- ❌ Use verbs in URLs
- ❌ Return different structures for same endpoint
- ❌ Trust client input without validation
- ❌ Use 200 for all responses
- ❌ Expose internal errors to clients
- ❌ Return all records without pagination
- ❌ Break backward compatibility
- ❌ Ignore security headers
- ❌ Skip error handling
- ❌ Leave endpoints undocumented

---

For more information, see:

- [Coding Guidelines](./CODING_GUIDELINES.md)
- [Backend README](../backend/README.md)
- [OpenAPI Specification](https://swagger.io/specification/)
