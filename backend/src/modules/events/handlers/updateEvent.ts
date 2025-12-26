import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { eventService } from '../services/EventService';
import { UpdateEventRequest } from '../types';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';

/**
 * Base handler for updating an event
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const eventId = event.pathParameters?.['id'];

    if (!eventId) {
      return commonErrors.badRequest('Event ID is required');
    }

    if (!event.body) {
      return commonErrors.badRequest('Request body is required');
    }

    const requestData: UpdateEventRequest = JSON.parse(event.body);

    // Date validation if dates are being updated
    if (requestData.startDate || requestData.endDate || requestData.registrationDeadline) {
      const existingEvent = await eventService.getEvent(eventId);

      const startDate = new Date(requestData.startDate || existingEvent.startDate);
      const endDate = new Date(requestData.endDate || existingEvent.endDate);
      const registrationDeadline = new Date(
        requestData.registrationDeadline || existingEvent.registrationDeadline
      );

      if (endDate <= startDate) {
        return commonErrors.badRequest('End date must be after start date');
      }

      if (registrationDeadline >= startDate) {
        return commonErrors.badRequest('Registration deadline must be before start date');
      }
    }

    // Validation for numeric fields
    if (requestData.maxParticipants !== undefined && requestData.maxParticipants <= 0) {
      return commonErrors.badRequest('Max participants must be greater than 0');
    }

    // Get user info from JWT claims
    const { userId: organizerId } = getAuthContext(event);

    const updatedEvent = await eventService.updateEvent(eventId, requestData, organizerId);
    return successResponse(updatedEvent);
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * Update event handler
 * Updates an existing event (owner only)
 *
 * @route PUT /api/events/{id}
 */
export const handler = withRbacOwn(baseHandler, 'events', 'update');
