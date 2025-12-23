/**
 * Template Types for Frontend
 * Matches the backend template system
 */

export interface TemplateSection {
  id: string;
  name: string;
  content: string;
  order: number;
}

export const TemplateCategory = {
  WEB_DESIGN: 'web-design',
  CONSULTING: 'consulting',
  DEVELOPMENT: 'development',
  MARKETING: 'marketing',
  WRITING: 'writing',
  OTHER: 'other',
} as const;

export type TemplateCategory = (typeof TemplateCategory)[keyof typeof TemplateCategory];

export interface Template {
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

// Request Types
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

// Query Types
export interface ListTemplatesQuery {
  limit?: number;
  offset?: number;
  category?: TemplateCategory;
  isPublic?: boolean;
  search?: string;
  userId?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'usageCount' | 'name';
  sortOrder?: 'asc' | 'desc';
}

// Response Types
export interface ListTemplatesResponse {
  templates: Template[];
  totalCount: number;
  hasMore: boolean;
}

export interface TemplateResponse extends Template {}

// Variable Processing Types
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

// Category Display Names
export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  [TemplateCategory.WEB_DESIGN]: 'Web Design & Development',
  [TemplateCategory.CONSULTING]: 'Consulting & Strategy',
  [TemplateCategory.DEVELOPMENT]: 'Software Development',
  [TemplateCategory.MARKETING]: 'Marketing & Content',
  [TemplateCategory.WRITING]: 'Writing & Copywriting',
  [TemplateCategory.OTHER]: 'Other Services',
};

// Default Template Examples
export const DEFAULT_TEMPLATES = [
  {
    name: 'Web Development Project',
    description: 'Full-stack web application proposal template',
    category: TemplateCategory.WEB_DESIGN,
    content: `Dear {{client_name}},

I'm excited to propose a comprehensive web development solution for {{company_name}}.

## Project Overview
{{project_description}}

## Scope of Work
- Frontend Development (React/Vue.js)
- Backend API Development
- Database Design & Implementation
- Responsive Design
- Testing & Quality Assurance

## Timeline
Project Duration: {{timeline}}
Estimated Completion: {{completion_date}}

## Investment
Total Project Cost: {{budget}}
Payment Schedule: {{payment_terms}}

## Next Steps
I'd love to discuss this proposal further and answer any questions you may have.

Best regards,
{{freelancer_name}}
{{contact_info}}`,
    variables: [
      'client_name',
      'company_name',
      'project_description',
      'timeline',
      'completion_date',
      'budget',
      'payment_terms',
      'freelancer_name',
      'contact_info',
    ],
    tags: ['web development', 'full-stack', 'react', 'api'],
  },
  {
    name: 'Logo Design Package',
    description: 'Branding and logo design services proposal',
    category: TemplateCategory.WEB_DESIGN,
    content: `Hello {{client_name}},

Thank you for considering me for your logo design project for {{company_name}}.

## Design Package Includes
- 3 Initial Logo Concepts
- 2 Rounds of Revisions
- Final Logo in Multiple Formats (PNG, SVG, PDF)
- Brand Guidelines Document
- Social Media Kit

## Design Process
1. Discovery & Research
2. Concept Development
3. Client Review & Feedback
4. Refinement & Finalization
5. File Delivery

## Timeline
{{timeline}}

## Investment
Logo Design Package: {{budget}}

Looking forward to creating something amazing for your brand!

Best,
{{designer_name}}`,
    variables: ['client_name', 'company_name', 'timeline', 'budget', 'designer_name'],
    tags: ['logo design', 'branding', 'graphics', 'identity'],
  },
];

// Utility Functions
export const extractVariables = (content: string): string[] => {
  const variableRegex = /\{\{(\w+)\}\}/g;
  const variables = new Set<string>();
  let match;

  while ((match = variableRegex.exec(content)) !== null) {
    if (match[1]) {
      variables.add(match[1]);
    }
  }

  return Array.from(variables);
};

export const replaceVariables = (content: string, variables: TemplateVariables): string => {
  return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match;
  });
};
