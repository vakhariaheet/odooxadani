import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { VenueService } from '../services/VenueService';
import { CreateVenueRequest } from '../types';
import { successResponse, handleAsyncError, commonErrors, HTTP_STATUS } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';

const venueService = new VenueService();

/**
 * Base handler for creating venues
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId } = getAuthContext(event);

    if (!event.body) {
      return commonErrors.badRequest('Request body is required');
    }

    let requestData: CreateVenueRequest;
    try {
      requestData = JSON.parse(event.body);
    } catch (error) {
      return commonErrors.badRequest('Invalid JSON in request body');
    }

    // Validate required fields
    const requiredFields = ['name', 'description', 'category', 'location', 'capacity', 'pricing'];
    const missingFields = requiredFields.filter(field => !requestData[field as keyof CreateVenueRequest]);
    
    if (missingFields.length > 0) {
      return commonErrors.badRequest(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate location fields
    if (!requestData.location.address || !requestData.location.city || !requestData.location.state) {
      return commonErrors.badRequest('Location must include address, city, and state');
    }

    // Validate capacity
    if (!requestData.capacity.min || !requestData.capacity.max) {
      return commonErrors.badRequest('Capacity must include min and max values');
    }

    // Validate pricing
    if (!requestData.pricing.basePrice || !requestData.pricing.currency || !requestData.pricing.pricingModel) {
      return commonErrors.badRequest('Pricing must include basePrice, currency, and pricingModel');
    }

    const venue = await venueService.createVenue(requestData, userId);
    return successResponse(venue, HTTP_STATUS.CREATED);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return commonErrors.validationError(error.message);
    }
    return handleAsyncError(error);
  }
};

/**
 * Create venue handler - Venue owners and admins only
 * Creates a new venue with the authenticated user as owner
 *
 * @route POST /api/venues
 */
export const handler = withRbacOwn(baseHandler, 'venues', 'create');