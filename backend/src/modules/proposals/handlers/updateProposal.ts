import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { ProposalService } from '../services/ProposalService';
import { UpdateProposalRequest } from '../types';

const proposalService = new ProposalService();

/**
 * Base handler for updating a proposal
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

    if (!event.body) {
      return commonErrors.badRequest('Request body is required');
    }

    let requestData: UpdateProposalRequest;
    try {
      requestData = JSON.parse(event.body);
    } catch (error) {
      return commonErrors.badRequest('Invalid JSON in request body');
    }

    // Validate data if provided
    if (requestData.amount !== undefined && requestData.amount <= 0) {
      return commonErrors.validationError('Amount must be greater than 0');
    }

    if (requestData.clientEmail && !requestData.clientEmail.trim()) {
      return commonErrors.validationError('Client email cannot be empty');
    }

    if (requestData.deliverables && requestData.deliverables.length === 0) {
      return commonErrors.validationError('At least one deliverable is required');
    }

    const proposal = await proposalService.updateProposal(proposalId, userId, role, requestData);
    return successResponse({ proposal });
  } catch (error: any) {
    if (error.message === 'Proposal not found') {
      return commonErrors.notFound('Proposal');
    }
    if (error.message.includes('Access denied')) {
      return commonErrors.forbidden(error.message);
    }
    if (error.message.includes('validation') || error.message.includes('required')) {
      return commonErrors.validationError(error.message);
    }
    return handleAsyncError(error);
  }
};

/**
 * Update proposal handler
 * Updates proposal with role-based permissions
 * Freelancers can update all fields, clients can only update status
 *
 * @route PUT /api/proposals/:id
 */
export const handler = withRbacOwn(baseHandler, 'proposals', 'update');
