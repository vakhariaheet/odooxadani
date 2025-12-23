import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { ProposalService } from '../services/ProposalService';

const proposalService = new ProposalService();

/**
 * Base handler for getting a single proposal
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId, role } = getAuthContext(event);
    const proposalId = event.pathParameters?.['id'];

    if (!proposalId) {
      return commonErrors.badRequest('Proposal ID is required');
    }

    const proposal = await proposalService.getProposal(proposalId, userId, role);
    return successResponse({ proposal });
  } catch (error: any) {
    if (error.message === 'Proposal not found') {
      return commonErrors.notFound('Proposal');
    }
    if (error.message.includes('Access denied')) {
      return commonErrors.forbidden(error.message);
    }
    return handleAsyncError(error);
  }
};

/**
 * Get proposal handler
 * Returns single proposal with role-based access control
 *
 * @route GET /api/proposals/:id
 */
export const handler = withRbacOwn(baseHandler, 'proposals', 'read');
