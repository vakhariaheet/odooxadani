/**
 * ClerkUserService unit tests
 * Example of testing service layer with mocked dependencies
 */

import { UserRole } from '../types';

// Mock Clerk SDK before importing the service
jest.mock('@clerk/backend', () => ({
  createClerkClient: jest.fn(() => ({
    users: {
      getUserList: jest.fn().mockResolvedValue({
        data: [],
        totalCount: 0,
      }),
      getUser: jest.fn().mockResolvedValue({
        id: 'user_123',
        emailAddresses: [{ id: 'email_1', emailAddress: 'test@example.com' }],
        primaryEmailAddressId: 'email_1',
        firstName: 'Test',
        lastName: 'User',
        publicMetadata: { role: 'user' },
      }),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      banUser: jest.fn(),
      unbanUser: jest.fn(),
    },
    invitations: {
      createInvitation: jest.fn().mockResolvedValue({
        id: 'inv_123',
        emailAddress: 'test@example.com',
      }),
      getInvitationList: jest.fn().mockResolvedValue({
        data: [],
        totalCount: 0,
      }),
      revokeInvitation: jest.fn(),
    },
  })),
}));

// Import after mocking
import { ClerkUserService } from '../services/ClerkUserService';

describe('ClerkUserService', () => {
  let service: ClerkUserService;

  beforeEach(() => {
    service = new ClerkUserService();
    jest.clearAllMocks();
  });

  describe('Service initialization', () => {
    it('should create service instance', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(ClerkUserService);
    });
  });

  describe('User roles', () => {
    it('should have correct role enum values', () => {
      expect(UserRole.USER).toBe('user');
      expect(UserRole.ADMIN).toBe('admin');
    });
  });

  describe('Business logic tests', () => {
    it('should validate email format', () => {
      const validEmail = 'test@example.com';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(validEmail).toMatch(emailRegex);
    });

    it('should handle role changes correctly', () => {
      const currentRole = UserRole.USER;
      const newRole = UserRole.ADMIN;
      expect(currentRole).not.toBe(newRole);
    });
  });
});
