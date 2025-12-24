import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { ClientPortalService } from '../services/ClientPortalService';

const clientPortalService = new ClientPortalService();

/**
 * GET /api/client/dashboard
 * Get comprehensive dashboard data for the authenticated client
 */
const baseHandler = async (event: AuthenticatedAPIGatewayEvent): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId } = getAuthContext(event);
    
    // Get dashboard data for the authenticated client
    const dashboard = await clientPortalService.getClientDashboard(userId);
    
    return successResponse(dashboard);
  } catch (error) {
    return handleAsyncError(error);
  }
};

// Protect with RBAC - clients can only read their own dashboard
export const handler = withRbac(baseHandler, 'users', 'read');