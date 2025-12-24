import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { EventService } from '../services/EventService';
import { UpdateEventRequest } from '../types';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';

const eventService = new EventService();

/**
 * Base handler for updating events
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId } = getAuthContext(event);
    const eventId = event.pathParameters?.['id'];

    if (!eventId) {
      return commonErrors.badRequest('Event ID is required');
    }

    if (!event.body) {
      return commonErrors.badRequest('Request body is required');
    }

    let updateData: UpdateEventRequest;
    try {
      updateData = JSON.parse(event.body);
    } catch {
      return commonErrors.badRequest('Invalid JSON in request body');
    }

    // Validate numeric fields if provided
    if (updateData.maxAttendees !== undefined && updateData.maxAttendees <= 0) {
      return commonErrors.validationError('Max attendees must be greater than 0');
    }

    if (updateData.price !== undefined && updateData.price < 0) {
      return commonErrors.validationError('Price cannot be negative');
    }

    // Validate dates if provided
    if (updateData.startDate) {
      const startDate = new Date(updateData.startDate);
      if (isNaN(startDate.getTime())) {
        return commonErrors.validationError('Invalid start date format. Use ISO 8601 format');
      }
    }

    if (updateData.endDate) {
      const endDate = new Date(updateData.endDate);
      if (isNaN(endDate.getTime())) {
        return commonErrors.validationError('Invalid end date format. Use ISO 8601 format');
      }
    }

    // Validate location if provided
    if (updateData.location) {
      if (!updateData.location.address || !updateData.location.city) {
        return commonErrors.validationError('Location must include address and city');
      }
    }

    const updatedEvent = await eventService.updateEvent(eventId, updateData, userId);
    return successResponse(updatedEvent);
  } catch (error: any) {
    if (error.message === 'Event not found') {
      return commonErrors.notFound('Event');
    }
    if (error.message === 'Not authorized to update this event') {
      return commonErrors.forbidden('You can only update your own events');
    }
    if (error.message.includes('End date must be after start date')) {
      return commonErrors.validationError(error.message);
    }
    return handleAsyncError(error);
  }
};

/**
 * Update event handler - Own events only
 *
 * @route PUT /api/events/:id
 */
export const handler = withRbac(baseHandler, 'events', 'update');
