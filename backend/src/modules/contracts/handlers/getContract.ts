import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { ContractService } from '../services/ContractService';

const contractService = new ContractService();

/**
 * Base handler for getting a single contract
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId, role } = getAuthContext(event);
    const contractId = event.pathParameters?.['id'];

    if (!contractId) {
      return commonErrors.badRequest('Contract ID is required');
    }

    const contract = await contractService.getContract(contractId);
    if (!contract) {
      return commonErrors.notFound('Contract');
    }

    // Check access permissions
    if (!contractService.canAccessContract(contract, userId, role)) {
      return commonErrors.forbidden('You do not have access to this contract');
    }

    return successResponse({ contract });
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * Get contract handler
 * Returns contract details if user has access
 *
 * @route GET /api/contracts/:id
 */
export const handler = withRbacOwn(baseHandler, 'contracts', 'read');
