/**
 * Example test file
 * Shows how to write tests for handlers, services, and utilities
 */

import { successResponse, errorResponse } from '../shared/response';

describe('Response Helpers', () => {
  describe('successResponse', () => {
    it('should return 200 status by default', () => {
      const response = successResponse({ message: 'Success' });
      
      expect(response.statusCode).toBe(200);
      expect(response.headers).toHaveProperty('Content-Type', 'application/json');
    });

    it('should return custom status code', () => {
      const response = successResponse({ message: 'Created' }, 201);
      
      expect(response.statusCode).toBe(201);
    });

    it('should serialize body to JSON with success wrapper', () => {
      const data = { id: '123', name: 'Test' };
      const response = successResponse(data);
      const body = JSON.parse(response.body);
      
      expect(body.success).toBe(true);
      expect(body.data).toEqual(data);
      expect(body.meta).toHaveProperty('timestamp');
    });
  });

  describe('errorResponse', () => {
    it('should return 500 status by default', () => {
      const response = errorResponse('ERROR_CODE', 'Something went wrong');
      const body = JSON.parse(response.body);
      
      expect(response.statusCode).toBe(500);
      expect(body.success).toBe(false);
      expect(body.error).toHaveProperty('code', 'ERROR_CODE');
      expect(body.error).toHaveProperty('message', 'Something went wrong');
    });

    it('should return custom status code', () => {
      const response = errorResponse('NOT_FOUND', 'Not found', 404);
      
      expect(response.statusCode).toBe(404);
    });
  });
});
