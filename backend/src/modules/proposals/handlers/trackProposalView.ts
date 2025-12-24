import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { ProposalService } from '../services/ProposalService';
import { TrackViewRequest } from '../types';

const proposalService = new ProposalService();

/**
 * Base handler for tracking proposal views
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

    const body: TrackViewRequest = JSON.parse(event.body || '{}');

    // Validate required fields
    if (typeof body.timeSpent !== 'number' || body.timeSpent < 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Valid timeSpent (number >= 0) is required',
          },
        }),
      };
    }

    await proposalService.trackProposalView(proposalId, userId, role, body);
    return successResponse({ message: 'View tracked successfully' });
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * POST /api/proposals/:id/track-view
 * Track a view event for analytics
 */
export const handler = withRbacOwn(baseHandler, 'proposals', 'read');
