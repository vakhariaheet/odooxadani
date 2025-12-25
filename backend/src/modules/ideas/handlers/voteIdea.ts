import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { IdeaService } from '../services/IdeaService';
import { VoteIdeaRequest } from '../types';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';

const ideaService = new IdeaService();

/**
 * Base handler for voting on an idea
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

    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Request body is required',
        }),
      };
    }

    const data: VoteIdeaRequest = JSON.parse(event.body);

    // Validate vote value
    if (data.vote !== 1 && data.vote !== -1) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Vote must be 1 (upvote) or -1 (downvote)',
        }),
      };
    }

    const { userId } = getAuthContext(event);
    await ideaService.voteIdea(ideaId, userId, data.vote);

    return successResponse({
      message: data.vote === 1 ? 'Upvoted successfully' : 'Downvoted successfully',
    });
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * Vote idea handler
 * Allows users to vote on ideas (upvote/downvote)
 *
 * @route POST /api/ideas/:id/vote
 */
export const handler = withRbac(baseHandler, 'ideas', 'update');
