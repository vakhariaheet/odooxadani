import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { TemplateService } from '../services/TemplateService';
import { ListTemplatesQuery, TemplateCategory } from '../types';

const templateService = new TemplateService();

/**
 * Base handler for listing templates
 * Returns public templates + user's own templates
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId } = getAuthContext(event);

    // Parse query parameters
    const query: ListTemplatesQuery = {};

    if (event.queryStringParameters) {
      const { limit, offset, category, isPublic, search, sortBy, sortOrder } =
        event.queryStringParameters;

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

      if (category && Object.values(TemplateCategory).includes(category as TemplateCategory)) {
        query.category = category as TemplateCategory;
      }

      if (isPublic !== undefined) {
        query.isPublic = isPublic === 'true';
      }

      if (search && search.trim()) {
        query.search = search.trim();
      }

      if (sortBy && ['createdAt', 'updatedAt', 'usageCount', 'name'].includes(sortBy)) {
        query.sortBy = sortBy as ListTemplatesQuery['sortBy'];
      }

      if (sortOrder && ['asc', 'desc'].includes(sortOrder)) {
        query.sortOrder = sortOrder as 'asc' | 'desc';
      }
    }

    const result = await templateService.listTemplates(userId, query);
    return successResponse(result);
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * List templates handler
 * GET /api/templates
 *
 * Returns public templates + user's own templates
 * Supports filtering by category, search, and pagination
 */
export const handler = withRbac(baseHandler, 'templates', 'read');
