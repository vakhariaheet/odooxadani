import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { BookingService } from '../services/BookingService';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { getAuthContext } from '../../../shared/types';

const bookingService = new BookingService();

/**
 * Base handler for getting a specific booking
 */
const baseHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId } = getAuthContext(event);
    const bookingId = event.pathParameters?.['id'];

    if (!bookingId) {
      return commonErrors.badRequest('Booking ID is required');
    }

    const booking = await bookingService.getBookingById(bookingId, userId);

    if (!booking) {
      return commonErrors.notFound('Booking');
    }

    return successResponse(booking);
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * Get booking handler
 * Returns a specific booking by ID (user can only access their own bookings)
 *
 * @route GET /api/bookings/{id}
 */
export const handler = withRbac(baseHandler, 'bookings', 'read');
