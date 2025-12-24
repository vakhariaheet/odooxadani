import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { ClientPortalService } from '../services/ClientPortalService';
import { UpdateClientProfileRequest } from '../types';

const clientPortalService = new ClientPortalService();

/**
 * PUT /api/client/profile
 * Update the authenticated client's profile
 */
const baseHandler = async (event: AuthenticatedAPIGatewayEvent): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId } = getAuthContext(event);
    
    // Parse request body
    if (!event.body) {
      return commonErrors.validationError('Request body is required');
    }
    
    let updateData: UpdateClientProfileRequest;
    try {
      updateData = JSON.parse(event.body);
    } catch (error) {
      return commonErrors.validationError('Invalid JSON in request body');
    }
    
    // Validate required fields if provided
    if (updateData.contactName !== undefined && (!updateData.contactName || updateData.contactName.trim().length === 0)) {
      return commonErrors.validationError('Contact name cannot be empty');
    }
    
    // Validate email format if provided (basic validation)
    if (updateData.preferences?.emailNotifications) {
      const emailNotifications = updateData.preferences.emailNotifications;
      const validBooleanFields: (keyof typeof emailNotifications)[] = ['proposalReceived', 'contractSigned', 'invoiceReceived', 'paymentReminders'];
      
      for (const field of validBooleanFields) {
        if (emailNotifications[field] !== undefined && typeof emailNotifications[field] !== 'boolean') {
          return commonErrors.validationError(`${field} must be a boolean value`);
        }
      }
    }
    
    // Validate dashboard settings if provided
    if (updateData.preferences?.dashboardSettings) {
      const dashboardSettings = updateData.preferences.dashboardSettings;
      
      if (dashboardSettings.defaultView && !['overview', 'proposals', 'contracts', 'invoices'].includes(dashboardSettings.defaultView)) {
        return commonErrors.validationError('Invalid default view. Must be one of: overview, proposals, contracts, invoices');
      }
      
      if (dashboardSettings.itemsPerPage !== undefined) {
        const itemsPerPage = dashboardSettings.itemsPerPage;
        if (!Number.isInteger(itemsPerPage) || itemsPerPage < 5 || itemsPerPage > 100) {
          return commonErrors.validationError('Items per page must be an integer between 5 and 100');
        }
      }
    }
    
    // Update the client profile
    const updatedProfile = await clientPortalService.updateClientProfile(userId, updateData);
    
    return successResponse(updatedProfile);
  } catch (error) {
    return handleAsyncError(error);
  }
};

// Protect with RBAC - clients can update their own profile
export const handler = withRbac(baseHandler, 'users', 'update');