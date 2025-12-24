import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { BookingService } from '../services/BookingService';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { getAuthContext } from '../../../shared/types';

const bookingService = new BookingService();

/**
 * Base handler for cancelling a booking
 */
const baseHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId } = getAuthContext(event);
    const bookingId = event.pathParameters?.['id'];

    if (!bookingId) {
      return commonErrors.badRequest('Booking ID is required');
    }

    const cancelledBooking = await bookingService.cancelBooking(bookingId, userId);

    return successResponse(cancelledBooking);
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * Cancel booking handler
 * Cancels a booking and processes refund
 *
 * @route DELETE /api/bookings/{id}
 */
export const handler = withRbac(baseHandler, 'bookings', 'delete');
