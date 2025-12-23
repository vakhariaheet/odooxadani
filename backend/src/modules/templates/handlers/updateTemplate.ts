import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { TemplateService } from '../services/TemplateService';
import { UpdateTemplateRequest, TemplateCategory } from '../types';

const templateService = new TemplateService();

/**
 * Base handler for updating a template
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

    if (!event.body) {
      return commonErrors.badRequest('Request body is required');
    }

    let request: UpdateTemplateRequest;
    try {
      request = JSON.parse(event.body);
    } catch {
      return commonErrors.badRequest('Invalid JSON in request body');
    }

    // Validate fields if provided
    if (request.name !== undefined) {
      if (!request.name.trim()) {
        return commonErrors.badRequest('Template name cannot be empty');
      }
      if (request.name.trim().length > 100) {
        return commonErrors.badRequest('Template name must be 100 characters or less');
      }
    }

    if (request.description !== undefined) {
      if (!request.description.trim()) {
        return commonErrors.badRequest('Template description cannot be empty');
      }
      if (request.description.trim().length > 500) {
        return commonErrors.badRequest('Template description must be 500 characters or less');
      }
    }

    if (request.content !== undefined) {
      if (!request.content.trim()) {
        return commonErrors.badRequest('Template content cannot be empty');
      }
      if (request.content.length > 50000) {
        return commonErrors.badRequest('Template content must be 50,000 characters or less');
      }
    }

    if (
      request.category !== undefined &&
      !Object.values(TemplateCategory).includes(request.category)
    ) {
      return commonErrors.badRequest('Invalid template category');
    }

    const template = await templateService.updateTemplate(templateId, userId, request);
    return successResponse(template);
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
 * Update template handler
 * PUT /api/templates/:id
 *
 * Updates an existing template (owner only)
 */
export const handler = withRbac(baseHandler, 'templates', 'update');
