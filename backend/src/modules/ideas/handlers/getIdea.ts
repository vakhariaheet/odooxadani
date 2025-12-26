import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { successResponse, commonErrors, handleAsyncError } from '../../../shared/response';
import { ideaService } from '../services/IdeaService';

/**
 * @route GET /api/ideas/:id
 * @description Get idea by ID
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const ideaId = event.pathParameters?.['id'];

    if (!ideaId) {
      return commonErrors.badRequest('Idea ID is required');
    }

    const idea = await ideaService.getIdea(ideaId);

    if (!idea) {
      return commonErrors.notFound('Idea');
    }

    return successResponse(idea);
  } catch (error) {
    return handleAsyncError(error);
  }
};

export const handler = withRbac(baseHandler, 'ideas', 'read');
