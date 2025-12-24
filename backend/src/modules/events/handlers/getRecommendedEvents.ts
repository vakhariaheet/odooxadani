import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { EventService } from '../services/EventService';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';

const eventService = new EventService();

/**
 * Handler for getting personalized event recommendations
 * GET /api/events/recommended
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    // Get user context (required for recommendations)
    const authContext = getAuthContext(event);
    const { userId } = authContext;

    // Parse limit from query parameters
    let limit = 10;
    if (event.queryStringParameters?.['limit']) {
      const parsedLimit = parseInt(event.queryStringParameters['limit'], 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 20) {
        limit = parsedLimit;
      }
    }

    // Get recommended events
    const events = await eventService.getRecommendedEvents(userId);

    return successResponse({
      events: events.slice(0, limit),
      userId,
      totalCount: events.length,
    });
  } catch (error) {
    return handleAsyncError(error);
  }
};

export const handler = baseHandler;
