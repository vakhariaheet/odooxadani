import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { eventService } from '../services/EventService';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';

/**
 * Base handler for deleting an event
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const eventId = event.pathParameters?.['id'];

    if (!eventId) {
      return commonErrors.badRequest('Event ID is required');
    }

    // Get user info from JWT claims
    const { userId: organizerId } = getAuthContext(event);

    await eventService.deleteEvent(eventId, organizerId);
    return successResponse({ message: 'Event deleted successfully' });
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * Delete event handler
 * Soft deletes an event by changing status to cancelled (owner only)
 *
 * @route DELETE /api/events/{id}
 */
export const handler = withRbacOwn(baseHandler, 'events', 'delete');
