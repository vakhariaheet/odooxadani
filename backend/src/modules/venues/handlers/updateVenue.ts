import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { VenueService } from '../services/VenueService';
import { UpdateVenueRequest } from '../types';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';

const venueService = new VenueService();

/**
 * Base handler for updating venues
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

    if (!event.body) {
      return commonErrors.badRequest('Request body is required');
    }

    let requestData: UpdateVenueRequest;
    try {
      requestData = JSON.parse(event.body);
    } catch (error) {
      return commonErrors.badRequest('Invalid JSON in request body');
    }

    // Validate that at least one field is being updated
    const updateFields = Object.keys(requestData).filter(key => 
      requestData[key as keyof UpdateVenueRequest] !== undefined
    );
    
    if (updateFields.length === 0) {
      return commonErrors.badRequest('At least one field must be provided for update');
    }

    const venue = await venueService.updateVenue(venueId, requestData, userId);
    return successResponse(venue);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Venue not found') {
        return commonErrors.notFound('Venue');
      }
      if (error.message === 'You can only update your own venues') {
        return commonErrors.forbidden('You can only update your own venues');
      }
      if (error.message.includes('Validation failed')) {
        return commonErrors.validationError(error.message);
      }
    }
    return handleAsyncError(error);
  }
};

/**
 * Update venue handler - Venue owners only (own venues)
 * Updates venue information for venues owned by the authenticated user
 *
 * @route PUT /api/venues/:id
 */
export const handler = withRbacOwn(baseHandler, 'venues', 'update');