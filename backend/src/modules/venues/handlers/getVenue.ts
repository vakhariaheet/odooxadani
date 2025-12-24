import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { VenueService } from '../services/VenueService';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';

const venueService = new VenueService();

/**
 * Base handler for getting venue details
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const venueId = event.pathParameters?.['id'];
    
    if (!venueId) {
      return commonErrors.badRequest('Venue ID is required');
    }

    const venue = await venueService.getVenue(venueId);
    
    if (!venue) {
      return commonErrors.notFound('Venue');
    }

    return successResponse(venue);
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * Get venue details handler - Public endpoint
 * Returns detailed venue information including availability
 *
 * @route GET /api/venues/:id
 */
export const handler = withRbac(baseHandler, 'venues', 'read');