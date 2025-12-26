import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { eventService } from '../services/EventService';
import { CreateEventRequest } from '../types';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';

/**
 * Base handler for creating a new event
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    if (!event.body) {
      return commonErrors.badRequest('Request body is required');
    }

    const requestData: CreateEventRequest = JSON.parse(event.body);

    // Validation
    if (!requestData.name || !requestData.name.trim()) {
      return commonErrors.badRequest('Event name is required');
    }

    if (!requestData.description || !requestData.description.trim()) {
      return commonErrors.badRequest('Event description is required');
    }

    if (!requestData.startDate) {
      return commonErrors.badRequest('Start date is required');
    }

    if (!requestData.endDate) {
      return commonErrors.badRequest('End date is required');
    }

    if (!requestData.registrationDeadline) {
      return commonErrors.badRequest('Registration deadline is required');
    }

    if (!requestData.location || !requestData.location.trim()) {
      return commonErrors.badRequest('Location is required');
    }

    if (!requestData.maxParticipants || requestData.maxParticipants <= 0) {
      return commonErrors.badRequest('Max participants must be greater than 0');
    }

    // Date validation
    const startDate = new Date(requestData.startDate);
    const endDate = new Date(requestData.endDate);
    const registrationDeadline = new Date(requestData.registrationDeadline);
    const now = new Date();

    if (startDate <= now) {
      return commonErrors.badRequest('Start date must be in the future');
    }

    if (endDate <= startDate) {
      return commonErrors.badRequest('End date must be after start date');
    }

    if (registrationDeadline >= startDate) {
      return commonErrors.badRequest('Registration deadline must be before start date');
    }

    // Get user info from JWT claims
    const { userId: organizerId, email: organizerName } = getAuthContext(event);

    const newEvent = await eventService.createEvent(requestData, organizerId, organizerName);
    return successResponse(newEvent, 201);
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * Create event handler
 * Creates a new hackathon event with AI enhancements
 *
 * @route POST /api/events
 */
export const handler = withRbac(baseHandler, 'events', 'create');
