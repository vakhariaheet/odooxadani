/**
 * Contact Service
 * Handles contact form submissions and email notifications
 */

import { ses } from '../../../shared/clients/ses';
import { createLogger } from '../../../shared/logger';
import type { ContactFormData, ContactSubmissionResponse } from '../types';

const logger = createLogger('ContactService');

export class ContactService {
  /**
   * Process contact form submission
   */
  async submitContactForm(data: ContactFormData): Promise<ContactSubmissionResponse> {
    try {
      // Validate input
      this.validateContactData(data);

      // Send notification email to support team
      const messageId = await this.sendContactNotification(data);

      // Send confirmation email to user
      await this.sendConfirmationEmail(data);

      logger.info('Contact form submitted successfully', {
        email: data.email,
        subject: data.subject,
        messageId,
      });

      return {
        success: true,
        messageId,
        message: "Thank you for your message! We'll get back to you soon.",
      };
    } catch (error) {
      logger.error('Contact form submission failed', error);

      return {
        success: false,
        message: 'Sorry, there was an error sending your message. Please try again later.',
      };
    }
  }

  /**
   * Validate contact form data
   */
  private validateContactData(data: ContactFormData): void {
    if (!data.name?.trim()) {
      throw new Error('Name is required');
    }
    if (!data.email?.trim()) {
      throw new Error('Email is required');
    }
    if (!data.subject?.trim()) {
      throw new Error('Subject is required');
    }
    if (!data.message?.trim()) {
      throw new Error('Message is required');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Invalid email format');
    }

    // Length validations
    if (data.name.length > 100) {
      throw new Error('Name must be less than 100 characters');
    }
    if (data.subject.length > 200) {
      throw new Error('Subject must be less than 200 characters');
    }
    if (data.message.length > 2000) {
      throw new Error('Message must be less than 2000 characters');
    }
  }

  /**
   * Send notification email to support team
   */
  private async sendContactNotification(data: ContactFormData): Promise<string> {
    const supportEmail = process.env['SUPPORT_EMAIL'] || 'support@webbound.dev';

    const subject = `New Contact Form Submission: ${data.subject}`;

    const htmlContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>From:</strong> ${data.name} (${data.email})</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Message:</strong></p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
        ${data.message.replace(/\n/g, '<br>')}
      </div>
      <hr>
      <p><em>This message was sent via the HackMatch contact form.</em></p>
    `;

    const textContent = `
New Contact Form Submission

From: ${data.name} (${data.email})
Subject: ${data.subject}

Message:
${data.message}

---
This message was sent via the HackMatch contact form.
    `;

    const result = await ses.send({
      from: 'noreply@webbound.dev',
      to: supportEmail,
      replyTo: data.email,
      content: {
        subject,
        html: htmlContent,
        text: textContent,
      },
    });

    return result.messageId;
  }

  /**
   * Send confirmation email to user
   */
  private async sendConfirmationEmail(data: ContactFormData): Promise<void> {
    const subject = 'Thank you for contacting HackMatch';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Thank you for contacting HackMatch!</h2>
        
        <p>Hi ${data.name},</p>
        
        <p>We've received your message and will get back to you as soon as possible. Here's a copy of what you sent:</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p><strong>Message:</strong></p>
          <p style="margin-top: 10px;">${data.message.replace(/\n/g, '<br>')}</p>
        </div>
        
        <p>Our team typically responds within 24 hours during business days.</p>
        
        <p>In the meantime, feel free to explore our platform and start connecting with fellow hackathon participants!</p>
        
        <p>Best regards,<br>The HackMatch Team</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280;">
          This is an automated message. Please do not reply to this email.
          If you need immediate assistance, contact us at support@hackmatch.com
        </p>
      </div>
    `;

    const textContent = `
Thank you for contacting HackMatch!

Hi ${data.name},

We've received your message and will get back to you as soon as possible. Here's a copy of what you sent:

Subject: ${data.subject}
Message: ${data.message}

Our team typically responds within 24 hours during business days.

In the meantime, feel free to explore our platform and start connecting with fellow hackathon participants!

Best regards,
The HackMatch Team

---
This is an automated message. Please do not reply to this email.
If you need immediate assistance, contact us at support@hackmatch.com
    `;

    await ses.send({
      from: 'noreply@webbound.dev',
      to: data.email,
      content: {
        subject,
        html: htmlContent,
        text: textContent,
      },
    });
  }
}

export const contactService = new ContactService();
