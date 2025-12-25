# Email Service Setup Guide

## Overview

The contact form on the landing page now integrates with AWS SES (Simple Email Service) to send emails. This document explains how the email service works and how to set it up.

## Architecture

### Backend Components

1. **Contact Module** (`backend/src/modules/contact/`)
   - `handlers/submitContact.ts` - API endpoint handler
   - `services/contactService.ts` - Business logic for email processing
   - `types.ts` - TypeScript interfaces
   - `functions/submitContact.yml` - Serverless function configuration

2. **SES Client** (`backend/src/shared/clients/ses.ts`)
   - Pre-configured AWS SES wrapper
   - Handles email sending with proper error handling
   - Supports both HTML and text email formats

### Frontend Components

1. **Contact Form** (`client/src/components/landing/ContactSection.tsx`)
   - Form validation and submission
   - Error handling with toast notifications
   - Loading states and user feedback

2. **Contact API** (`client/src/services/contactApi.ts`)
   - API client for contact form submission
   - Type-safe interface with backend

## Email Flow

When a user submits the contact form:

1. **Frontend Validation**: Client-side validation for required fields and email format
2. **API Call**: Form data sent to `/api/contact/submit` endpoint
3. **Backend Processing**:
   - Server-side validation
   - Two emails are sent:
     - **Notification Email**: Sent to support team with user's message
     - **Confirmation Email**: Sent to user confirming receipt
4. **Response**: Success/error response sent back to frontend
5. **User Feedback**: Toast notification shown to user

## Configuration

### Environment Variables

**Backend** (`.env`):

```env
# SES Configuration
SES_DEFAULT_FROM="noreply@webbound.dev"
SES_REGION="us-east-1"
SUPPORT_EMAIL="support@webbound.dev"
```

**Frontend** (`.env`):

```env
# API Configuration
VITE_API_URL=https://api-dev-tirth.hac.heetvakharia.in
```

### AWS SES Setup

1. **Verify Email Addresses**: In AWS SES console, verify both sender and recipient email addresses
2. **Domain Verification**: For production, verify your domain
3. **Sending Limits**: Check your SES sending limits and request increases if needed
4. **IAM Permissions**: Ensure Lambda execution role has SES permissions

## Testing

### Local Testing

1. **Start Frontend**:

   ```bash
   cd client
   bun run dev
   ```

2. **Test Contact Form**:
   - Navigate to `http://localhost:5174`
   - Scroll to "Get in Touch" section
   - Fill out and submit the contact form

### Production Testing

1. **Deploy Backend**:

   ```bash
   cd backend
   ./deploy.sh dev-tirth  # or your stage
   ```

2. **Test API Endpoint**:
   ```bash
   curl -X POST https://api-dev-tirth.hac.heetvakharia.in/api/contact/submit \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "subject": "Test Subject",
       "message": "Test message"
     }'
   ```

## Email Templates

### Notification Email (to support team)

- **Subject**: "New Contact Form Submission: [User Subject]"
- **Content**: User details, subject, and message
- **Reply-To**: User's email address for easy response

### Confirmation Email (to user)

- **Subject**: "Thank you for contacting HackMatch"
- **Content**: Confirmation message with copy of their submission
- **From**: noreply@webbound.dev

## Error Handling

### Common Issues

1. **Email Not Verified**: Ensure sender email is verified in SES
2. **Sending Limits**: Check if you've exceeded SES sending limits
3. **Network Issues**: Handle network timeouts and connection errors
4. **Validation Errors**: Proper client and server-side validation

### Error Messages

- **Client-side**: Toast notifications with specific error messages
- **Server-side**: Detailed logging with error context
- **User-friendly**: Generic error messages to users, detailed logs for debugging

## Monitoring

### Logs

- CloudWatch logs for Lambda function execution
- SES sending statistics in AWS console
- Frontend error tracking via browser console

### Metrics

- Email delivery rates
- Form submission success rates
- Response times

## Security

### Input Validation

- Email format validation
- Length limits on all fields
- HTML sanitization for email content

### Rate Limiting

- Consider implementing rate limiting for contact form submissions
- SES has built-in sending limits

### Spam Prevention

- Basic validation helps prevent spam
- Consider adding CAPTCHA for production use

## Troubleshooting

### Email Not Sending

1. Check SES email verification status
2. Verify IAM permissions for Lambda
3. Check CloudWatch logs for errors
4. Ensure environment variables are set correctly

### Form Submission Errors

1. Check network connectivity
2. Verify API endpoint URL
3. Check browser console for JavaScript errors
4. Test API endpoint directly with curl

### Email Delivery Issues

1. Check spam folders
2. Verify recipient email addresses
3. Check SES bounce/complaint rates
4. Review SES sending statistics

## Future Enhancements

1. **Email Templates**: Use SES templates for better email formatting
2. **Queue Processing**: Use SQS for handling high-volume submissions
3. **Analytics**: Track email open rates and user engagement
4. **Auto-responders**: Set up automated responses based on subject categories
5. **CAPTCHA**: Add spam protection for production use
