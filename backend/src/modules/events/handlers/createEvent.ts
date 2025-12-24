import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { EventService } from '../services/EventService';
import { CreateEventRequest } from '../types';
import {
  successResponse,
  handleAsyncError,
  commonErrors,
  HTTP_STATUS,
} from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';

const eventService = new EventService();

/**
 * Base handler for creating events
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId } = getAuthContext(event);

    if (!event.body) {
      return commonErrors.badRequest('Request body is required');
    }

    let createData: CreateEventRequest;
    try {
      createData = JSON.parse(event.body);
    } catch {
      return commonErrors.badRequest('Invalid JSON in request body');
    }

    // Validate required fields
    const requiredFields = [
      'title',
      'description',
      'category',
      'startDate',
      'endDate',
      'location',
      'maxAttendees',
      'price',
    ];
    const missingFields = requiredFields.filter(
      (field) => !createData[field as keyof CreateEventRequest]
    );

    if (missingFields.length > 0) {
      return commonErrors.validationError(`Missing required fields: ${missingFields.join(', ')}`, {
        missingFields,
      });
    }

    // Validate location object
    if (!createData.location.address || !createData.location.city) {
      return commonErrors.validationError('Location must include address and city');
    }

    // Validate numeric fields
    if (createData.maxAttendees <= 0) {
      return commonErrors.validationError('Max attendees must be greater than 0');
    }

    if (createData.price < 0) {
      return commonErrors.validationError('Price cannot be negative');
    }

    // Validate dates
    const startDate = new Date(createData.startDate);
    const endDate = new Date(createData.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return commonErrors.validationError('Invalid date format. Use ISO 8601 format');
    }

    const createdEvent = await eventService.createEvent(createData, userId);
    return successResponse(createdEvent, HTTP_STATUS.CREATED);
  } catch (error: any) {
    if (
      error.message.includes('End date must be after start date') ||
      error.message.includes('Start date cannot be in the past')
    ) {
      return commonErrors.validationError(error.message);
    }
    return handleAsyncError(error);
  }
};

/**
 * Create event handler - Event organizers and admins only
 *
 * @route POST /api/events
 */
export const handler = withRbac(baseHandler, 'events', 'create');
