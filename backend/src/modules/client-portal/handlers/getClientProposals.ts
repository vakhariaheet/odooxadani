import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { ClientPortalService } from '../services/ClientPortalService';
import { ClientListQuery } from '../types';

const clientPortalService = new ClientPortalService();

/**
 * GET /api/client/proposals
 * Get proposals sent to the authenticated client
 */
const baseHandler = async (event: AuthenticatedAPIGatewayEvent): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId } = getAuthContext(event);
    
    // Parse query parameters
    const query: ClientListQuery = {};
    
    if (event.queryStringParameters) {
      const { limit, offset, status, sortBy, sortOrder } = event.queryStringParameters;
      
      if (limit) {
        const parsedLimit = parseInt(limit, 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100) {
          query.limit = parsedLimit;
        }
      }
      
      if (offset) {
        const parsedOffset = parseInt(offset, 10);
        if (!isNaN(parsedOffset) && parsedOffset >= 0) {
          query.offset = parsedOffset;
        }
      }
      
      if (status && ['draft', 'sent', 'viewed', 'accepted', 'rejected'].includes(status)) {
        query.status = status;
      }
      
      if (sortBy && ['createdAt', 'updatedAt', 'amount'].includes(sortBy)) {
        query.sortBy = sortBy as ClientListQuery['sortBy'];
      }
      
      if (sortOrder && ['asc', 'desc'].includes(sortOrder)) {
        query.sortOrder = sortOrder as ClientListQuery['sortOrder'];
      }
    }
    
    // Get proposals for the authenticated client
    const result = await clientPortalService.getClientProposals(userId, query);
    
    return successResponse(result);
  } catch (error) {
    return handleAsyncError(error);
  }
};

// Protect with RBAC - clients can read their own proposals
export const handler = withRbac(baseHandler, 'proposals', 'read');