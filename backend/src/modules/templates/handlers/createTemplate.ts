import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { TemplateService } from '../services/TemplateService';
import { CreateTemplateRequest, TemplateCategory } from '../types';

const templateService = new TemplateService();

/**
 * Base handler for creating a new template
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId } = getAuthContext(event);

    if (!event.body) {
      return commonErrors.badRequest('Request body is required');
    }

    let request: CreateTemplateRequest;
    try {
      request = JSON.parse(event.body);
    } catch {
      return commonErrors.badRequest('Invalid JSON in request body');
    }

    // Validate required fields
    if (!request.name || !request.name.trim()) {
      return commonErrors.badRequest('Template name is required');
    }

    if (!request.description || !request.description.trim()) {
      return commonErrors.badRequest('Template description is required');
    }

    if (!request.content || !request.content.trim()) {
      return commonErrors.badRequest('Template content is required');
    }

    if (!request.category || !Object.values(TemplateCategory).includes(request.category)) {
      return commonErrors.badRequest('Valid template category is required');
    }

    // Validate name length
    if (request.name.trim().length > 100) {
      return commonErrors.badRequest('Template name must be 100 characters or less');
    }

    // Validate description length
    if (request.description.trim().length > 500) {
      return commonErrors.badRequest('Template description must be 500 characters or less');
    }

    // Validate content length (reasonable limit for templates)
    if (request.content.length > 50000) {
      return commonErrors.badRequest('Template content must be 50,000 characters or less');
    }

    const template = await templateService.createTemplate(userId, request);
    return successResponse(template, 201);
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * Create template handler
 * POST /api/templates
 *
 * Creates a new template (freelancer only)
 */
export const handler = withRbac(baseHandler, 'templates', 'create');
