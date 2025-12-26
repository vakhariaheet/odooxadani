import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { eventService } from '../services/EventService';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';

/**
 * Base handler for getting a single event
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const eventId = event.pathParameters?.['id'];

    if (!eventId) {
      return commonErrors.badRequest('Event ID is required');
    }

    const eventData = await eventService.getEvent(eventId);
    return successResponse(eventData);
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * Get event handler
 * Returns single event details by ID
 *
 * @route GET /api/events/{id}
 */
export const handler = withRbac(baseHandler, 'events', 'read');
