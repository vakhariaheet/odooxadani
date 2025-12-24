import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { EventService } from '../services/EventService';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';

const eventService = new EventService();

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

    // Get user context (optional for public events)
    let userId: string | undefined;
    try {
      const authContext = getAuthContext(event);
      userId = authContext.userId;
    } catch {
      // User not authenticated - that's okay for public events
    }

    const eventData = await eventService.getEvent(eventId, userId);

    if (!eventData) {
      return commonErrors.notFound('Event');
    }

    return successResponse(eventData);
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * Get event handler - Public access for published events, owner access for all statuses
 *
 * @route GET /api/events/:id
 */
export const handler = baseHandler; // Remove RBAC to allow public access
