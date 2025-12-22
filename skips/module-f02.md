# Module F02: Client Management

## Overview

**Estimated Time:** 1hr

**Complexity:** Medium (Simple CRUD)

**Type:** Full-stack

**Risk Level:** Low

**Dependencies:** None

## Problem Context

Freelancers need to manage their client contacts and information. This module provides a client directory where freelancers can add, edit, and organize client details. Client information is used when creating proposals and invoices.

## Technical Requirements

### Backend Tasks

- [ ] **Handler File:** Create `handlers/listClients.ts` with typed handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbacOwn`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'clients', 'read')`
  - Support pagination (limit, offset) and search (by name, email, company)
  - Return clients owned by authenticated freelancer only

- [ ] **Handler File:** Create `handlers/getClient.ts` with typed handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbacOwn`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'clients', 'read')`
  - Extract clientId from path parameters
  - Verify ownership before returning data

- [ ] **Handler File:** Create `handlers/createClient.ts` with typed handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbacOwn`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'clients', 'create')`
  - Parse client data from request body
  - Generate unique client ID
  - Validate email format

- [ ] **Handler File:** Create `handlers/updateClient.ts` with typed handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbacOwn`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'clients', 'update')`
  - Verify ownership before updating
  - Validate updated data

- [ ] **Handler File:** Create `handlers/deleteClient.ts` with typed handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbacOwn`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'clients', 'delete')`
  - Verify ownership before deleting
  - Check if client has active proposals/invoices (soft delete or prevent)

- [ ] **Function Config:** Create YAML files for each handler
  - `functions/listClients.yml` - GET /api/clients
  - `functions/getClient.yml` - GET /api/clients/{id}
  - `functions/createClient.yml` - POST /api/clients
  - `functions/updateClient.yml` - PUT /api/clients/{id}
  - `functions/deleteClient.yml` - DELETE /api/clients/{id}

- [ ] **Service Layer:** Business logic in `services/ClientService.ts`
  - Create service class with methods for CRUD operations
  - Instantiate service at module level: `const clientService = new ClientService()`
  - Methods: listClients, getClient, createClient, updateClient, deleteClient
  - Validate client data (email format, required fields)
  - Check for duplicate emails within freelancer's clients

- [ ] **Type Definitions:** Add types to `types.ts` for requests/responses
  - Client interface with all fields
  - CreateClientRequest, UpdateClientRequest, ClientResponse types
  - ListClientsQuery, ListClientsResponse types

- [ ] **RBAC Verification:** Verify `config/permissions.ts` includes this module
  - Module 'clients' should be in `ALL_MODULES` list
  - Freelancer role has createOwn, readOwn, updateOwn, deleteOwn
  - Client role has readOwn only
  - Admin role has full access

- [ ] **AWS Service Integration:** Use shared/clients/\* wrappers
  - DynamoDB: `import { dynamodb } from '../../../shared/clients/dynamodb'`
  - **NEVER import @aws-sdk packages directly**

- [ ] **Error Handling:** Use `handleAsyncError()` and `commonErrors.*` consistently
  - Validation errors: `commonErrors.badRequest('Invalid email format')`
  - Not found: `commonErrors.notFound('Client')`
  - Duplicate: `commonErrors.conflict('Client with this email already exists')`

### Frontend Tasks

- [ ] **Pages/Components:**
  - `pages/clients/ClientListPage.tsx` - List all clients with search
  - `pages/clients/ClientCreatePage.tsx` - Create new client
  - `pages/clients/ClientEditPage.tsx` - Edit existing client
  - `pages/clients/ClientViewPage.tsx` - View client details and history
  - `components/clients/ClientList.tsx` - Table component with clients
  - `components/clients/ClientForm.tsx` - Form for create/edit
  - `components/clients/ClientCard.tsx` - Card view for clients
  - `components/clients/ClientSearch.tsx` - Search/filter component

- [ ] **shadcn Components:**
  - Button, Card, Table, Dialog, Form, Input, Select, Avatar, Badge

