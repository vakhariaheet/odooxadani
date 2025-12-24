import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { BookingService } from '../services/BookingService';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { getAuthContext } from '../../../shared/types';

const bookingService = new BookingService();

/**
 * Base handler for confirming a booking (venue owner action)
 */
const baseHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId } = getAuthContext(event);
    const bookingId = event.pathParameters?.['id'];

    if (!bookingId) {
      return commonErrors.badRequest('Booking ID is required');
    }

    const confirmedBooking = await bookingService.confirmBooking(bookingId, userId);

    return successResponse(confirmedBooking);
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * Confirm booking handler
 * Confirms a pending booking (venue owner action)
 *
 * @route POST /api/bookings/{id}/confirm
 */
export const handler = withRbac(baseHandler, 'bookings', 'update');
