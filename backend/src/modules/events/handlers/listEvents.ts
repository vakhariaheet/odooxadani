import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { eventService } from '../services/EventService';
import { ListEventsQuery } from '../types';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';

/**
 * Base handler for listing events
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    // Parse query parameters
    const query: ListEventsQuery = {};

    if (event.queryStringParameters) {
      const {
        limit,
        offset,
        status,
        category,
        location,
        organizerId,
        isPublic,
        search,
        sortBy,
        sortOrder,
      } = event.queryStringParameters;

      if (limit) {
        const parsedLimit = parseInt(limit, 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100) {
          query.limit = parsedLimit;
        }
      }

      if (offset) {
        const parsedOffset = parseInt(offset, 10);
        if (!isNaN(parsedOffset) && parsedOffset >= 0) {
          query.offset = parsedOffset;
        }
      }

      if (status && ['draft', 'published', 'ongoing', 'completed', 'cancelled'].includes(status)) {
        query.status = status as any;
      }

      if (category && category.trim()) {
        query.category = category.trim();
      }

      if (location && location.trim()) {
        query.location = location.trim();
      }

      if (organizerId && organizerId.trim()) {
        query.organizerId = organizerId.trim();
      }

      if (isPublic !== undefined) {
        query.isPublic = isPublic === 'true';
      }

      if (search && search.trim()) {
        query.search = search.trim();
      }

      if (
        sortBy &&
        ['startDate', 'createdAt', 'trendScore', 'currentParticipants'].includes(sortBy)
      ) {
        query.sortBy = sortBy as any;
      }

      if (sortOrder && ['asc', 'desc'].includes(sortOrder)) {
        query.sortOrder = sortOrder as any;
      }
    }

    const result = await eventService.listEvents(query);
    return successResponse(result);
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * List events handler
 * Returns paginated list of events with filtering options
 *
 * @route GET /api/events
 */
export const handler = withRbac(baseHandler, 'events', 'read');
