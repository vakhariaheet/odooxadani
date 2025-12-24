import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { ProposalService } from '../services/ProposalService';

const proposalService = new ProposalService();

/**
 * Base handler for getting proposal comments
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId, role } = getAuthContext(event);
    const proposalId = event.pathParameters?.['id'];

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

    const comments = await proposalService.getProposalComments(proposalId, userId, role);
    return successResponse({ comments });
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * GET /api/proposals/:id/comments
 * Get comments for a proposal
 */
export const handler = withRbacOwn(baseHandler, 'proposals', 'read');
