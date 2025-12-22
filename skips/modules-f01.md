# Module F01: Proposal Management

## Overview

**Estimated Time:** 1hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Low

**Dependencies:** None

## Problem Context

Freelancers need to create professional proposals for potential clients. This module provides a proposal builder with templates, allowing freelancers to create, edit, and send proposals. Proposals include project details, scope of work, pricing, and timeline.

## Technical Requirements

### Backend Tasks

- [ ] **Handler File:** Create `handlers/listProposals.ts` with typed handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbacOwn`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'proposals', 'read')`
  - Always use try-catch with `handleAsyncError(error)` in catch block
  - Support pagination (limit, offset) and filtering (status, clientId)

- [ ] **Handler File:** Create `handlers/getProposal.ts` with typed handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbacOwn`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'proposals', 'read')`
  - Extract proposalId from path parameters
  - Verify ownership before returning data

- [ ] **Handler File:** Create `handlers/createProposal.ts` with typed handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbacOwn`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'proposals', 'create')`
  - Parse proposal data from request body
  - Generate unique proposal ID
  - Set initial status to 'draft'

- [ ] **Handler File:** Create `handlers/updateProposal.ts` with typed handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbacOwn`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'proposals', 'update')`
  - Verify ownership before updating
  - Prevent updates to sent/accepted proposals

- [ ] **Handler File:** Create `handlers/deleteProposal.ts` with typed handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbacOwn`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'proposals', 'delete')`
  - Verify ownership before deleting
  - Only allow deletion of draft proposals

- [ ] **Handler File:** Create `handlers/sendProposal.ts` with typed handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbacOwn`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'proposals', 'update')`
  - Change status from 'draft' to 'sent'
  - Trigger email notification to client
  - Generate shareable link for client

- [ ] **Function Config:** Create YAML files for each handler
  - `functions/listProposals.yml` - GET /api/proposals
  - `functions/getProposal.yml` - GET /api/proposals/{id}
  - `functions/createProposal.yml` - POST /api/proposals
  - `functions/updateProposal.yml` - PUT /api/proposals/{id}
  - `functions/deleteProposal.yml` - DELETE /api/proposals/{id}
  - `functions/sendProposal.yml` - POST /api/proposals/{id}/send

- [ ] **Service Layer:** Business logic in `services/ProposalService.ts`
  - Create service class with methods for CRUD operations
  - Instantiate service at module level: `const proposalService = new ProposalService()`
  - Methods: listProposals, getProposal, createProposal, updateProposal, deleteProposal, sendProposal
  - Validate proposal data (required fields, pricing format)
  - Generate unique proposal numbers (e.g., PROP-2024-001)

- [ ] **Type Definitions:** Add types to `types.ts` for requests/responses
  - ProposalStatus: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected'
  - PricingType: 'fixed' | 'hourly'
  - Proposal interface with all fields
  - CreateProposalRequest, UpdateProposalRequest, ProposalResponse types

- [ ] **RBAC Verification:** Verify `config/permissions.ts` includes this module
  - Module 'proposals' should be in `ALL_MODULES` list
  - Freelancer role has createOwn, readOwn, updateOwn, deleteOwn
  - Client role has readOwn only
  - Admin role has full access

- [ ] **AWS Service Integration:** Use shared/clients/\* wrappers
  - DynamoDB: `import { dynamodb } from '../../../shared/clients/dynamodb'`
  - SES: `import { sesClient } from '../../../shared/clients/ses'` (for email notifications)
  - **NEVER import @aws-sdk packages directly**

- [ ] **Error Handling:** Use `handleAsyncError()` and `commonErrors.*` consistently
  - Validation errors: `commonErrors.badRequest('Invalid proposal data')`
  - Not found: `commonErrors.notFound('Proposal')`
  - Ownership errors: `commonErrors.forbidden()`

### Frontend Tasks

- [ ] **Pages/Components:**
  - `pages/proposals/ProposalListPage.tsx` - List all proposals with filters
  - `pages/proposals/ProposalCreatePage.tsx` - Create new proposal
  - `pages/proposals/ProposalEditPage.tsx` - Edit existing proposal
  - `pages/proposals/ProposalViewPage.tsx` - View proposal details
  - `components/proposals/ProposalList.tsx` - Table component with proposals
  - `components/proposals/ProposalForm.tsx` - Form for create/edit
  - `components/proposals/ProposalCard.tsx` - Card view for proposals
  - `components/proposals/ProposalStatusBadge.tsx` - Status indicator

- [ ] **shadcn Components:**
  - Button, Card, Table, Dialog, Form, Input, Textarea, Select, Badge, Tabs

