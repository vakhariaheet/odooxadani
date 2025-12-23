import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { TemplateService } from '../services/TemplateService';

const templateService = new TemplateService();

/**
 * Base handler for deleting a template
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

    await templateService.deleteTemplate(templateId, userId);
    return successResponse({ message: 'Template deleted successfully' });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Template not found') {
        return commonErrors.notFound('Template not found');
      }
      if (error.message.includes('Access denied')) {
        return commonErrors.forbidden(error.message);
      }
    }
    return handleAsyncError(error);
  }
};

/**
 * Delete template handler
 * DELETE /api/templates/:id
 *
 * Deletes a template (owner only)
 */
export const handler = withRbac(baseHandler, 'templates', 'delete');
