// =============================================================================
// TEMPLATE TYPES - Template System Module
// =============================================================================

// -----------------------------------------------------------------------------
// Core Template Types
// -----------------------------------------------------------------------------

export interface Template {
  id: string;
  name: string;
  description: string;
  content: string; // Rich text/markdown content
  category: TemplateCategory;
  userId: string; // Creator
  isPublic: boolean;
  variables: string[]; // e.g., ['client_name', 'project_name', 'budget']
  sections: TemplateSection[];
  tags: string[];
  usageCount: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface TemplateSection {
  id: string;
  name: string;
  content: string;
  order: number;
}

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------

export enum TemplateCategory {
  WEB_DESIGN = 'web-design',
  CONSULTING = 'consulting',
  DEVELOPMENT = 'development',
  MARKETING = 'marketing',
  WRITING = 'writing',
  OTHER = 'other',
}

// -----------------------------------------------------------------------------
// Request Types
// -----------------------------------------------------------------------------

/** POST /api/templates */
export interface CreateTemplateRequest {
  name: string;
  description: string;
  content: string;
  category: TemplateCategory;
  isPublic?: boolean;
  variables?: string[];
  sections?: Omit<TemplateSection, 'id'>[];
  tags?: string[];
}

/** PUT /api/templates/:id */
export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  content?: string;
  category?: TemplateCategory;
  isPublic?: boolean;
  variables?: string[];
  sections?: Omit<TemplateSection, 'id'>[];
  tags?: string[];
}

// -----------------------------------------------------------------------------
// Query & Response Types
// -----------------------------------------------------------------------------

/** GET /api/templates query params */
export interface ListTemplatesQuery {
  limit?: number;
  offset?: number;
  category?: TemplateCategory;
  isPublic?: boolean;
  search?: string;
  userId?: string; // For filtering by creator
  sortBy?: 'createdAt' | 'updatedAt' | 'usageCount' | 'name';
  sortOrder?: 'asc' | 'desc';
}

/** GET /api/templates response */
export interface ListTemplatesResponse {
  templates: Template[];
  totalCount: number;
  hasMore: boolean;
}

/** Template response for single template operations */
export interface TemplateResponse extends Template {}

// -----------------------------------------------------------------------------
// DynamoDB Item Types
// -----------------------------------------------------------------------------

export interface TemplateItem {
  PK: string; // TEMPLATE#[id]
  SK: string; // METADATA | CATEGORY#[category] | PUBLIC
  GSI1PK: string; // USER#[userId] | CATEGORY#[category] | PUBLIC#TEMPLATES
  GSI1SK: string; // TEMPLATE#[createdAt] | TEMPLATE#[createdAt]
  id: string;
  name: string;
  description: string;
  content: string;
  category: TemplateCategory;
  userId: string;
  isPublic: boolean;
  variables: string[];
  sections: TemplateSection[];
  tags: string[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Variable Replacement Types
// -----------------------------------------------------------------------------

export interface TemplateVariables {
  [key: string]: string;
}

export interface ProcessedTemplate {
  id: string;
  name: string;
  content: string;
  processedContent: string;
  variables: TemplateVariables;
}