- [ ] **API Integration:**
  - Create `hooks/useProposals.ts` with React Query
  - Methods: useProposals (list), useProposal (get), useCreateProposal, useUpdateProposal, useDeleteProposal, useSendProposal
  - Handle loading/error states
  - Invalidate queries after mutations

- [ ] **State Management:**
  - React Query for server state (proposals data)
  - Local state for form inputs and UI state (modals, filters)

- [ ] **Routing:**
  - `/proposals` - List page
  - `/proposals/new` - Create page
  - `/proposals/:id` - View page
  - `/proposals/:id/edit` - Edit page

### Database Schema (Single Table)

```
PK: FREELANCER#{freelancerId} | SK: PROPOSAL#{proposalId}
GSI1PK: CLIENT#{clientId} | GSI1SK: PROPOSAL#{proposalId}
GSI2PK: STATUS#{status} | GSI2SK: CREATED#{timestamp}

Fields:
- proposalId: string (unique ID)
- proposalNumber: string (human-readable, e.g., PROP-2024-001)
- freelancerId: string (owner)
- clientId: string (recipient)
- clientEmail: string
- clientName: string
- title: string
- description: string
- scopeOfWork: string (markdown)
- pricingType: 'fixed' | 'hourly'
- amount: number
- hourlyRate?: number
- estimatedHours?: number
- currency: string (default: 'USD')
- validUntil: string (ISO date)
- status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected'
- sentAt?: string (ISO timestamp)
- viewedAt?: string (ISO timestamp)
- respondedAt?: string (ISO timestamp)
- shareableLink?: string
- createdAt: string (ISO timestamp)
- updatedAt: string (ISO timestamp)
```

## External Services

None

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**BEFORE writing any code, spend 15-20 minutes studying:**

1. **Review Guidelines:**

   ```bash
   cat guidelines/QUICK_REFERENCE.md
   cat guidelines/CODING_GUIDELINES.md
   cat guidelines/API_DESIGN.md
   ```

2. **Study Similar Existing Modules:**

   ```bash
   ls -la backend/src/modules/users/handlers/
   cat backend/src/modules/users/services/ClerkUserService.ts
   cat backend/src/config/permissions.ts
   ls -la client/src/components/admin/
   cat client/src/hooks/useUsers.ts
   ```

3. **Identify Reusable Patterns:**
   - Lambda handler structure
   - Service layer pattern
   - RBAC middleware usage
   - React Query hooks
   - shadcn/ui components

### Step 1: Backend Implementation

**File Structure:**

```
backend/src/modules/proposals/
├── handlers/
│   ├── listProposals.ts
│   ├── getProposal.ts
│   ├── createProposal.ts
│   ├── updateProposal.ts
│   ├── deleteProposal.ts
│   └── sendProposal.ts
├── functions/
│   ├── listProposals.yml
│   ├── getProposal.yml
│   ├── createProposal.yml
│   ├── updateProposal.yml
│   ├── deleteProposal.yml
│   └── sendProposal.yml
├── services/
│   └── ProposalService.ts
└── types.ts
```

**Implementation Order:**

1. Create types.ts with all interfaces
2. Create ProposalService.ts with business logic
3. Create handlers (start with create, then list, get, update, delete, send)
4. Create YAML configs for each handler
5. Update serverless.yml to import functions

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── pages/proposals/
│   ├── ProposalListPage.tsx
│   ├── ProposalCreatePage.tsx
│   ├── ProposalEditPage.tsx
│   └── ProposalViewPage.tsx
├── components/proposals/
│   ├── ProposalList.tsx
│   ├── ProposalForm.tsx
│   ├── ProposalCard.tsx
│   └── ProposalStatusBadge.tsx
├── hooks/
│   └── useProposals.ts
└── types/
    └── proposal.ts
```

**Implementation Order:**

1. Create types/proposal.ts (match backend types)
2. Create hooks/useProposals.ts with React Query
3. Create ProposalList component
4. Create ProposalForm component
5. Create page components
6. Add routes to App.tsx

### Step 3: Serverless Configuration

**Update serverless.yml:**

```yaml
functions:
  # ... existing functions ...

  # Proposal Management
  - ${file(src/modules/proposals/functions/listProposals.yml)}
  - ${file(src/modules/proposals/functions/getProposal.yml)}
  - ${file(src/modules/proposals/functions/createProposal.yml)}
  - ${file(src/modules/proposals/functions/updateProposal.yml)}
  - ${file(src/modules/proposals/functions/deleteProposal.yml)}
  - ${file(src/modules/proposals/functions/sendProposal.yml)}
