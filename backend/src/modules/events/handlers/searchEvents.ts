import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { EventService } from '../services/EventService';
import { EventSearchQuery } from '../types';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';

const eventService = new EventService();

/**
 * Handler for advanced event search
 * GET /api/events/search
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    // Parse query parameters
    const query: EventSearchQuery = {};

    if (event.queryStringParameters) {
      const {
        q,
        query: searchQuery,
        category,
        city,
        lat,
        lng,
        radius,
        minPrice,
        maxPrice,
        startDate,
        endDate,
        tags,
        sortBy,
        sortOrder,
        limit,
        offset,
      } = event.queryStringParameters;

      // Search query
      if (q || searchQuery) {
        query.query = q || searchQuery;
      }

      // Category filter
      if (category) {
        query.category = category as any;
      }

      // City filter
      if (city) {
        query.city = city;
      }

      // Location filter
      if (lat && lng) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        if (!isNaN(latitude) && !isNaN(longitude)) {
          query.location = {
            lat: latitude,
            lng: longitude,
            radius: radius ? parseFloat(radius) : 50, // Default 50km radius
          };
        }
      }

      // Price range filter
      if (minPrice || maxPrice) {
        query.priceRange = {};
        if (minPrice) {
          const min = parseFloat(minPrice);
          if (!isNaN(min)) query.priceRange.min = min;
        }
        if (maxPrice) {
          const max = parseFloat(maxPrice);
          if (!isNaN(max)) query.priceRange.max = max;
        }
      }

      // Date range filter
      if (startDate || endDate) {
        query.dateRange = {};
        if (startDate) query.dateRange.startDate = startDate;
        if (endDate) query.dateRange.endDate = endDate;
      }

      // Tags filter
      if (tags) {
        query.tags = tags.split(',').map((tag) => tag.trim());
      }

      // Sorting
      if (sortBy) {
        query.sortBy = sortBy as any;
      }
      if (sortOrder) {
        query.sortOrder = sortOrder as any;
      }

      // Pagination
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
    }

    // Search events
    const result = await eventService.searchEvents(query);

    return successResponse(result);
  } catch (error) {
    return handleAsyncError(error);
  }
};

export const handler = baseHandler;
