import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { ProposalService } from '../services/ProposalService';

const proposalService = new ProposalService();

/**
 * Base handler for deleting a proposal
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

    await proposalService.deleteProposal(proposalId, userId, role);
    return successResponse({ message: 'Proposal deleted successfully' }, 204);
  } catch (error: any) {
    if (error.message === 'Proposal not found') {
      return commonErrors.notFound('Proposal');
    }
    if (error.message.includes('Access denied')) {
      return commonErrors.forbidden(error.message);
    }
    if (error.message.includes('Cannot delete')) {
      return commonErrors.badRequest(error.message);
    }
    return handleAsyncError(error);
  }
};

/**
 * Delete proposal handler
 * Deletes proposal (freelancers only, cannot delete accepted proposals)
 *
 * @route DELETE /api/proposals/:id
 */
export const handler = withRbacOwn(baseHandler, 'proposals', 'delete');
