import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { ProposalService } from '../services/ProposalService';
import { CreateProposalRequest } from '../types';

const proposalService = new ProposalService();

/**
 * Base handler for creating a proposal
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId } = getAuthContext(event);

    if (!event.body) {
      return commonErrors.badRequest('Request body is required');
    }

    let requestData: CreateProposalRequest;
    try {
      requestData = JSON.parse(event.body);
    } catch (error) {
      return commonErrors.badRequest('Invalid JSON in request body');
    }

    // Validate required fields
    if (!requestData.title?.trim()) {
      return commonErrors.validationError('Title is required');
    }
    if (!requestData.description?.trim()) {
      return commonErrors.validationError('Description is required');
    }
    if (!requestData.clientEmail?.trim()) {
      return commonErrors.validationError('Client email is required');
    }
    if (!requestData.amount || requestData.amount <= 0) {
      return commonErrors.validationError('Amount must be greater than 0');
    }
    if (!requestData.deliverables?.length) {
      return commonErrors.validationError('At least one deliverable is required');
    }
    if (!requestData.timeline?.trim()) {
      return commonErrors.validationError('Timeline is required');
    }
    if (!requestData.terms?.trim()) {
      return commonErrors.validationError('Terms are required');
    }

    const proposal = await proposalService.createProposal(userId, requestData);
    return successResponse({ proposal }, 201);
  } catch (error: any) {
    if (error.message.includes('validation') || error.message.includes('required')) {
      return commonErrors.validationError(error.message);
    }
    return handleAsyncError(error);
  }
};

/**
 * Create proposal handler
 * Creates a new proposal (freelancers only)
 *
 * @route POST /api/proposals
 */
export const handler = withRbacOwn(baseHandler, 'proposals', 'create');
