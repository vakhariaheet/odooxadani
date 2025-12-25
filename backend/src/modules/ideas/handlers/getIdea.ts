import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { IdeaService } from '../services/IdeaService';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';

const ideaService = new IdeaService();

/**
 * Base handler for getting a single idea
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const ideaId = event.pathParameters?.['id'];

    if (!ideaId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Idea ID is required',
        }),
      };
    }

    const idea = await ideaService.getIdea(ideaId);
    return successResponse(idea);
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * Get idea handler
 * Returns a single idea by ID
 *
 * @route GET /api/ideas/:id
 */
export const handler = withRbac(baseHandler, 'ideas', 'read');
