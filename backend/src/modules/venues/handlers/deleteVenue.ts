import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { VenueService } from '../services/VenueService';
import { successResponse, handleAsyncError, commonErrors, HTTP_STATUS } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';

const venueService = new VenueService();

/**
 * Base handler for deleting venues
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId } = getAuthContext(event);
    const venueId = event.pathParameters?.['id'];
    
    if (!venueId) {
      return commonErrors.badRequest('Venue ID is required');
    }

    await venueService.deleteVenue(venueId, userId);
    return successResponse({ message: 'Venue deleted successfully' }, HTTP_STATUS.NO_CONTENT);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Venue not found') {
        return commonErrors.notFound('Venue');
      }
      if (error.message === 'You can only delete your own venues') {
        return commonErrors.forbidden('You can only delete your own venues');
      }
    }
    return handleAsyncError(error);
  }
};

/**
 * Delete venue handler - Venue owners only (own venues)
 * Permanently deletes a venue and all associated data
 *
 * @route DELETE /api/venues/:id
 */
export const handler = withRbacOwn(baseHandler, 'venues', 'delete');