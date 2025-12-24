import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { BookingService } from '../services/BookingService';
import { UpdateBookingRequest } from '../types';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { getAuthContext } from '../../../shared/types';

const bookingService = new BookingService();

/**
 * Base handler for updating a booking
 */
const baseHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId } = getAuthContext(event);
    const bookingId = event.pathParameters?.['id'];

    if (!bookingId) {
      return commonErrors.badRequest('Booking ID is required');
    }

    if (!event.body) {
      return commonErrors.badRequest('Request body is required');
    }

    let updateRequest: UpdateBookingRequest;
    try {
      updateRequest = JSON.parse(event.body);
    } catch (error) {
      return commonErrors.badRequest('Invalid JSON in request body');
    }

    // Validate that at least one field is being updated
    const hasUpdates = Object.keys(updateRequest).some(
      (key) => updateRequest[key as keyof UpdateBookingRequest] !== undefined
    );

    if (!hasUpdates) {
      return commonErrors.badRequest('At least one field must be provided for update');
    }

    // Validate attendee count if provided
    if (updateRequest.attendeeCount !== undefined && updateRequest.attendeeCount <= 0) {
      return commonErrors.badRequest('Attendee count must be greater than 0');
    }

    // Validate contact info if provided
    if (updateRequest.contactInfo) {
      if (!updateRequest.contactInfo.name || !updateRequest.contactInfo.email) {
        return commonErrors.badRequest('Contact name and email are required');
      }
    }

    const updatedBooking = await bookingService.updateBooking(bookingId, userId, updateRequest);

    return successResponse(updatedBooking);
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * Update booking handler
 * Updates a booking (only pending bookings can be updated)
 *
 * @route PUT /api/bookings/{id}
 */
export const handler = withRbac(baseHandler, 'bookings', 'update');
