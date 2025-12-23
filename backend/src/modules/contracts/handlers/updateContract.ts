import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { ContractService } from '../services/ContractService';
import { UpdateContractRequest } from '../types';

const contractService = new ContractService();

/**
 * Base handler for updating a contract
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

    if (!event.body) {
      return commonErrors.badRequest('Request body is required');
    }

    // Get existing contract to check permissions
    const existingContract = await contractService.getContract(contractId);
    if (!existingContract) {
      return commonErrors.notFound('Contract');
    }

    // Check update permissions
    if (!contractService.canUpdateContract(existingContract, userId, role)) {
      return commonErrors.forbidden('You cannot update this contract');
    }

    const updates: UpdateContractRequest = JSON.parse(event.body);

    // Validate amount if provided
    if (
      updates.amount !== undefined &&
      (typeof updates.amount !== 'number' || updates.amount <= 0)
    ) {
      return commonErrors.badRequest('Amount must be a positive number');
    }

    // Validate deliverables if provided
    if (
      updates.deliverables !== undefined &&
      (!Array.isArray(updates.deliverables) || updates.deliverables.length === 0)
    ) {
      return commonErrors.badRequest('Deliverables must be a non-empty array');
    }

    const contract = await contractService.updateContract(contractId, updates);
    return successResponse({ contract });
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * Update contract handler
 * Allows freelancers to update their contracts (if not signed)
 *
 * @route PUT /api/contracts/:id
 */
export const handler = withRbacOwn(baseHandler, 'contracts', 'update');