- [ ] **API Integration:**
  - Create `hooks/useClients.ts` with React Query
  - Methods: useClients (list), useClient (get), useCreateClient, useUpdateClient, useDeleteClient
  - Handle loading/error states
  - Invalidate queries after mutations

- [ ] **State Management:**
  - React Query for server state (clients data)
  - Local state for form inputs, search filters, modals

- [ ] **Routing:**
  - `/clients` - List page
  - `/clients/new` - Create page
  - `/clients/:id` - View page
  - `/clients/:id/edit` - Edit page

### Database Schema (Single Table)

```
PK: FREELANCER#{freelancerId} | SK: CLIENT#{clientId}
GSI1PK: EMAIL#{email} | GSI1SK: FREELANCER#{freelancerId}

Fields:
- clientId: string (unique ID)
- freelancerId: string (owner)
- name: string
- email: string
- company?: string
- phone?: string
- address?: string
- city?: string
- state?: string
- country?: string
- postalCode?: string
- notes?: string
- tags?: string[] (e.g., ['vip', 'recurring'])
- totalProposals?: number (calculated)
- totalInvoices?: number (calculated)
- totalRevenue?: number (calculated)
- createdAt: string (ISO timestamp)
- updatedAt: string (ISO timestamp)
```

## External Services

None required for this module.

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**BEFORE writing any code, spend 15-20 minutes studying:**

1. **Review Guidelines:**

   ```bash
   cat guidelines/QUICK_REFERENCE.md
   cat guidelines/CODING_GUIDELINES.md
   cat guidelines/API_DESIGN.md
   cat guidelines/STYLE_GUIDE.md  # IMPORTANT: Read for UI/UX consistency
   ```

2. **Study Similar Existing Modules:**

   ```bash
   ls -la backend/src/modules/users/handlers/
   cat backend/src/modules/users/services/ClerkUserService.ts
   cat backend/src/config/permissions.ts
   ```

3. **Review Style Guide for This Module:**
   - **Card Grid Layout:** 3 columns on desktop, responsive on mobile
   - **Avatar Pattern:** Use initials for client avatars
   - **Search Bar:** Prominent at top of page
   - **Quick Actions:** Floating action button on mobile
   - See `guidelines/STYLE_GUIDE.md` → "F02: Client Management" section

4. **Identify Reusable Patterns:**
   - Lambda handler structure
   - Service layer pattern
   - RBAC middleware usage
   - React Query hooks

### Step 1: Backend Implementation

**File Structure:**

```
backend/src/modules/clients/
├── handlers/
│   ├── listClients.ts
│   ├── getClient.ts
│   ├── createClient.ts
│   ├── updateClient.ts
│   └── deleteClient.ts
├── functions/
│   ├── listClients.yml
│   ├── getClient.yml
│   ├── createClient.yml
│   ├── updateClient.yml
│   └── deleteClient.yml
├── services/
│   └── ClientService.ts
└── types.ts
```

**Implementation Order:**

1. Create types.ts with all interfaces
2. Create ClientService.ts with business logic
3. Create handlers (create, list, get, update, delete)
4. Create YAML configs for each handler
5. Update serverless.yml to import functions

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── pages/clients/
│   ├── ClientListPage.tsx
│   ├── ClientCreatePage.tsx
│   ├── ClientEditPage.tsx
│   └── ClientViewPage.tsx
├── components/clients/
│   ├── ClientList.tsx
│   ├── ClientForm.tsx
│   ├── ClientCard.tsx
│   └── ClientSearch.tsx
├── hooks/
│   └── useClients.ts
└── types/
    └── client.ts
```

**Implementation Order:**

1. Create types/client.ts
2. Create hooks/useClients.ts
3. Create ClientList component
4. Create ClientForm component
5. Create page components
6. Add routes to App.tsx

### Step 3: Serverless Configuration

**Update serverless.yml:**

```yaml
functions:
  # ... existing functions ...

  # Client Management
  - ${file(src/modules/clients/functions/listClients.yml)}
  - ${file(src/modules/clients/functions/getClient.yml)}
  - ${file(src/modules/clients/functions/createClient.yml)}
  - ${file(src/modules/clients/functions/updateClient.yml)}
  - ${file(src/modules/clients/functions/deleteClient.yml)}
