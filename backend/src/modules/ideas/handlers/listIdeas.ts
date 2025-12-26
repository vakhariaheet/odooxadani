import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { ideaService } from '../services/IdeaService';
import { ListIdeasQuery } from '../types';

/**
 * @route GET /api/ideas
 * @description List ideas with filtering and pagination
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
        search,
        techStack,
        complexityLevel,
        timeCommitment,
        status,
        creatorId,
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

      if (search && search.trim()) {
        query.search = search.trim();
      }

      if (techStack) {
        // Support comma-separated tech stack filter
        query.techStack = techStack
          .split(',')
          .map((tech) => tech.trim())
          .filter(Boolean);
      }

      if (complexityLevel && ['beginner', 'intermediate', 'advanced'].includes(complexityLevel)) {
        query.complexityLevel = complexityLevel as 'beginner' | 'intermediate' | 'advanced';
      }

      if (timeCommitment && ['weekend', 'week', 'month'].includes(timeCommitment)) {
        query.timeCommitment = timeCommitment as 'weekend' | 'week' | 'month';
      }

      if (status && ['draft', 'published', 'archived'].includes(status)) {
        query.status = status as 'draft' | 'published' | 'archived';
      }

      if (creatorId && creatorId.trim()) {
        query.creatorId = creatorId.trim();
      }

      if (sortBy && ['createdAt', 'updatedAt', 'title'].includes(sortBy)) {
        query.sortBy = sortBy as 'createdAt' | 'updatedAt' | 'title';
      }

      if (sortOrder && ['asc', 'desc'].includes(sortOrder)) {
        query.sortOrder = sortOrder as 'asc' | 'desc';
      }
    }

    const result = await ideaService.listIdeas(query);
    return successResponse(result);
  } catch (error) {
    return handleAsyncError(error);
  }
};

export const handler = withRbac(baseHandler, 'ideas', 'read');
