# Module F03: Template System

## Overview

**Estimated Time:** 1hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Low

**Dependencies:** None

## Problem Context

Freelancers waste time recreating similar proposal structures for each client. This module provides a reusable template system that allows freelancers to create, save, and reuse proposal templates, reducing proposal creation time from hours to minutes.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler Files:** Create template CRUD handlers
  - `handlers/listTemplates.ts` - GET /api/templates (public templates + user's own)
  - `handlers/getTemplate.ts` - GET /api/templates/:id (public or own templates)
  - `handlers/createTemplate.ts` - POST /api/templates (freelancer only)
  - `handlers/updateTemplate.ts` - PUT /api/templates/:id (own templates only)
  - `handlers/deleteTemplate.ts` - DELETE /api/templates/:id (own templates only)

- [ ] **Function Configs:** Create serverless function configurations
  - `functions/listTemplates.yml` - List templates endpoint
  - `functions/getTemplate.yml` - Get single template endpoint
  - `functions/createTemplate.yml` - Create template endpoint
  - `functions/updateTemplate.yml` - Update template endpoint
  - `functions/deleteTemplate.yml` - Delete template endpoint

- [ ] **Service Layer:** Business logic in `services/TemplateService.ts`
  - Create TemplateService class with CRUD methods
  - Template validation and sanitization
  - Public vs private template handling
  - Template categorization (web design, consulting, development, etc.)

- [ ] **Type Definitions:** Add types to `types.ts`
  - Template interface with all fields
  - TemplateCategory enum
  - CreateTemplateRequest/Response types
  - UpdateTemplateRequest/Response types
  - ListTemplatesQuery/Response types

- [ ] **RBAC Verification:** Verify `config/permissions.ts` includes templates module
  - Module already configured in ROLE_MODULE_ACCESS
  - Freelancer: full CRUD on own templates, read public templates
  - Client: no access to templates (they receive proposals, not templates)
  - Admin: full access to all templates

- [ ] **AWS Service Integration:** Use existing DynamoDB client
  - Import from `shared/clients/dynamodb`
  - Follow single-table design patterns
  - Use GSI for category-based queries and public template queries

- [ ] **Error Handling:** Use `handleAsyncError()` and `commonErrors.*`

**CRITICAL - NO TESTS:** Do NOT create any test files - Focus on working features only

### Frontend Tasks

- [ ] **Components:** Build template management UI
  - `TemplateList.tsx` - List view with category filters and search
  - `TemplateForm.tsx` - Create/edit form with rich text editor
  - `TemplateCard.tsx` - Card component showing template preview
  - `TemplatePreview.tsx` - Modal preview of template content
  - `TemplateCategoryFilter.tsx` - Category filter dropdown
  - `TemplateLibrary.tsx` - Public template browser

- [ ] **Pages:** Create template pages
  - `TemplateListPage.tsx` - My templates dashboard
  - `TemplateCreatePage.tsx` - New template creation
  - `TemplateEditPage.tsx` - Edit existing template
  - `TemplateLibraryPage.tsx` - Browse public templates

- [ ] **shadcn Components:** button, form, table, dialog, badge, card, textarea, select, input

- [ ] **API Integration:** Connect to template endpoints
  - Use `useApi` hook for CRUD operations
  - Handle loading states and error messages
  - Template search and filtering

- [ ] **State Management:** Local state for form data, React Query for server state

- [ ] **Routing:** Add template routes to React Router
  - `/templates` - My templates list
  - `/templates/new` - Create template
  - `/templates/:id/edit` - Edit template
  - `/templates/library` - Public template library

- [ ] **Template Editor:** Rich text editing capabilities
  - Use textarea with markdown support initially
  - Variable placeholders ({{client_name}}, {{project_name}}, etc.)
  - Section templates (introduction, scope, pricing, terms)

- [ ] **Responsive Design:** Mobile-first approach with Tailwind CSS

**CRITICAL - NO TESTS:** Do NOT create any test files - Focus on working features only

### Database Schema (Single Table)

```
pk: TEMPLATE#[id] | sk: METADATA | gsi1pk: USER#[userId] | gsi1sk: TEMPLATE#[createdAt]
pk: TEMPLATE#[id] | sk: CATEGORY#[category] | gsi1pk: CATEGORY#[category] | gsi1sk: TEMPLATE#[createdAt]
pk: TEMPLATE#[id] | sk: PUBLIC | gsi1pk: PUBLIC#TEMPLATES | gsi1sk: TEMPLATE#[createdAt] (if isPublic)

Fields:
- id: string (UUID)
- name: string
- description: string
- content: string (rich text/markdown)
- category: 'web-design' | 'consulting' | 'development' | 'marketing' | 'writing' | 'other'
- userId: string (creator)
- isPublic: boolean
- variables: string[] (e.g., ['client_name', 'project_name', 'budget'])
- sections: TemplateSection[]
- tags: string[]
- createdAt: string (ISO)
- updatedAt: string (ISO)
- usageCount: number
```

## External Services

No external services required for this module.

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** Read `guidelines/project-architecture.md` COMPLETELY before writing any code.

**MANDATORY Reading (15-20 minutes):**

1. Complete backend and frontend architecture patterns
2. Existing module structure in `backend/src/modules/`
3. RBAC middleware usage patterns
4. DynamoDB client usage and single-table design
5. Frontend component patterns and API integration

### Step 1: Backend Implementation (Lambda-Compatible)

**File Structure:**

```
backend/src/modules/templates/
├── handlers/
│   ├── listTemplates.ts         # GET /api/templates
│   ├── getTemplate.ts          # GET /api/templates/:id
│   ├── createTemplate.ts       # POST /api/templates
│   ├── updateTemplate.ts       # PUT /api/templates/:id
│   └── deleteTemplate.ts       # DELETE /api/templates/:id
├── functions/
│   ├── listTemplates.yml
│   ├── getTemplate.yml
│   ├── createTemplate.yml
│   ├── updateTemplate.yml
│   └── deleteTemplate.yml
├── services/
│   └── TemplateService.ts      # Business logic
└── types.ts                    # Domain-specific types
```

**Handler Pattern:**

```typescript
// handlers/listTemplates.ts
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { TemplateService } from '../services/TemplateService';

const templateService = new TemplateService();

const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const query = event.queryStringParameters || {};
    const userId = event.auth.userid;

    const templates = await templateService.listTemplates(userId, query);
    return successResponse(templates);
  } catch (error) {
    return handleAsyncError(error);
  }
};

export const handler = withRbac(baseHandler, 'templates', 'read');
```

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── components/templates/
│   ├── TemplateList.tsx
│   ├── TemplateForm.tsx
│   ├── TemplateCard.tsx
│   ├── TemplatePreview.tsx
│   ├── TemplateCategoryFilter.tsx
│   └── TemplateLibrary.tsx
├── pages/templates/
│   ├── TemplateListPage.tsx
│   ├── TemplateCreatePage.tsx
│   ├── TemplateEditPage.tsx
│   └── TemplateLibraryPage.tsx
├── hooks/
│   └── useTemplates.ts
├── services/
│   └── templatesApi.ts
└── types/
    └── template.ts
```

**Template Variables System:**

```typescript
// Template content with variables
const templateContent = `
Dear {{client_name}},

I'm excited to propose a {{project_type}} project for {{company_name}}.

Project Scope:
{{project_scope}}

Timeline: {{timeline}}
Budget: {{budget}}

Best regards,
{{freelancer_name}}
`;

// Variable replacement function
const replaceVariables = (content: string, variables: Record<string, string>) => {
  return content.replace(/\{\{(\w+)\}\}/g, (match, key) => variables[key] || match);
};
```

### Step 3: Integration

- [ ] Test API endpoints with Postman/curl
- [ ] Connect frontend to backend
- [ ] Verify template creation and usage flow
- [ ] Test public template browsing

## Acceptance Criteria

- [ ] Freelancers can create, edit, and delete their own templates
- [ ] Template library shows public templates from all users
- [ ] Template categories and search functionality work
- [ ] Variable replacement system works in templates
- [ ] Templates can be used to create new proposals (integration with F01)
- [ ] **Demo Ready:** Can create and use a template in 30 seconds
- [ ] **Full-Stack Working:** Frontend connects to backend, data persists in DynamoDB
- [ ] **Lambda Compatible:** All handlers work in serverless environment
- [ ] **Error Handling:** Graceful failure modes for all operations
- [ ] **Mobile Responsive:** Works on mobile devices

## Testing Checklist

- [ ] **Manual API Testing:**
  - Test CRUD operations with curl/Postman
  - Verify RBAC permissions (freelancer access only)
  - Test public vs private template access
  - Check error handling (401, 403, 404, 500)

- [ ] **Frontend Testing:**
  - Manual testing in browser
  - Test template form validation and submission
  - Test template preview functionality
  - Verify category filtering and search
  - Test responsive design on mobile

- [ ] **Integration:** End-to-end template creation and usage flow
- [ ] **Edge Cases:** Invalid data, missing fields, unauthorized access
- [ ] **Performance:** Template list loads in <2s

## Deployment Checklist

- [ ] **Code Review:** Self-review completed
- [ ] **Serverless Config:** Added function imports to serverless.yml
- [ ] **RBAC Config:** Verified permissions.ts includes templates module
- [ ] **Types:** Exported types for frontend use
- [ ] **Testing:** Manual testing completed
- [ ] **Documentation:** Updated shared types if needed

## Troubleshooting Guide

### Common Issues

1. **Template Variables Not Replacing**
   - Check variable syntax: {{variable_name}}
   - Verify variable replacement function
   - Test with simple variables first

2. **Public Templates Not Showing**
   - Check GSI query for public templates
   - Verify isPublic flag is set correctly
   - Test DynamoDB query patterns

3. **Rich Text Editor Issues**
   - Start with simple textarea, enhance later
   - Handle markdown parsing carefully
   - Sanitize content on backend

## Related Modules

- **Depends On:** None (Foundation module)
- **Enables:** M07 (Advanced Template Builder), M12 (AI Proposal Optimization)
- **Integrates With:** F01 (Proposal Management) - templates used to create proposals
- **Conflicts With:** None

## Template Categories

**Predefined Categories:**

- Web Design & Development
- Consulting & Strategy
- Content Writing & Marketing
- Graphic Design & Branding
- Software Development
- Business Services
- Other

**Default Template Examples:**

1. **Web Development Project** - Full-stack web application proposal
2. **Logo Design Package** - Branding and logo design services
3. **Content Marketing Strategy** - Monthly content creation proposal
4. **Business Consulting** - Strategic consulting engagement
5. **Mobile App Development** - iOS/Android app development proposal
