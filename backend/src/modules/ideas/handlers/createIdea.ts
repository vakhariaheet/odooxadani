import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { successResponse, commonErrors, handleAsyncError } from '../../../shared/response';
import { ideaService } from '../services/IdeaService';
import { CreateIdeaRequest } from '../types';

/**
 * @route POST /api/ideas
 * @description Create a new idea
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId } = getAuthContext(event);
    const body: CreateIdeaRequest = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!body.title) {
      return commonErrors.badRequest('Title is required');
    }

    if (!body.description) {
      return commonErrors.badRequest('Description is required');
    }

    if (!body.problemStatement) {
      return commonErrors.badRequest('Problem statement is required');
    }

    if (!body.proposedSolution) {
      return commonErrors.badRequest('Proposed solution is required');
    }

    if (!body.techStack || !Array.isArray(body.techStack) || body.techStack.length === 0) {
      return commonErrors.badRequest('Tech stack is required');
    }

    if (!body.teamSizeNeeded || typeof body.teamSizeNeeded !== 'number') {
      return commonErrors.badRequest('Team size needed is required');
    }

    if (!body.complexityLevel) {
      return commonErrors.badRequest('Complexity level is required');
    }

    if (!body.timeCommitment) {
      return commonErrors.badRequest('Time commitment is required');
    }

    const idea = await ideaService.createIdea(userId, body);
    return successResponse(idea, 201);
  } catch (error) {
    return handleAsyncError(error);
  }
};

export const handler = withRbac(baseHandler, 'ideas', 'create');
