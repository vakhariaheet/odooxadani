import { v4 as uuidv4 } from 'uuid';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDB, documentClient } from '../../../shared/clients/dynamodb';
import { createLogger } from '../../../shared/logger';
import {
  Template,
  TemplateItem,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  ListTemplatesQuery,
  ListTemplatesResponse,
  TemplateCategory,
  TemplateVariables,
  ProcessedTemplate,
} from '../types';

const logger = createLogger('TemplateService');
const dynamodb = new DynamoDB();

export class TemplateService {
  /**
   * Create a new template
   */
  async createTemplate(userId: string, request: CreateTemplateRequest): Promise<Template> {
    const templateId = uuidv4();
    const now = new Date().toISOString();

    // Validate category
    if (!Object.values(TemplateCategory).includes(request.category)) {
      throw new Error('Invalid template category');
    }

    // Extract variables from content
    const extractedVariables = this.extractVariables(request.content);
    const variables = request.variables || extractedVariables;

    const template: Template = {
      id: templateId,
      name: request.name.trim(),
      description: request.description.trim(),
      content: request.content,
      category: request.category,
      userId,
      isPublic: request.isPublic || false,
      variables,
      sections:
        request.sections?.map((section, index) => ({
          ...section,
          id: uuidv4(),
          order: index,
        })) || [],
      tags: request.tags || [],
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    // Create DynamoDB items for single-table design
    const items: Record<string, unknown>[] = [
      // Main metadata record
      {
        PK: `TEMPLATE#${templateId}`,
        SK: 'METADATA',
        GSI1PK: `USER#${userId}`,
        GSI1SK: `TEMPLATE#${now}`,
        id: template.id,
        name: template.name,
        description: template.description,
        content: template.content,
        category: template.category,
        userId: template.userId,
        isPublic: template.isPublic,
        variables: template.variables,
        sections: template.sections,
        tags: template.tags,
        usageCount: template.usageCount,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      },
      // Category index record
      {
        PK: `TEMPLATE#${templateId}`,
        SK: `CATEGORY#${request.category}`,
        GSI1PK: `CATEGORY#${request.category}`,
        GSI1SK: `TEMPLATE#${now}`,
        id: template.id,
        name: template.name,
        description: template.description,
        content: template.content,
        category: template.category,
        userId: template.userId,
        isPublic: template.isPublic,
        variables: template.variables,
        sections: template.sections,
        tags: template.tags,
        usageCount: template.usageCount,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      },
    ];

    // Add public index record if template is public
    if (request.isPublic) {
      items.push({
        PK: `TEMPLATE#${templateId}`,
        SK: 'PUBLIC',
        GSI1PK: 'PUBLIC#TEMPLATES',
        GSI1SK: `TEMPLATE#${now}`,
        id: template.id,
        name: template.name,
        description: template.description,
        content: template.content,
        category: template.category,
        userId: template.userId,
        isPublic: template.isPublic,
        variables: template.variables,
        sections: template.sections,
        tags: template.tags,
        usageCount: template.usageCount,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      });
    }

    // Batch write all items
    const operations = items.map((item) => ({ put: item }));
    await dynamodb.batchWrite(operations);

    logger.info('Template created', { templateId, userId, category: request.category });
    return template;
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: string, userId?: string): Promise<Template | null> {
    const result = await dynamodb.get<TemplateItem>({
      PK: `TEMPLATE#${templateId}`,
      SK: 'METADATA',
    });

    if (!result) {
      return null;
    }

    // Check access permissions
    if (!result.isPublic && result.userId !== userId) {
      throw new Error('Access denied: Template is private');
    }

    return this.mapItemToTemplate(result);
  }

  /**
   * Update template (owner only)
   */
  async updateTemplate(
    templateId: string,
    userId: string,
    request: UpdateTemplateRequest
  ): Promise<Template> {
    // First, get the existing template to verify ownership
    const existing = await this.getTemplate(templateId, userId);
    if (!existing) {
      throw new Error('Template not found');
    }

    if (existing.userId !== userId) {
      throw new Error('Access denied: You can only update your own templates');
    }

    const now = new Date().toISOString();
    const updates: Partial<Template> = {
      updatedAt: now,
    };

    // Update fields if provided
    if (request.name !== undefined) updates.name = request.name.trim();
    if (request.description !== undefined) updates.description = request.description.trim();
    if (request.content !== undefined) {
      updates.content = request.content;
      updates.variables = request.variables || this.extractVariables(request.content);
    }
    if (request.category !== undefined) {
      if (!Object.values(TemplateCategory).includes(request.category)) {
        throw new Error('Invalid template category');
      }
      updates.category = request.category;
    }
    if (request.isPublic !== undefined) updates.isPublic = request.isPublic;
    if (request.sections !== undefined) {
      updates.sections = request.sections.map((section, index) => ({
        ...section,
        id: uuidv4(),
        order: index,
      }));
    }
    if (request.tags !== undefined) updates.tags = request.tags;

    // Update main metadata record
    const updatedTemplate = await dynamodb.update<TemplateItem>(
      { PK: `TEMPLATE#${templateId}`, SK: 'METADATA' },
      updates
    );

    // Update category record if category changed
    if (request.category && request.category !== existing.category) {
      // Delete old category record
      await dynamodb.delete({
        PK: `TEMPLATE#${templateId}`,
        SK: `CATEGORY#${existing.category}`,
      });

      // Create new category record
      await dynamodb.put({
        PK: `TEMPLATE#${templateId}`,
        SK: `CATEGORY#${request.category}`,
        GSI1PK: `CATEGORY#${request.category}`,
        GSI1SK: `TEMPLATE#${existing.createdAt}`,
        id: updatedTemplate.id,
        name: updatedTemplate.name,
        description: updatedTemplate.description,
        content: updatedTemplate.content,
        category: updatedTemplate.category,
        userId: updatedTemplate.userId,
        isPublic: updatedTemplate.isPublic,
        variables: updatedTemplate.variables,
        sections: updatedTemplate.sections,
        tags: updatedTemplate.tags,
        usageCount: updatedTemplate.usageCount,
        createdAt: updatedTemplate.createdAt,
        updatedAt: updatedTemplate.updatedAt,
      });
    } else if (request.category === existing.category) {
      // Update existing category record
      await dynamodb.update(
        { PK: `TEMPLATE#${templateId}`, SK: `CATEGORY#${existing.category}` },
        updates
      );
    }

    // Handle public/private status change
    if (request.isPublic !== undefined) {
      if (request.isPublic && !existing.isPublic) {
        // Make public - add public record
        await dynamodb.put({
          PK: `TEMPLATE#${templateId}`,
          SK: 'PUBLIC',
          GSI1PK: 'PUBLIC#TEMPLATES',
          GSI1SK: `TEMPLATE#${existing.createdAt}`,
          id: updatedTemplate.id,
          name: updatedTemplate.name,
          description: updatedTemplate.description,
          content: updatedTemplate.content,
          category: updatedTemplate.category,
          userId: updatedTemplate.userId,
          isPublic: updatedTemplate.isPublic,
          variables: updatedTemplate.variables,
          sections: updatedTemplate.sections,
          tags: updatedTemplate.tags,
          usageCount: updatedTemplate.usageCount,
          createdAt: updatedTemplate.createdAt,
          updatedAt: updatedTemplate.updatedAt,
        });
      } else if (!request.isPublic && existing.isPublic) {
        // Make private - remove public record
        await dynamodb.delete({
          PK: `TEMPLATE#${templateId}`,
          SK: 'PUBLIC',
        });
      } else if (existing.isPublic) {
        // Update existing public record
        await dynamodb.update({ PK: `TEMPLATE#${templateId}`, SK: 'PUBLIC' }, updates);
      }
    }

    logger.info('Template updated', { templateId, userId });
    return this.mapItemToTemplate(updatedTemplate);
  }

  /**
   * Delete template (owner only)
   */
  async deleteTemplate(templateId: string, userId: string): Promise<void> {
    // First, get the existing template to verify ownership
    const existing = await this.getTemplate(templateId, userId);
    if (!existing) {
      throw new Error('Template not found');
    }

    if (existing.userId !== userId) {
      throw new Error('Access denied: You can only delete your own templates');
    }

    // Delete all records for this template
    const operations = [
      { delete: { PK: `TEMPLATE#${templateId}`, SK: 'METADATA' } },
      { delete: { PK: `TEMPLATE#${templateId}`, SK: `CATEGORY#${existing.category}` } },
    ];

    if (existing.isPublic) {
      operations.push({ delete: { PK: `TEMPLATE#${templateId}`, SK: 'PUBLIC' } });
    }

    await dynamodb.batchWrite(operations);
    logger.info('Template deleted', { templateId, userId });
  }

  /**
   * List templates with filtering and pagination
   */
  async listTemplates(userId: string, query: ListTemplatesQuery): Promise<ListTemplatesResponse> {
    const {
      limit = 20,
      offset = 0,
      category,
      isPublic,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Determine query strategy based on filters
    if (category) {
      // Query by category
      const result = await this.queryTemplates(
        `CATEGORY#${category}`,
        limit + offset,
        sortOrder === 'desc'
      );
      return this.processQueryResult(result.items, limit, offset, search, sortBy, sortOrder);
    } else if (isPublic === true) {
      // Query public templates only
      const result = await this.queryTemplates(
        'PUBLIC#TEMPLATES',
        limit + offset,
        sortOrder === 'desc'
      );
      return this.processQueryResult(result.items, limit, offset, search, sortBy, sortOrder);
    } else if (isPublic === false) {
      // Query user's own templates only
      const result = await this.queryTemplates(
        `USER#${userId}`,
        limit + offset,
        sortOrder === 'desc'
      );
      return this.processQueryResult(result.items, limit, offset, search, sortBy, sortOrder);
    } else {
      // Query user's own templates + public templates (requires multiple queries)
      const [ownTemplates, publicTemplates] = await Promise.all([
        this.queryTemplates(`USER#${userId}`, limit, sortOrder === 'desc'),
        this.queryTemplates('PUBLIC#TEMPLATES', limit, sortOrder === 'desc'),
      ]);

      // Merge and sort results
      const allTemplates = [...ownTemplates.items, ...publicTemplates.items];
      return this.processQueryResult(allTemplates, limit, offset, search, sortBy, sortOrder);
    }
  }

  /**
   * Increment template usage count
   */
  async incrementUsageCount(templateId: string): Promise<void> {
    try {
      // Use raw DynamoDB update with ADD operation
      const params = {
        TableName: process.env['DYNAMODB_TABLE'] || '',
        Key: {
          PK: `TEMPLATE#${templateId}`,
          SK: 'METADATA',
        },
        UpdateExpression: 'ADD usageCount :inc SET updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':inc': 1,
          ':updatedAt': new Date().toISOString(),
        },
        ReturnValues: 'NONE' as const,
      };

      await documentClient.send(new UpdateCommand(params));
    } catch (error) {
      logger.warn('Failed to increment usage count', { templateId, error });
      // Don't throw - this is not critical
    }
  }

  /**
   * Process template with variable replacement
   */
  processTemplate(template: Template, variables: TemplateVariables): ProcessedTemplate {
    const processedContent = this.replaceVariables(template.content, variables);

    return {
      id: template.id,
      name: template.name,
      content: template.content,
      processedContent,
      variables,
    };
  }

  // Private helper methods

  private async queryTemplates(gsi1pk: string, limit: number, scanIndexForward: boolean) {
    return await dynamodb.query<TemplateItem>(
      'GSI1PK = :gsi1pk',
      { ':gsi1pk': gsi1pk },
      {
        indexName: 'GSI1',
        limit,
        scanIndexForward,
      }
    );
  }

  private processQueryResult(
    items: TemplateItem[],
    limit: number,
    offset: number,
    search?: string,
    sortBy?: string,
    sortOrder?: string
  ): ListTemplatesResponse {
    let templates = items.map((item) => this.mapItemToTemplate(item));

    // Apply search filter if provided
    if (search && search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      templates = templates.filter(
        (template) =>
          template.name.toLowerCase().includes(searchTerm) ||
          template.description.toLowerCase().includes(searchTerm) ||
          template.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Sort if not using default createdAt desc
    if (sortBy && sortOrder && (sortBy !== 'createdAt' || sortOrder !== 'desc')) {
      templates = this.sortTemplates(templates, sortBy, sortOrder);
    }

    // Apply pagination
    const paginatedTemplates = templates.slice(offset, offset + limit);

    return {
      templates: paginatedTemplates,
      totalCount: templates.length,
      hasMore: offset + limit < templates.length,
    };
  }

  private sortTemplates(templates: Template[], sortBy: string, sortOrder: string): Template[] {
    return templates.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'usageCount':
          aValue = a.usageCount;
          bValue = b.usageCount;
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        default: // createdAt
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }

  private mapItemToTemplate(item: TemplateItem): Template {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      content: item.content,
      category: item.category,
      userId: item.userId,
      isPublic: item.isPublic,
      variables: item.variables,
      sections: item.sections,
      tags: item.tags,
      usageCount: item.usageCount,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private extractVariables(content: string): string[] {
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables = new Set<string>();
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      if (match[1]) {
        variables.add(match[1]);
      }
    }

    return Array.from(variables);
  }

  private replaceVariables(content: string, variables: TemplateVariables): string {
    return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }
}
