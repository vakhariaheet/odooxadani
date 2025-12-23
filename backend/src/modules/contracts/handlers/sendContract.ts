import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { ContractService } from '../services/ContractService';

const contractService = new ContractService();

/**
 * Base handler for sending a contract to client
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

    // Get existing contract to check permissions
    const existingContract = await contractService.getContract(contractId);
    if (!existingContract) {
      return commonErrors.notFound('Contract');
    }

    // Check update permissions (only freelancer can send their contracts)
    if (!contractService.canUpdateContract(existingContract, userId, role)) {
      return commonErrors.forbidden('You cannot send this contract');
    }

    if (existingContract.status !== 'draft') {
      return commonErrors.badRequest('Only draft contracts can be sent');
    }

    const contract = await contractService.sendContract(contractId);
    return successResponse({ contract });
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * Send contract handler
 * Changes contract status from draft to sent and notifies client
 *
 * @route POST /api/contracts/:id/send
 */
export const handler = withRbacOwn(baseHandler, 'contracts', 'update');
