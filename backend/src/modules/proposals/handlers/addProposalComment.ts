import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';
import { handleAsyncError } from '../../../shared/response';
import { ProposalService } from '../services/ProposalService';
import { AddCommentRequest } from '../types';

const proposalService = new ProposalService();

/**
 * Base handler for adding proposal comments
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId, role } = getAuthContext(event);
    const proposalId = event.pathParameters?.['id'];
    const userName = 'User'; // Would get from user profile in production

    if (!proposalId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Proposal ID is required',
          },
        }),
      };
    }

    const body: AddCommentRequest = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!body.content?.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Comment content is required',
          },
        }),
      };
    }

    const comment = await proposalService.addProposalComment(
      proposalId,
      userId,
      role,
      userName,
      body
    );

    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        data: { comment },
      }),
    };
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * POST /api/proposals/:id/comments
 * Add a comment to a proposal
 */
export const handler = withRbacOwn(baseHandler, 'proposals', 'update');
