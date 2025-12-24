import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { VenueService } from '../services/VenueService';
import { AvailabilityQuery } from '../types';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';

const venueService = new VenueService();

/**
 * Base handler for getting venue availability
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const venueId = event.pathParameters?.['id'];
    
    if (!venueId) {
      return commonErrors.badRequest('Venue ID is required');
    }

    // Parse query parameters
    const query: AvailabilityQuery = {
      startDate: '',
      endDate: ''
    };

    if (event.queryStringParameters) {
      const { startDate, endDate } = event.queryStringParameters;

      if (!startDate || !endDate) {
        return commonErrors.badRequest('Both startDate and endDate are required (YYYY-MM-DD format)');
      }

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return commonErrors.badRequest('Dates must be in YYYY-MM-DD format');
      }

      // Validate dates are valid
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return commonErrors.badRequest('Invalid date values');
      }

      query.startDate = startDate;
      query.endDate = endDate;
    } else {
      return commonErrors.badRequest('Query parameters startDate and endDate are required');
    }

    // Check if venue exists
    const venue = await venueService.getVenue(venueId);
    if (!venue) {
      return commonErrors.notFound('Venue');
    }

    const availability = await venueService.getAvailability(venueId, query);
    return successResponse(availability);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Start date must be before end date') || 
          error.message.includes('Date range cannot exceed 90 days')) {
        return commonErrors.badRequest(error.message);
      }
    }
    return handleAsyncError(error);
  }
};

/**
 * Get venue availability handler - Public endpoint
 * Returns available time slots for a venue within the specified date range
 *
 * @route GET /api/venues/:id/availability
 */
export const handler = withRbac(baseHandler, 'venues', 'read');