import { apiClient } from './apiClient';
import type {
  CreateTemplateRequest,
  UpdateTemplateRequest,
  ListTemplatesQuery,
  ListTemplatesResponse,
  TemplateResponse,
} from '../types/template';

// Backend response wrapper type
interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    timestamp: string;
  };
}

export class TemplatesApi {
  private baseUrl = '/api/templates';

  /**
   * List templates with filtering and pagination
   */
  async listTemplates(query: ListTemplatesQuery = {}): Promise<ListTemplatesResponse> {
    const searchParams = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    const response = await apiClient.get<ApiResponse<ListTemplatesResponse>>(endpoint);
    return response.data;
  }

  /**
   * Get a single template by ID
   */
  async getTemplate(id: string): Promise<TemplateResponse> {
    const response = await apiClient.get<ApiResponse<TemplateResponse>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Create a new template
   */
  async createTemplate(data: CreateTemplateRequest): Promise<TemplateResponse> {
    const response = await apiClient.post<ApiResponse<TemplateResponse>>(this.baseUrl, data);
    return response.data;
  }

  /**
   * Update an existing template
   */
  async updateTemplate(id: string, data: UpdateTemplateRequest): Promise<TemplateResponse> {
    const response = await apiClient.put<ApiResponse<TemplateResponse>>(
      `${this.baseUrl}/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Delete a template
   */
  async deleteTemplate(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `${this.baseUrl}/${id}`
    );
    return response.data;
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: string, limit = 20): Promise<ListTemplatesResponse> {
    return this.listTemplates({ category: category as any, limit });
  }

  /**
   * Get public templates only
   */
  async getPublicTemplates(limit = 20): Promise<ListTemplatesResponse> {
    return this.listTemplates({ isPublic: true, limit });
  }

  /**
   * Get user's own templates
   */
  async getMyTemplates(limit = 20): Promise<ListTemplatesResponse> {
    return this.listTemplates({ limit });
  }

  /**
   * Search templates
   */
  async searchTemplates(search: string, limit = 20): Promise<ListTemplatesResponse> {
    return this.listTemplates({ search, limit });
  }
}

// Create singleton instance
export const templatesApi = new TemplatesApi();
