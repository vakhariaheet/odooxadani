import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { TemplateService } from '../services/TemplateService';

const templateService = new TemplateService();

/**
 * Base handler for getting a single template
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId } = getAuthContext(event);
    const templateId = event.pathParameters?.['id'];

    if (!templateId) {
      return commonErrors.badRequest('Template ID is required');
    }

    const template = await templateService.getTemplate(templateId, userId);

    if (!template) {
      return commonErrors.notFound('Template not found');
    }

    return successResponse(template);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return commonErrors.forbidden(error.message);
    }
    return handleAsyncError(error);
  }
};

/**
 * Get template handler
 * GET /api/templates/:id
 *
 * Returns template if it's public or owned by the user
 */
export const handler = withRbac(baseHandler, 'templates', 'read');
