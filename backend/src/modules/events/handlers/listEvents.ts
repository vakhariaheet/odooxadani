import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { EventService } from '../services/EventService';
import { EventListQuery } from '../types';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';

const eventService = new EventService();

/**
 * Base handler for listing events
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    // Get user context (optional for public events)
    let userId: string | undefined;
    try {
      const authContext = getAuthContext(event);
      userId = authContext.userId;
    } catch {
      // User not authenticated - that's okay for public event listing
    }

    // Parse query parameters
    const query: EventListQuery = {};

    if (event.queryStringParameters) {
      const { limit, offset, category, city, startDate, endDate, status, organizerId } =
        event.queryStringParameters;

      if (limit) {
        const parsedLimit = parseInt(limit, 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 50) {
          query.limit = parsedLimit;
        }
      }

      if (offset) {
        const parsedOffset = parseInt(offset, 10);
        if (!isNaN(parsedOffset) && parsedOffset >= 0) {
          query.offset = parsedOffset;
        }
      }

      if (category) {
        query.category = category as any;
      }

      if (city && city.trim()) {
        query.city = city.trim();
      }

      if (startDate) {
        const date = new Date(startDate);
        if (!isNaN(date.getTime())) {
          query.startDate = startDate;
        }
      }

      if (endDate) {
        const date = new Date(endDate);
        if (!isNaN(date.getTime())) {
          query.endDate = endDate;
        }
      }

      if (status) {
        query.status = status as any;
      }

      if (organizerId) {
        // Only allow filtering by organizerId if it's the current user
        if (userId && organizerId === userId) {
          query.organizerId = organizerId;
        } else if (!userId) {
          return commonErrors.unauthorized('Authentication required to filter by organizer');
        } else {
          return commonErrors.forbidden('Can only filter by your own events');
        }
      }
    }

    const result = await eventService.listEvents(query, userId);
    return successResponse(result);
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * List events handler - Public access for published events, authenticated for own events
 *
 * @route GET /api/events
 */
export const handler = baseHandler; // Remove RBAC to allow public access
