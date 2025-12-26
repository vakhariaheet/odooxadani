import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { successResponse, commonErrors, handleAsyncError } from '../../../shared/response';
import { ideaService } from '../services/IdeaService';
import { EnhanceIdeaRequest } from '../types';

/**
 * @route POST /api/ideas/enhance
 * @description Enhance idea description using AI
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const body: EnhanceIdeaRequest = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!body.description) {
      return commonErrors.badRequest('Description is required');
    }

    if (body.description.length < 50) {
      return commonErrors.badRequest('Description must be at least 50 characters');
    }

    if (body.description.length > 2000) {
      return commonErrors.badRequest('Description must be less than 2000 characters');
    }

    // Call service
    const result = await ideaService.enhanceIdea(body);
    return successResponse(result);
  } catch (error) {
    return handleAsyncError(error);
  }
};

export const handler = withRbac(baseHandler, 'ideas', 'create');
