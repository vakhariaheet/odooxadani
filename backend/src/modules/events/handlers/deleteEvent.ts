import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { EventService } from '../services/EventService';
import {
  successResponse,
  handleAsyncError,
  commonErrors,
  HTTP_STATUS,
} from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';

const eventService = new EventService();

/**
 * Base handler for deleting events
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

    await eventService.deleteEvent(eventId, userId);

    return successResponse({ message: 'Event deleted successfully' }, HTTP_STATUS.NO_CONTENT);
  } catch (error: any) {
    if (error.message === 'Event not found') {
      return commonErrors.notFound('Event');
    }
    if (error.message === 'Not authorized to delete this event') {
      return commonErrors.forbidden('You can only delete your own events');
    }
    return handleAsyncError(error);
  }
};

/**
 * Delete event handler - Own events only
 *
 * @route DELETE /api/events/:id
 */
export const handler = withRbac(baseHandler, 'events', 'delete');
