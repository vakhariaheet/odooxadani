# Module F01: Proposal Management

## Overview

**Estimated Time:** 1hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Low

**Dependencies:** None

## Problem Context

Freelancers spend 2-3 hours creating custom proposals for each client using generic document editors, with no tracking of proposal status (viewed, accepted, rejected). This module provides the core proposal CRUD operations with real-time status tracking.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler Files:** Create proposal CRUD handlers with typed handlers
  - `handlers/listProposals.ts` - GET /api/proposals (freelancer's own proposals)
  - `handlers/getProposal.ts` - GET /api/proposals/:id (with role-based access)
  - `handlers/createProposal.ts` - POST /api/proposals (freelancer only)
  - `handlers/updateProposal.ts` - PUT /api/proposals/:id (freelancer own, client can update status)
  - `handlers/deleteProposal.ts` - DELETE /api/proposals/:id (freelancer own only)

- [ ] **Function Configs:** Create serverless function configurations
  - `functions/listProposals.yml` - List proposals endpoint
  - `functions/getProposal.yml` - Get single proposal endpoint
  - `functions/createProposal.yml` - Create proposal endpoint
  - `functions/updateProposal.yml` - Update proposal endpoint
  - `functions/deleteProposal.yml` - Delete proposal endpoint

- [ ] **Service Layer:** Business logic in `services/ProposalService.ts`
  - Create ProposalService class with CRUD methods
  - Status tracking (draft, sent, viewed, accepted, rejected)
  - Client notification logic
  - Proposal validation and sanitization

- [ ] **Type Definitions:** Add types to `types.ts`
  - Proposal interface with all fields
  - ProposalStatus enum
  - CreateProposalRequest/Response types
  - UpdateProposalRequest/Response types
  - ListProposalsQuery/Response types

- [ ] **RBAC Verification:** Verify `config/permissions.ts` includes proposals module
  - Module already configured in ROLE_MODULE_ACCESS
  - Freelancer: full CRUD on own proposals
  - Client: read-only access to proposals sent to them
  - Admin: full access to all proposals

- [ ] **AWS Service Integration:** Use existing DynamoDB client
  - Import from `shared/clients/dynamodb`
  - Follow single-table design patterns
  - Use GSI for client-based queries

- [ ] **Error Handling:** Use `handleAsyncError()` and `commonErrors.*`

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.ts, .spec.ts) - Skip unit tests for hackathon speed

### Frontend Tasks

- [ ] **Components:** Build proposal management UI
  - `ProposalList.tsx` - List view with shadcn table, status badges
  - `ProposalForm.tsx` - Create/edit form with rich text editor
  - `ProposalCard.tsx` - Card component for grid view
  - `ProposalDetails.tsx` - Detail view with status timeline
  - `ProposalStatusBadge.tsx` - Status indicator component

- [ ] **Pages:** Create proposal pages
  - `ProposalListPage.tsx` - Main proposals dashboard
  - `ProposalCreatePage.tsx` - New proposal creation
  - `ProposalEditPage.tsx` - Edit existing proposal
  - `ProposalViewPage.tsx` - View proposal details

- [ ] **shadcn Components:** button, form, table, dialog, badge, card, textarea, select

- [ ] **API Integration:** Connect to proposal endpoints
  - Use `useApi` hook for CRUD operations
  - Handle loading states and error messages
  - Real-time status updates

- [ ] **State Management:** Local state for form data, React Query for server state

- [ ] **Routing:** Add proposal routes to React Router
  - `/proposals` - List page
  - `/proposals/new` - Create page
  - `/proposals/:id` - View page
  - `/proposals/:id/edit` - Edit page

- [ ] **Responsive Design:** Mobile-first approach with Tailwind CSS

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.tsx, .spec.tsx) - Skip unit tests for hackathon speed

### Database Schema (Single Table)

```
pk: PROPOSAL#[id] | sk: METADATA | gsi1pk: FREELANCER#[freelancerId] | gsi1sk: PROPOSAL#[createdAt]
pk: PROPOSAL#[id] | sk: CLIENT#[clientId] | gsi1pk: CLIENT#[clientId] | gsi1sk: PROPOSAL#[createdAt]

Fields:
- id: string (UUID)
- title: string
- description: string (rich text)
- freelancerId: string
- clientId: string
- clientEmail: string
- status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected'
- amount: number
- currency: string
- deliverables: string[]
- timeline: string
- terms: string
- createdAt: string (ISO)
- updatedAt: string (ISO)
- viewedAt?: string (ISO)
- respondedAt?: string (ISO)
```

## External Services

