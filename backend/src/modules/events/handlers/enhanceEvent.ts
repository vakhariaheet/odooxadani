/**
 * Enhance Event Handler
 *
 * AI-powered event enhancement endpoint
 */

import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { eventService } from '../services/EventService';
import { createLogger } from '../../../shared/logger';
import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';

const logger = createLogger('enhanceEvent');

// Request validation interface
interface EnhanceEventRequest {
  name: string;
  description: string;
  categories?: string[];
  location?: string;
  enhanceType?: 'title' | 'description' | 'categories' | 'tags' | 'rules' | 'all';
}

/**
 * Base handler for AI event enhancement
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    logger.info('Enhancing event with AI');

    if (!event.body) {
      return commonErrors.badRequest('Request body is required');
    }

    const requestData: EnhanceEventRequest = JSON.parse(event.body);
    const enhanceType = requestData.enhanceType || 'all';

    // Validation
    if (!requestData.name || !requestData.name.trim()) {
      return commonErrors.badRequest('Event name is required');
    }

    if (!requestData.description || !requestData.description.trim()) {
      return commonErrors.badRequest('Event description is required');
    }

    if (requestData.description.length < 10) {
      return commonErrors.badRequest('Description must be at least 10 characters');
    }

    // Selective AI enhancements based on type
    const enhancement: any = {};

    if (enhanceType === 'title' || enhanceType === 'all') {
      enhancement.enhancedTitle = await eventService.generateEventTitle(
        requestData.name,
        requestData.description,
        requestData.categories || []
      );
    }

    if (enhanceType === 'description' || enhanceType === 'all') {
      enhancement.enhancedDescription = await eventService.generateEventDescription({
        ...requestData,
        categories: requestData.categories || [],
      } as any);
    }

    if (enhanceType === 'categories' || enhanceType === 'all') {
      enhancement.suggestedCategories = await eventService.suggestEventCategories(
        requestData.name,
        requestData.description
      );
    }

    if (enhanceType === 'tags' || enhanceType === 'all') {
      enhancement.suggestedTags = await eventService.generateEventTags(
        requestData.name,
        requestData.description,
        requestData.categories || []
      );
    }

    if (enhanceType === 'rules' || enhanceType === 'all') {
      enhancement.generatedRules = await eventService.generateEventRules(
        requestData.name,
        requestData.description,
        requestData.categories || [],
        'Multi-day hackathon'
      );
    }

    if (enhanceType === 'all') {
      enhancement.trendScore = await eventService.analyzeEventTrends({
        ...requestData,
        categories: requestData.categories || [],
      } as any);
    }

    logger.info('Event enhancement completed');

    return successResponse(enhancement);
  } catch (error: any) {
    logger.error('Error enhancing event:', error);
    return handleAsyncError(error);
  }
};

/**
 * Lambda handler with RBAC middleware
 */
export const handler = withRbac(baseHandler, 'events', 'create');