```

### Step 4: Integration

- [ ] Test API endpoints with Postman/curl
- [ ] Connect frontend to backend
- [ ] Verify data flow end-to-end

## LLM Prompts for Implementation

**Backend Handler Creation:**

```
Create Lambda handlers for client management following the existing pattern in backend/src/modules/users/handlers/.

Requirements:
- Use AuthenticatedAPIGatewayEvent type
- Wrap with withRbacOwn middleware for ownership checks
- Use successResponse and handleAsyncError
- Delegate business logic to ClientService
- Support search and pagination in list handler

Create handlers for: list, get, create, update, delete.
```

**Service Layer Creation:**

```
Create ClientService class in backend/src/modules/clients/services/ClientService.ts.

Requirements:
- Use DynamoDB client wrapper from shared/clients/dynamodb
- Implement methods: listClients, getClient, createClient, updateClient, deleteClient
- Validate email format
- Check for duplicate emails within freelancer's clients
- Support search by name, email, company
- Follow the pattern from ClerkUserService
```

**Frontend Component Creation:**

```
Create React components for client management using shadcn/ui components.

Requirements:
- ClientList: Table with clients, search bar, action buttons
- ClientForm: Form with validation for create/edit
- Use useClients hook for data fetching
- Handle loading and error states
- Use React Query for mutations
- Follow the pattern from client/src/components/admin/
```

## Acceptance Criteria

- [ ] Freelancers can add new clients with all details
- [ ] Freelancers can view list of their clients with search
- [ ] Freelancers can edit client information
- [ ] Freelancers can delete clients (with confirmation)
- [ ] Email validation works correctly
- [ ] Search filters clients by name, email, or company
- [ ] **Demo Ready:** Can add and view a client in 30 seconds
- [ ] **Full-Stack Working:** Frontend connects to backend, backend stores in DynamoDB
- [ ] **Lambda Compatible:** All handlers work in serverless environment
- [ ] **Error Handling:** Graceful failure modes for validation errors
- [ ] **Mobile Responsive:** Works on mobile devices

## Testing Checklist

- [ ] **Backend Unit Tests:** SKIP FOR HACKATHON
- [ ] **Manual API Testing:**
  - Create client: `POST /api/clients`
  - List clients: `GET /api/clients?search=john`
  - Get client: `GET /api/clients/{id}`
  - Update client: `PUT /api/clients/{id}`
  - Delete client: `DELETE /api/clients/{id}`
  - Test with Clerk token
  - Verify ownership checks
- [ ] **Frontend Testing:**
  - Create client form works
  - List page displays clients
  - Search filters work
  - Edit form pre-fills data
  - Delete confirmation works
- [ ] **Integration:** End-to-end flow from create to view
- [ ] **Edge Cases:**
  - Duplicate email validation
  - Required fields validated
  - Phone number format
- [ ] **Performance:** List loads in <2s

## Deployment Checklist

- [ ] **Code Review:** Self-review completed
- [ ] **Serverless Config:** Added function imports to serverless.yml
- [ ] **RBAC Config:** Verified permissions.ts includes 'clients' module
- [ ] **Types:** Exported types from types.ts for frontend use
- [ ] **Testing:** Manual testing completed

## Troubleshooting Guide

### Common Issues

1. **Duplicate Email Error**
   - Check GSI query for existing email
   - Ensure email is unique within freelancer's clients
   - Handle case-insensitive comparison

2. **Search Not Working**
   - Verify DynamoDB scan with filter expression
   - Check attribute names match schema
   - Consider using GSI for better performance

3. **Ownership Check Failing**
   - Verify withRbacOwn middleware is used
   - Check freelancerId matches authenticated user

## Related Modules

- **Depends On:** None (Foundation module)
- **Enables:** F01 (Proposal Management), M06 (Invoice Generation)
- **Conflicts With:** None