```

### Step 4: Integration

- [ ] Test API endpoints with Postman/curl
- [ ] Connect frontend to backend
- [ ] Verify data flow end-to-end
- [ ] Test email sending (use test mode)

## LLM Prompts for Implementation

**Backend Handler Creation:**

```
Create Lambda handlers for proposal management following the existing pattern in backend/src/modules/users/handlers/.

Requirements:
- Use AuthenticatedAPIGatewayEvent type
- Wrap with withRbacOwn middleware for ownership checks
- Use successResponse and handleAsyncError
- Delegate business logic to ProposalService
- Handle errors gracefully

Create handlers for: list, get, create, update, delete, and send proposal.
```

**Service Layer Creation:**

```
Create ProposalService class in backend/src/modules/proposals/services/ProposalService.ts.

Requirements:
- Use DynamoDB client wrapper from shared/clients/dynamodb
- Implement methods: listProposals, getProposal, createProposal, updateProposal, deleteProposal, sendProposal
- Generate unique proposal numbers (PROP-YYYY-NNN format)
- Validate proposal data
- Use SES client for sending email notifications
- Follow the pattern from ClerkUserService
```

**Frontend Component Creation:**

```
Create React components for proposal management using shadcn/ui components.

Requirements:
- ProposalList: Table with proposals, status badges, action buttons
- ProposalForm: Form with validation for create/edit
- Use useProposals hook for data fetching
- Handle loading and error states
- Use React Query for mutations
- Follow the pattern from client/src/components/admin/
```

## Acceptance Criteria

- [ ] Freelancers can create proposals with all required fields
- [ ] Freelancers can view list of their proposals with status
- [ ] Freelancers can edit draft proposals
- [ ] Freelancers can delete draft proposals only
- [ ] Freelancers can send proposals to clients (changes status to 'sent')
- [ ] Email notification sent to client when proposal is sent
- [ ] Clients can view proposals sent to them (via shareable link)
- [ ] **Demo Ready:** Can create, edit, and send a proposal in 30 seconds
- [ ] **Full-Stack Working:** Frontend connects to backend, backend stores in DynamoDB
- [ ] **Lambda Compatible:** All handlers work in serverless environment
- [ ] **Error Handling:** Graceful failure modes for validation errors, not found, etc.
- [ ] **Mobile Responsive:** Works on mobile devices

## Testing Checklist

- [ ] **Backend Unit Tests:** SKIP FOR HACKATHON
- [ ] **Manual API Testing:**
  - Create proposal: `POST /api/proposals`
  - List proposals: `GET /api/proposals`
  - Get proposal: `GET /api/proposals/{id}`
  - Update proposal: `PUT /api/proposals/{id}`
  - Delete proposal: `DELETE /api/proposals/{id}`
  - Send proposal: `POST /api/proposals/{id}/send`
  - Test with Clerk token in Authorization header
  - Verify ownership checks work
- [ ] **Frontend Testing:**
  - Create proposal form works
  - List page displays proposals
  - Edit form pre-fills data
  - Delete confirmation works
  - Send proposal triggers email
  - Status badges display correctly
- [ ] **Integration:** End-to-end flow from create to send
- [ ] **Edge Cases:**
  - Cannot edit sent proposals
  - Cannot delete sent proposals
  - Email validation works
  - Required fields validated
- [ ] **Performance:** List loads in <2s, create/update in <1s

## Deployment Checklist

- [ ] **Code Review:** Self-review completed
- [ ] **Serverless Config:** Added function imports to serverless.yml
- [ ] **RBAC Config:** Verified permissions.ts includes 'proposals' module
- [ ] **Types:** Exported types from types.ts for frontend use
- [ ] **Testing:** Manual testing completed
- [ ] **Environment Variables:** EMAIL_API_KEY, EMAIL_FROM configured

## Troubleshooting Guide

### Common Issues

1. **Email Not Sending**
   - Check EMAIL_API_KEY is set in .env
   - Verify sender email is verified in Resend/SendGrid
   - Check email service logs for errors
   - Use test mode for development

2. **Ownership Check Failing**
   - Verify withRbacOwn middleware is used
   - Check freelancerId matches authenticated user
   - Ensure DynamoDB query uses correct PK

3. **Proposal Number Generation**
   - Ensure counter is atomic (use DynamoDB conditional updates)
   - Handle race conditions with retry logic

## Related Modules

- **Depends On:** None (Foundation module)
- **Enables:** M05 (Contract Generation), M06 (Invoice Generation)
- **Conflicts With:** None
