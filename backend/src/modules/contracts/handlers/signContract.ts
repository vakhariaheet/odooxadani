import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { ContractService } from '../services/ContractService';
import { SignContractRequest } from '../types';

const contractService = new ContractService();

/**
 * Base handler for signing a contract
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId, email } = getAuthContext(event);
    const contractId = event.pathParameters?.['id'];

    if (!contractId) {
      return commonErrors.badRequest('Contract ID is required');
    }

    if (!event.body) {
      return commonErrors.badRequest('Request body is required');
    }

    const request: SignContractRequest = JSON.parse(event.body);

    if (!request.signerName || !request.signerName.trim()) {
      return commonErrors.badRequest('Signer name is required');
    }

    // Get contract to check permissions
    const contract = await contractService.getContract(contractId);
    if (!contract) {
      return commonErrors.notFound('Contract');
    }

    // Check signing permissions
    if (!contractService.canSignContract(contract, userId)) {
      return commonErrors.forbidden('You cannot sign this contract');
    }

    // Extract IP address and user agent for audit trail
    const ipAddress = event.requestContext.http.sourceIp;
    const userAgent = event.headers['user-agent'] || '';

    const result = await contractService.signContract(
      contractId,
      userId,
      email,
      request.signerName.trim(),
      ipAddress,
      userAgent
    );

    return successResponse(result);
  } catch (error) {
    // Handle specific business logic errors
    if (error instanceof Error) {
      if (
        error.message.includes('already signed') ||
        error.message.includes('must be in sent status')
      ) {
        return commonErrors.badRequest(error.message);
      }
    }
    return handleAsyncError(error);
  }
};

/**
 * Sign contract handler
 * Allows clients to digitally sign contracts sent to them
 *
 * @route POST /api/contracts/:id/sign
 */
export const handler = withRbacOwn(baseHandler, 'contracts', 'update');
