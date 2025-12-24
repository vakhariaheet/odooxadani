import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { BookingService } from '../services/BookingService';
import { ListBookingsQuery } from '../types';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { getAuthContext } from '../../../shared/types';

const bookingService = new BookingService();

/**
 * Base handler for listing user's bookings
 */
const baseHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId } = getAuthContext(event);
    const queryParams = event.queryStringParameters || {};

    const query: ListBookingsQuery = {
      limit: queryParams['limit'] ? parseInt(queryParams['limit'], 10) : 20,
      offset: queryParams['offset'] ? parseInt(queryParams['offset'], 10) : 0,
      status: queryParams['status'] as any,
      bookingType: queryParams['bookingType'] as any,
      venueId: queryParams['venueId'],
      eventId: queryParams['eventId'],
      startDate: queryParams['startDate'],
      endDate: queryParams['endDate'],
    };

    // Validate limit
    if (query.limit && (query.limit < 1 || query.limit > 100)) {
      query.limit = 20;
    }

    // Validate offset
    if (query.offset && query.offset < 0) {
      query.offset = 0;
    }

    const result = await bookingService.listBookings(userId, query);

    return successResponse(result);
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * List bookings handler
 * Returns user's bookings with optional filtering
 *
 * @route GET /api/bookings
 */
export const handler = withRbac(baseHandler, 'bookings', 'read');
