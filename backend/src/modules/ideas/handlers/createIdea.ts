import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { IdeaService } from '../services/IdeaService';
import { CreateIdeaRequest, isValidCategory, isValidDifficulty, isValidStatus } from '../types';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';

const ideaService = new IdeaService();

/**
 * Base handler for creating a new idea
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Request body is required',
        }),
      };
    }

    const data: CreateIdeaRequest = JSON.parse(event.body);

    // Validate required fields
    if (!data.title || !data.title.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Title is required',
        }),
      };
    }

    if (!data.description || !data.description.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Description is required',
        }),
      };
    }

    if (!data.skills || !Array.isArray(data.skills) || data.skills.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'At least one skill is required',
        }),
      };
    }

    if (!data.category || !isValidCategory(data.category)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Valid category is required',
        }),
      };
    }

    if (!data.difficulty || !isValidDifficulty(data.difficulty)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Valid difficulty is required',
        }),
      };
    }

    if (!data.teamSize || data.teamSize < 1 || data.teamSize > 10) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Team size must be between 1 and 10',
        }),
      };
    }

    // Validate status if provided
    if (data.status && !isValidStatus(data.status)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Invalid status',
        }),
      };
    }

    // Sanitize and validate data
    const sanitizedData: CreateIdeaRequest = {
      title: data.title.trim(),
      description: data.description.trim(),
      skills: data.skills.map((s) => s.trim()).filter((s) => s.length > 0),
      category: data.category,
      difficulty: data.difficulty,
      teamSize: Math.floor(data.teamSize),
      status: data.status || 'published',
    };

    const { userId, email } = getAuthContext(event);
    const authorName = email || 'Unknown User';

    const idea = await ideaService.createIdea(sanitizedData, userId, authorName);
    return successResponse(idea, 201);
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * Create idea handler
 * Creates a new idea with AI enhancement
 *
 * @route POST /api/ideas
 */
export const handler = withRbac(baseHandler, 'ideas', 'create');
