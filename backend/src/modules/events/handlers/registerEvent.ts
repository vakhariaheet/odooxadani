import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { eventService } from '../services/EventService';
import { EventRegistrationRequest } from '../types';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';

/**
 * Base handler for registering for an event
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

    const requestData: EventRegistrationRequest = JSON.parse(event.body);

    // Validation
    if (!requestData.skills || !Array.isArray(requestData.skills)) {
      return commonErrors.badRequest('Skills array is required');
    }

    // Get user info from JWT claims
    const { userId, email: userEmail } = getAuthContext(event);
    const userName = userEmail; // Using email as name for now

    await eventService.registerForEvent(eventId, userId, userName, userEmail, requestData);
    return successResponse({ message: 'Successfully registered for event' });
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * Register for event handler
 * Registers the current user for an event
 *
 * @route POST /api/events/{id}/register
 */
export const handler = withRbac(baseHandler, 'events', 'update');
