import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { successResponse, commonErrors, handleAsyncError } from '../../../shared/response';
import { ideaService } from '../services/IdeaService';
import { UpdateIdeaRequest } from '../types';

/**
 * @route PUT /api/ideas/:id
 * @description Update an existing idea (owner only)
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

    const body: UpdateIdeaRequest = JSON.parse(event.body || '{}');

    // Validate that at least one field is being updated
    const hasUpdates = Object.keys(body).length > 0;
    if (!hasUpdates) {
      return commonErrors.badRequest('At least one field must be updated');
    }

    const idea = await ideaService.updateIdea(ideaId, userId, body);
    return successResponse(idea);
  } catch (error) {
    return handleAsyncError(error);
  }
};

export const handler = withRbac(baseHandler, 'ideas', 'update');
