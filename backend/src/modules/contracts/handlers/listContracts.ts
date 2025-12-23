import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { ContractService } from '../services/ContractService';
import { ListContractsQuery } from '../types';

const contractService = new ContractService();

/**
 * Base handler for listing contracts
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId, role } = getAuthContext(event);

    // Parse query parameters
    const query: ListContractsQuery = {};

    if (event.queryStringParameters) {
      const { status, limit, offset } = event.queryStringParameters;

      if (status) {
        query.status = status as any;
      }

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
    }

    const result = await contractService.listContracts(userId, role, query);
    return successResponse(result);
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * List contracts handler
 * Returns contracts based on user role:
 * - Freelancers: contracts they created
 * - Clients: contracts sent to them
 * - Admins: all contracts
 *
 * @route GET /api/contracts
 */
export const handler = withRbacOwn(baseHandler, 'contracts', 'read');
