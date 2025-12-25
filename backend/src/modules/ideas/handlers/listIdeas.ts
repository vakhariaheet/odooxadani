import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { IdeaService } from '../services/IdeaService';
import { ListIdeasQuery, isValidCategory, isValidDifficulty, isValidStatus } from '../types';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';

const ideaService = new IdeaService();

/**
 * Base handler for listing ideas
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    // Parse query parameters
    const query: ListIdeasQuery = {};

    if (event.queryStringParameters) {
      const {
        limit,
        offset,
        category,
        difficulty,
        skills,
        status,
        authorId,
        sortBy,
        sortOrder,
        search,
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

      if (category && isValidCategory(category)) {
        query.category = category;
      }

      if (difficulty && isValidDifficulty(difficulty)) {
        query.difficulty = difficulty;
      }

      if (skills) {
        query.skills = skills
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }

      if (status && isValidStatus(status)) {
        query.status = status;
      }

      if (authorId && authorId.trim()) {
        query.authorId = authorId.trim();
      }

      if (sortBy && ['created', 'updated', 'votes', 'feasibility'].includes(sortBy)) {
        query.sortBy = sortBy as ListIdeasQuery['sortBy'];
      }

      if (sortOrder && ['asc', 'desc'].includes(sortOrder)) {
        query.sortOrder = sortOrder as 'asc' | 'desc';
      }

      if (search && search.trim()) {
        query.search = search.trim();
      }
    }

    const result = await ideaService.listIdeas(query);
    return successResponse(result);
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * List ideas handler
 * Returns paginated list of ideas with filtering and search
 *
 * @route GET /api/ideas
 */
export const handler = withRbac(baseHandler, 'ideas', 'read');
