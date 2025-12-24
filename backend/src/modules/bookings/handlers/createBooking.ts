import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { BookingService } from '../services/BookingService';
import { CreateBookingRequest } from '../types';
import {
  successResponse,
  handleAsyncError,
  commonErrors,
  HTTP_STATUS,
} from '../../../shared/response';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { getAuthContext } from '../../../shared/types';

const bookingService = new BookingService();

/**
 * Base handler for creating a new booking
 */
const baseHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId } = getAuthContext(event);

    if (!event.body) {
      return commonErrors.badRequest('Request body is required');
    }

    let createRequest: CreateBookingRequest;
    try {
      createRequest = JSON.parse(event.body);
    } catch (error) {
      return commonErrors.badRequest('Invalid JSON in request body');
    }

    // Validate required fields
    if (!createRequest.bookingType) {
      return commonErrors.badRequest('Booking type is required');
    }

    if (createRequest.bookingType === 'venue' && !createRequest.venueId) {
      return commonErrors.badRequest('Venue ID is required for venue bookings');
    }

    if (createRequest.bookingType === 'event' && !createRequest.eventId) {
      return commonErrors.badRequest('Event ID is required for event bookings');
    }

    if (!createRequest.startDate || !createRequest.endDate) {
      return commonErrors.badRequest('Start date and end date are required');
    }

    if (!createRequest.startTime || !createRequest.endTime) {
      return commonErrors.badRequest('Start time and end time are required');
    }

    if (!createRequest.attendeeCount || createRequest.attendeeCount <= 0) {
      return commonErrors.badRequest('Valid attendee count is required');
    }

    if (!createRequest.contactInfo?.name || !createRequest.contactInfo?.email) {
      return commonErrors.badRequest('Contact name and email are required');
    }

    // Create the booking
    const booking = await bookingService.createBooking(createRequest, userId);

    return successResponse(booking, HTTP_STATUS.CREATED);
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * Create booking handler
 * Creates a new booking with conflict checking and payment processing
 *
 * @route POST /api/bookings
 */
export const handler = withRbac(baseHandler, 'bookings', 'create');
