import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { ProposalService } from '../services/ProposalService';

const proposalService = new ProposalService();

/**
 * Base handler for getting proposal versions
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

    const versions = await proposalService.getProposalVersions(proposalId, userId, role);
    return successResponse({ versions });
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * GET /api/proposals/:id/versions
 * Get version history for a proposal
 */
export const handler = withRbacOwn(baseHandler, 'proposals', 'read');
