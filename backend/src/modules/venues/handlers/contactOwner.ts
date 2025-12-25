import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { VenueService } from '../services/VenueService';
import { ContactOwnerRequest } from '../types';
import { successResponse, handleAsyncError, commonErrors } from '../../../shared/response';
import { AuthenticatedAPIGatewayEvent, getAuthContext } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { ses } from '../../../shared/clients/ses';

const venueService = new VenueService();

/**
 * Base handler for contacting venue owners
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId } = getAuthContext(event);
    const venueId = event.pathParameters?.['id'];

    if (!venueId) {
      return commonErrors.badRequest('Venue ID is required');
    }

    if (!event.body) {
      return commonErrors.badRequest('Request body is required');
    }

    let requestData: ContactOwnerRequest;
    try {
      requestData = JSON.parse(event.body);
    } catch (error) {
      return commonErrors.badRequest('Invalid JSON in request body');
    }

    // Validate required fields
    const requiredFields = ['senderName', 'senderEmail', 'subject', 'message'];
    const missingFields = requiredFields.filter(field => !requestData[field as keyof ContactOwnerRequest]);
    
    if (missingFields.length > 0) {
      return commonErrors.badRequest(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Get venue details
    const venue = await venueService.getVenue(venueId);
    if (!venue) {
      return commonErrors.notFound('Venue not found');
    }

    // Prevent users from contacting themselves
    if (venue.ownerId === userId) {
      return commonErrors.badRequest('You cannot contact yourself');
    }

    // Get venue owner details
    const ownerDetails = await venueService.getVenueOwnerDetails(venue.ownerId);
    if (!ownerDetails || !ownerDetails.email) {
      return commonErrors.internalServerError('Unable to contact venue owner - owner email not found');
    }

    // Prepare email content
    const emailSubject = `[Venue Inquiry] ${requestData.subject}`;
    const emailBody = `
Dear ${ownerDetails.name || 'Venue Owner'},

You have received a new inquiry about your venue "${venue.name}".

Inquiry Details:
- From: ${requestData.senderName} (${requestData.senderEmail})
- Inquiry Type: ${requestData.inquiryType || 'General'}
- Subject: ${requestData.subject}

Message:
${requestData.message}

Venue Details:
- Name: ${venue.name}
- Location: ${venue.location.city}, ${venue.location.state}
- Category: ${venue.category}

You can reply directly to this email to respond to the inquiry.

Best regards,
Odoo Xadani Team
    `.trim();

    // Send email to venue owner
    await ses.send({
      from: process.env['SES_DEFAULT_FROM'] || 'noreply@odooxadani.com',
      to: [ownerDetails.email],
      replyTo: [requestData.senderEmail],
      content: {
        subject: emailSubject,
        text: emailBody
      }
    });

    // Log the contact attempt for analytics
    await venueService.logContactAttempt({
      venueId,
      ownerId: venue.ownerId,
      contactorId: userId,
      contactorEmail: requestData.senderEmail,
      inquiryType: requestData.inquiryType || 'general',
      subject: requestData.subject,
      timestamp: new Date().toISOString()
    });

    return successResponse({
      message: 'Your message has been sent to the venue owner successfully',
      sentAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Contact owner error:', error);
    return handleAsyncError(error);
  }
};

/**
 * Contact venue owner handler - Authenticated users only
 * Sends an email to the venue owner on behalf of the user
 *
 * @route POST /api/venues/:id/contact
 */
export const handler = withRbac(baseHandler, 'venues', 'read');