### Email Service (SES)

- **Purpose:** Send proposal notifications to clients
- **Setup Steps:**
  1. Use existing SES client from `shared/clients/ses`
  2. Configure email templates for proposal notifications
- **Environment Variables:** Already configured in existing setup
- **Code Pattern:** `await ses.sendEmail({ to, subject, body })`

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** You MUST read `guidelines/project-architecture.md` COMPLETELY before writing any code.

**MANDATORY Reading (15-20 minutes):**

1. **Read `guidelines/project-architecture.md` COMPLETELY** (REQUIRED):
   - Complete backend and frontend architecture
   - Technology stack and existing capabilities
   - Database design and patterns
   - Authentication and authorization flow
   - API endpoint conventions
   - Clean architecture layers
   - Existing features (don't rebuild what exists)

2. **Study Similar Existing Modules:**
   - Review existing modules in `backend/src/modules/` for patterns
   - Check `backend/src/shared/clients/` for available AWS service clients
   - Examine `client/src/components/admin/` for UI patterns
   - Study `client/src/hooks/` for React Query integration examples

3. **Identify Reusable Patterns:**
   - Follow existing module structure and conventions
   - Use established RBAC and authentication patterns
   - Leverage existing AWS client wrappers
   - Reuse frontend components and hooks

**What to Look For:**

- How are handlers structured?
- How does RBAC middleware work?
- What client wrappers are available?
- How are types shared between backend/frontend?
- What shadcn components exist?
- How is error handling done?

**Time Saved:** 15 min study → Saves 2-3 hours of trial and error

### Step 1: Backend Implementation (Lambda-Compatible)

**File Structure:**

```
backend/src/modules/proposals/
├── handlers/
│   ├── listProposals.ts         # GET /api/proposals
│   ├── getProposal.ts          # GET /api/proposals/:id
│   ├── createProposal.ts       # POST /api/proposals
│   ├── updateProposal.ts       # PUT /api/proposals/:id
│   └── deleteProposal.ts       # DELETE /api/proposals/:id
├── functions/
│   ├── listProposals.yml        # Serverless function config
│   ├── getProposal.yml
│   ├── createProposal.yml
│   ├── updateProposal.yml
│   └── deleteProposal.yml
├── services/
│   └── ProposalService.ts      # Business logic and data operations
└── types.ts                    # Domain-specific TypeScript types
```

**Handler Pattern:**

```typescript
// handlers/createProposal.ts
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { ProposalService } from '../services/ProposalService';

const proposalService = new ProposalService();

const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const userId = event.auth.userid;

    const proposal = await proposalService.createProposal(userId, body);
    return successResponse(proposal, 201);
  } catch (error) {
    return handleAsyncError(error);
  }
};

/**
 * Create proposal handler
 * @route POST /api/proposals
 */
export const handler = withRbac(baseHandler, 'proposals', 'create');
```

**Service Layer Example:**

```typescript
// services/ProposalService.ts
export class ProposalService {
  async listProposals(userId: string, query: ListQuery): Promise<ProposalListResponse> {
    // Business logic here
    // Call DynamoDB, handle pagination, etc.
  }

  async getProposal(id: string, userId: string): Promise<Proposal> {
    // Fetch single proposal with ownership checks
  }

  async createProposal(userId: string, data: CreateProposalRequest): Promise<Proposal> {
    // Create new proposal with validation
  }

  async updateProposal(id: string, userId: string, data: UpdateProposalRequest): Promise<Proposal> {
    // Update proposal with ownership checks
  }

  async deleteProposal(id: string, userId: string): Promise<void> {
    // Delete proposal with ownership checks
  }
}
```

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── components/proposals/
│   ├── ProposalList.tsx      # List view with shadcn table
│   ├── ProposalForm.tsx      # Create/edit form with shadcn components
│   ├── ProposalCard.tsx      # Card component for grid views
│   ├── ProposalDetails.tsx   # Detail view component
│   └── ProposalStatusBadge.tsx # Status indicator
├── pages/proposals/
│   ├── ProposalListPage.tsx  # List page wrapper
│   ├── ProposalCreatePage.tsx # Create page wrapper
│   ├── ProposalEditPage.tsx  # Edit page wrapper
│   └── ProposalViewPage.tsx  # View page wrapper
├── hooks/
│   └── useProposals.ts       # API integration hooks
├── services/
│   └── proposalsApi.ts       # API service functions
└── types/
    └── proposal.ts           # Frontend-specific types
```

**Implementation Pattern:**

```typescript
// hooks/useProposals.ts - React Query integration
// services/proposalsApi.ts - Axios/fetch wrapper with error handling
// components/proposals/ - Reusable UI components with TypeScript
```

### Step 3: Serverless Configuration

**Update serverless.yml:**

```yaml
# Add function imports at the end of serverless.yml
functions:
  # ... existing functions ...

  # Import proposal module functions
  - ${file(src/modules/proposals/functions/listProposals.yml)}
  - ${file(src/modules/proposals/functions/getProposal.yml)}
  - ${file(src/modules/proposals/functions/createProposal.yml)}
  - ${file(src/modules/proposals/functions/updateProposal.yml)}
  - ${file(src/modules/proposals/functions/deleteProposal.yml)}
```

### Step 4: Integration

- [ ] Test API endpoint with Postman/curl
- [ ] Connect frontend to backend
- [ ] Verify data flow end-to-end

## Acceptance Criteria

- [ ] Freelancers can create, edit, and delete their own proposals
- [ ] Clients can view proposals sent to them and update status (accept/reject)
- [ ] Real-time status tracking (draft, sent, viewed, accepted, rejected)
- [ ] Responsive proposal form with rich text editing
- [ ] **Demo Ready:** Can create and view a complete proposal in 30 seconds
- [ ] **Full-Stack Working:** Frontend connects to backend, data persists in DynamoDB
- [ ] **Lambda Compatible:** All handlers work in serverless environment
- [ ] **Error Handling:** Graceful failure modes for all operations
- [ ] **Mobile Responsive:** Works on mobile devices

## Testing Checklist

- [ ] **Backend Unit Tests:** **SKIP FOR HACKATHON** (Time constraint - focus on working features)

- [ ] **Manual API Testing:**
  - Test with curl or Postman
  - Verify authentication with Clerk token
  - Check response format matches ApiResponse type
  - Test error cases (401, 403, 404, 500)

- [ ] **Frontend Testing:**
  - Manual testing in browser
  - Test loading states
  - Test error handling
  - Test form validation
  - Test responsive design on mobile

- [ ] **Integration:** End-to-end flow works as expected
- [ ] **Edge Cases:** Error scenarios handled gracefully
- [ ] **Performance:** Acceptable load times (<2s for API calls)

## Deployment Checklist

- [ ] **Code Review:** Self-review completed
- [ ] **Serverless Config:** Added function imports to serverless.yml
- [ ] **RBAC Config:** Updated permissions.ts if new module added
- [ ] **Types:** Exported types from module's types.ts for frontend use
- [ ] **Testing:** Manual testing completed
- [ ] **Documentation:** Updated any shared types/interfaces

## Troubleshooting Guide

### Common Issues

1. **401 Unauthorized Error**
   - **Symptom:** API returns 401 even with valid Clerk token
   - **Solution:**
     - Check CLERK_ISSUER_URL in backend/.env matches your Clerk instance
     - Verify JWT template in Clerk includes custom claims (role, email, userid)
     - Ensure token is passed in Authorization header: `Bearer <token>`
     - Check token hasn't expired

2. **403 Forbidden Error**
   - **Symptom:** API returns 403 "You don't have permission"
   - **Solution:**
     - Check user's role in Clerk public_metadata: `{ "role": "freelancer" }` or `{ "role": "client" }`
     - Verify RBAC permissions in config/permissions.ts include the proposals module and action
     - Check handler uses correct withRbac wrapper with right module name and action

3. **Handler Not Found / 502 Error**
   - **Symptom:** API Gateway returns 502 or "Handler not found"
   - **Solution:**
     - Verify handler path in YAML matches actual file location
     - Check handler exports `handler` function: `export const handler = ...`
     - Run `npm run build` to check for TypeScript errors
     - Redeploy: `./deploy.sh <stage>`

4. **CORS Error in Browser**
   - **Symptom:** Browser blocks request with CORS error
   - **Solution:**
     - Verify serverless.yml has `httpApi.cors: true`
     - Check response includes CORS headers (handled by successResponse/errorResponse)
     - For local development, use serverless-offline plugin

5. **Environment Variables Not Working**
   - **Symptom:** process.env.VARIABLE is undefined
   - **Solution:**
     - Check .env file exists in backend/ directory
     - Verify serverless.yml includes `useDotenv: true`
     - Add variable to provider.environment section in serverless.yml
     - Redeploy after changing environment variables

## Related Modules

- **Depends On:** None (Foundation module)
- **Enables:** M05 (Enhanced Proposal Features), M09 (Invoice Generation)
- **Integrates With:** F03 (Template System) - proposals can be created from templates
- **Conflicts With:** None
