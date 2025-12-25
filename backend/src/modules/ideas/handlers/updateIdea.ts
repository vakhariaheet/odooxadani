import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { IdeaService } from '../services/IdeaService';
import { UpdateIdeaRequest, isValidCategory, isValidDifficulty, isValidStatus } from '../types';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';

const ideaService = new IdeaService();

/**
 * Base handler for updating an idea
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const ideaId = event.pathParameters?.['id'];

    if (!ideaId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Idea ID is required',
        }),
      };
    }

    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Request body is required',
        }),
      };
    }

    const data: UpdateIdeaRequest = JSON.parse(event.body);

    // Validate fields if provided
    if (data.title !== undefined && (!data.title || !data.title.trim())) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Title cannot be empty',
        }),
      };
    }

    if (data.description !== undefined && (!data.description || !data.description.trim())) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Description cannot be empty',
        }),
      };
    }

    if (data.skills !== undefined && (!Array.isArray(data.skills) || data.skills.length === 0)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'At least one skill is required',
        }),
      };
    }

    if (data.category !== undefined && !isValidCategory(data.category)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Invalid category',
        }),
      };
    }

    if (data.difficulty !== undefined && !isValidDifficulty(data.difficulty)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Invalid difficulty',
        }),
      };
    }

    if (data.teamSize !== undefined && (data.teamSize < 1 || data.teamSize > 10)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Team size must be between 1 and 10',
        }),
      };
    }

    if (data.status !== undefined && !isValidStatus(data.status)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Invalid status',
        }),
      };
    }

    // Sanitize data
    const sanitizedData: UpdateIdeaRequest = {};

    if (data.title !== undefined) {
      sanitizedData.title = data.title.trim();
    }

    if (data.description !== undefined) {
      sanitizedData.description = data.description.trim();
    }

    if (data.skills !== undefined) {
      sanitizedData.skills = data.skills.map((s) => s.trim()).filter((s) => s.length > 0);
    }

    if (data.category !== undefined) {
      sanitizedData.category = data.category;
    }

    if (data.difficulty !== undefined) {
      sanitizedData.difficulty = data.difficulty;
    }

    if (data.teamSize !== undefined) {
      sanitizedData.teamSize = Math.floor(data.teamSize);
    }

    if (data.status !== undefined) {
      sanitizedData.status = data.status;
    }

    const { userId } = getAuthContext(event);
    const idea = await ideaService.updateIdea(ideaId, sanitizedData, userId);
    return successResponse(idea);
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * Update idea handler
 * Updates an existing idea (owner only)
 *
 * @route PUT /api/ideas/:id
 */
export const handler = withRbacOwn(baseHandler, 'ideas', 'update');
