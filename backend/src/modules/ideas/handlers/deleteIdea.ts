import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { IdeaService } from '../services/IdeaService';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';

const ideaService = new IdeaService();

/**
 * Base handler for deleting an idea
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

    const { userId } = getAuthContext(event);
    await ideaService.deleteIdea(ideaId, userId);

    return successResponse({ message: 'Idea deleted successfully' });
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * Delete idea handler
 * Deletes an idea (owner only)
 *
 * @route DELETE /api/ideas/:id
 */
export const handler = withRbacOwn(baseHandler, 'ideas', 'delete');
