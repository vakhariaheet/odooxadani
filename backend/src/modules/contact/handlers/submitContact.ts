/**
 * Submit Contact Form Handler
 */

import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, commonErrors } from '../../../shared/response';
import { createLogger } from '../../../shared/logger';
import { contactService } from '../services/contactService';
import type { ContactSubmissionRequest } from '../types';

const logger = createLogger('SubmitContactHandler');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Contact form submission request', {
      httpMethod: event.httpMethod,
      path: event.path,
    });

    // Parse request body
    if (!event.body) {
      return commonErrors.badRequest('Request body is required');
    }

    let requestData: ContactSubmissionRequest;
    try {
      requestData = JSON.parse(event.body);
    } catch (error) {
      return commonErrors.badRequest('Invalid JSON in request body');
    }

    // Validate required fields
    const { name, email, subject, message } = requestData;

    if (!name?.trim()) {
      return commonErrors.validationError('Name is required');
    }

    if (!email?.trim()) {
      return commonErrors.validationError('Email is required');
    }

    if (!subject?.trim()) {
      return commonErrors.validationError('Subject is required');
    }

    if (!message?.trim()) {
      return commonErrors.validationError('Message is required');
    }

    // Process contact form submission
    const result = await contactService.submitContactForm({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    if (result.success) {
      return successResponse(result);
    } else {
      return commonErrors.internalServerError(result.message);
    }
  } catch (error) {
    logger.error('Contact form submission failed', error);

    return commonErrors.internalServerError('Internal server error');
  }
};
