import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { ProposalService } from '../services/ProposalService';
import { ListProposalsQuery } from '../types';

const proposalService = new ProposalService();

/**
 * Base handler for listing proposals
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId, role } = getAuthContext(event);

    // Parse query parameters
    const query: ListProposalsQuery = {};

    if (event.queryStringParameters) {
      const { limit, offset, status, clientEmail, sortBy, sortOrder } = event.queryStringParameters;

      if (limit) {
        const parsedLimit = parseInt(limit, 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100) {
          query.limit = parsedLimit;
        }
      }

      if (offset) {
        const parsedOffset = parseInt(offset, 10);
        if (!isNaN(parsedOffset) && parsedOffset >= 0) {
          query.offset = parsedOffset;
        }
      }

      if (status && ['draft', 'sent', 'viewed', 'accepted', 'rejected'].includes(status)) {
        query.status = status as any;
      }

      if (clientEmail && clientEmail.trim()) {
        query.clientEmail = clientEmail.trim();
      }

      if (sortBy && ['createdAt', 'updatedAt', 'amount'].includes(sortBy)) {
        query.sortBy = sortBy as any;
      }

      if (sortOrder && ['asc', 'desc'].includes(sortOrder)) {
        query.sortOrder = sortOrder as any;
      }
    }

    const result = await proposalService.listProposals(userId, role, query);
    return successResponse(result);
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * List proposals handler
 * Freelancers see their own proposals, clients see proposals sent to them, admins see all
 *
 * @route GET /api/proposals
 */
export const handler = withRbacOwn(baseHandler, 'proposals', 'read');
