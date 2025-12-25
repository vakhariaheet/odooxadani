/**
 * Contact API Service
 */

import { apiClient } from './apiClient';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactSubmissionResponse {
  success: boolean;
  messageId?: string;
  message: string;
}

export const contactApi = {
  /**
   * Submit contact form
   */
  async submitContactForm(data: ContactFormData): Promise<ContactSubmissionResponse> {
    const response = await apiClient.post<ContactSubmissionResponse>('/api/contact/submit', data);
    return response;
  },
};

export default contactApi;
