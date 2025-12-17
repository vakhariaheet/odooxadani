# Backend Tests

This directory contains all test files for the backend application. The structure mirrors the `src` directory for easy navigation.

## Directory Structure

```
tests/
├── setup.ts                          # Global test setup
├── config/                           # Configuration tests
│   └── permissions.test.ts
├── shared/                           # Shared utilities tests
│   ├── response.test.ts
│   ├── logger.test.ts
│   └── auth/
│       ├── clerkAuth.test.ts
│       └── rbacMiddleware.test.ts
└── modules/                          # Module-specific tests
    ├── demo/
    │   └── handlers/
    │       └── whoami.test.ts
    ├── users/
    │   ├── handlers/
    │   │   └── getAdminStats.test.ts
    │   └── services/
    │       └── ClerkUserService.test.ts
    └── websocket/
        ├── handlers/
        │   └── connect.test.ts
        └── services/
            └── WebSocketService.test.ts
```

## Running Tests

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Run tests with coverage

```bash
npm test -- --coverage
```

### Run specific test file

```bash
npm test -- tests/shared/response.test.ts
```

### Run tests matching pattern

```bash
npm test -- --testNamePattern="should return"
```

## Writing Tests

### Test File Naming

- Test files should end with `.test.ts` or `.spec.ts`
- Test files should mirror the source file structure
- Example: `src/shared/response.ts` → `tests/shared/response.test.ts`

### Test Structure

```typescript
import { functionToTest } from '../../src/path/to/module';

describe('Module Name', () => {
  beforeEach(() => {
    // Setup before each test
    jest.clearAllMocks();
  });

  describe('functionToTest', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = functionToTest(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Mocking

#### Mock AWS SDK

```typescript
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn(() => ({
    send: jest.fn(),
  })),
}));
```

#### Mock Clerk

```typescript
jest.mock('@clerk/backend', () => ({
  createClerkClient: jest.fn(() => ({
    users: {
      getUserList: jest.fn(),
    },
  })),
}));
```

#### Mock Environment Variables

Environment variables are set in `tests/setup.ts` and available in all tests.

## Coverage Thresholds

- **Global**: 70% coverage for branches, functions, lines, and statements
- **Auth modules**: 80% coverage (stricter for security-critical code)
- **Config modules**: 80% coverage

## Best Practices

1. **Test behavior, not implementation** - Focus on what the function does, not how
2. **Use descriptive test names** - Test names should explain what is being tested
3. **Follow AAA pattern** - Arrange, Act, Assert
4. **Mock external dependencies** - Don't make real API calls or database queries
5. **Test edge cases** - Test error conditions, empty inputs, boundary values
6. **Keep tests isolated** - Each test should be independent
7. **Use beforeEach/afterEach** - Clean up mocks and state between tests

## Common Issues

### Module not found errors

- Check that path aliases in `jest.config.js` match `tsconfig.json`
- Use relative imports in test files

### Timeout errors

- Increase timeout in `jest.config.js` or use `jest.setTimeout()` in specific tests
- Check for unresolved promises

### Mock not working

- Ensure mock is defined before importing the module that uses it
- Use `jest.clearAllMocks()` in `beforeEach`

## CI/CD Integration

Tests run automatically on:

- Pull requests
- Pushes to main branch
- Pre-commit hooks (via Husky)

Coverage reports are generated and can be viewed in the `coverage/` directory.
