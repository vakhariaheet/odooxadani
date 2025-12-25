import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { VenueService } from '../services/VenueService';
import { VenueSearchQuery } from '../types';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';

const venueService = new VenueService();

/**
 * Base handler for listing venues (public endpoint)
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    // Parse query parameters
    const query: VenueSearchQuery = {};

    if (event.queryStringParameters) {
      const {
        limit,
        offset,
        city,
        category,
        minCapacity,
        maxCapacity,
        amenities,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder
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

      if (city && city.trim()) {
        query.city = city.trim();
      }

      if (category) {
        query.category = category as any;
      }

      if (minCapacity) {
        const parsed = parseInt(minCapacity, 10);
        if (!isNaN(parsed) && parsed > 0) {
          query.minCapacity = parsed;
        }
      }

      if (maxCapacity) {
        const parsed = parseInt(maxCapacity, 10);
        if (!isNaN(parsed) && parsed > 0) {
          query.maxCapacity = parsed;
        }
      }

      if (amenities) {
        query.amenities = amenities.split(',').map(a => a.trim()).filter(Boolean);
      }

      if (minPrice) {
        const parsed = parseFloat(minPrice);
        if (!isNaN(parsed) && parsed >= 0) {
          query.minPrice = parsed;
        }
      }

      if (maxPrice) {
        const parsed = parseFloat(maxPrice);
        if (!isNaN(parsed) && parsed >= 0) {
          query.maxPrice = parsed;
        }
      }

      if (sortBy && ['price', 'capacity', 'name', 'createdAt'].includes(sortBy)) {
        query.sortBy = sortBy as any;
      }

      if (sortOrder && ['asc', 'desc'].includes(sortOrder)) {
        query.sortOrder = sortOrder as any;
      }
    }

    const result = await venueService.listVenues(query);
    
    return successResponse(result);
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * List venues handler - Public endpoint for venue search
 * Returns paginated list of active venues with search/filter capabilities
 *
 * @route GET /api/venues
 */
export const handler = withRbac(baseHandler, 'venues', 'read');