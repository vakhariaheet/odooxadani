import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { EventService } from '../services/EventService';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';

const eventService = new EventService();

/**
 * Handler for getting events by category
 * GET /api/events/category/:category
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    // Get category from path parameters
    const category = event.pathParameters?.['category'];
    if (!category) {
      return commonErrors.badRequest('Category parameter is required');
    }

    // Validate category
    const validCategories = [
      'music',
      'sports',
      'business',
      'technology',
      'arts',
      'food',
      'education',
      'health',
      'other',
    ];
    if (!validCategories.includes(category)) {
      return commonErrors.badRequest('Invalid category');
    }

    // Parse limit from query parameters
    let limit = 20;
    if (event.queryStringParameters?.['limit']) {
      const parsedLimit = parseInt(event.queryStringParameters['limit'], 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 50) {
        limit = parsedLimit;
      }
    }

    // Get events by category
    const events = await eventService.getEventsByCategoryEnhanced(category, limit);

    return successResponse({
      events,
      category,
      totalCount: events.length,
    });
  } catch (error) {
    return handleAsyncError(error);
  }
};

export const handler = baseHandler;
