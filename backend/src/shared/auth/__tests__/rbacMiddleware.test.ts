/**
 * RBAC Middleware unit tests
 * Example of testing middleware with mocked events
 */

import { withRbac } from '../rbacMiddleware';
import { AuthenticatedAPIGatewayEvent } from '../../types';

describe('RBAC Middleware', () => {
  const mockHandler = jest.fn(async (_event: AuthenticatedAPIGatewayEvent) => {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' }),
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('withRbac', () => {
    it('should allow admin to access admin-only resources', async () => {
      const event = {
        requestContext: {
          authorizer: {
            jwt: {
              claims: {
                role: 'admin',
                userid: 'user_123',
                email: 'admin@example.com',
              },
            },
          },
        },
      } as unknown as AuthenticatedAPIGatewayEvent;

      const wrappedHandler = withRbac(mockHandler, 'users', 'read');
      const result = await wrappedHandler(event);

      expect(mockHandler).toHaveBeenCalledWith(event);
      expect((result as { statusCode: number }).statusCode).toBe(200);
    });

    it('should deny user access to admin-only resources', async () => {
      const event = {
        requestContext: {
          authorizer: {
            jwt: {
              claims: {
                role: 'user',
                userid: 'user_456',
                email: 'user@example.com',
              },
            },
          },
        },
      } as unknown as AuthenticatedAPIGatewayEvent;

      const wrappedHandler = withRbac(mockHandler, 'users', 'delete');
      const result = await wrappedHandler(event);

      expect(mockHandler).not.toHaveBeenCalled();
      expect((result as { statusCode: number }).statusCode).toBe(403);
    });

    it('should return 401 when no JWT claims present', async () => {
      const event = {
        requestContext: {
          authorizer: {},
        },
      } as unknown as AuthenticatedAPIGatewayEvent;

      const wrappedHandler = withRbac(mockHandler, 'users', 'read');
      const result = await wrappedHandler(event);

      expect(mockHandler).not.toHaveBeenCalled();
      expect((result as { statusCode: number }).statusCode).toBe(401);
    });
  });
});
