import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';
import {
  successResponse,
  handleAsyncError,
  commonErrors,
  HTTP_STATUS,
} from '../../../shared/response';
import { ContractService } from '../services/ContractService';
import { CreateContractRequest } from '../types';

const contractService = new ContractService();

/**
 * Base handler for creating a contract
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId, role } = getAuthContext(event);

    // Only freelancers can create contracts
    if (role !== 'freelancer' && role !== 'admin') {
      return commonErrors.forbidden('Only freelancers can create contracts');
    }

    if (!event.body) {
      return commonErrors.badRequest('Request body is required');
    }

    const request: CreateContractRequest = JSON.parse(event.body);

    // Validate required fields
    const requiredFields = [
      'title',
      'content',
      'clientId',
      'clientEmail',
      'amount',
      'currency',
      'deliverables',
      'timeline',
      'terms',
    ];
    const missingFields = requiredFields.filter(
      (field) => !request[field as keyof CreateContractRequest]
    );

    if (missingFields.length > 0) {
      return commonErrors.badRequest(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate data types
    if (typeof request.amount !== 'number' || request.amount <= 0) {
      return commonErrors.badRequest('Amount must be a positive number');
    }

    if (!Array.isArray(request.deliverables) || request.deliverables.length === 0) {
      return commonErrors.badRequest('Deliverables must be a non-empty array');
    }

    const contract = await contractService.createContract(userId, request);
    return successResponse({ contract }, HTTP_STATUS.CREATED);
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * Create contract handler
 * Allows freelancers to create new contracts
 *
 * @route POST /api/contracts
 */
export const handler = withRbacOwn(baseHandler, 'contracts', 'create');
