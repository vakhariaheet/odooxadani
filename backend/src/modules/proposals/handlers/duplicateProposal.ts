import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';
import { handleAsyncError } from '../../../shared/response';
import { ProposalService } from '../services/ProposalService';

const proposalService = new ProposalService();

/**
 * Base handler for duplicating proposals
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

    const newProposal = await proposalService.duplicateProposal(proposalId, userId, role);

    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        data: { proposal: newProposal },
      }),
    };
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * POST /api/proposals/:id/duplicate
 * Duplicate a proposal
 */
export const handler = withRbacOwn(baseHandler, 'proposals', 'create');
