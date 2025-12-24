import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { EventService } from '../services/EventService';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';

const eventService = new EventService();

/**
 * Handler for getting popular/trending events
 * GET /api/events/popular
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    // Parse timeframe from query parameters
    let timeframe: 'week' | 'month' = 'week';
    if (event.queryStringParameters?.['timeframe']) {
      const tf = event.queryStringParameters['timeframe'];
      if (tf === 'week' || tf === 'month') {
        timeframe = tf;
      }
    }

    // Parse limit from query parameters
    let limit = 20;
    if (event.queryStringParameters?.['limit']) {
      const parsedLimit = parseInt(event.queryStringParameters['limit'], 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 50) {
        limit = parsedLimit;
      }
    }

    // Get popular events
    const events = await eventService.getPopularEvents(timeframe);

    return successResponse({
      events: events.slice(0, limit),
      timeframe,
      totalCount: events.length,
    });
  } catch (error) {
    return handleAsyncError(error);
  }
};

export const handler = baseHandler;
