import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { successResponse, commonErrors, handleAsyncError } from '../../../shared/response';
import { ideaService } from '../services/IdeaService';

/**
 * @route DELETE /api/ideas/:id
 * @description Delete an idea (owner only)
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId } = getAuthContext(event);
    const ideaId = event.pathParameters?.['id'];

    if (!ideaId) {
      return commonErrors.badRequest('Idea ID is required');
    }

    await ideaService.deleteIdea(ideaId, userId);
    return successResponse({ message: 'Idea deleted successfully' });
  } catch (error) {
    return handleAsyncError(error);
  }
};

export const handler = withRbac(baseHandler, 'ideas', 'delete');
