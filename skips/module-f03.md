# Module F03: Invoice Management

## Overview

**Estimated Time:** 1hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Low

**Dependencies:** None

## Problem Context

Freelancers need to generate and track invoices for their work. This module provides invoice creation with templates (hourly/fixed rate), payment status tracking, and automated reminders. Invoices can be generated from accepted proposals or created independently.

## Technical Requirements

### Backend Tasks

- [ ] **Handler File:** Create `handlers/listInvoices.ts` with typed handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbacOwn`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'invoices', 'read')`
  - Support pagination and filtering (status, clientId, dateRange)
  - Return invoices owned by authenticated freelancer

- [ ] **Handler File:** Create `handlers/getInvoice.ts` with typed handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbacOwn`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'invoices', 'read')`
  - Extract invoiceId from path parameters
  - Verify ownership before returning data

- [ ] **Handler File:** Create `handlers/createInvoice.ts` with typed handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbacOwn`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'invoices', 'create')`
  - Parse invoice data from request body
  - Generate unique invoice number
  - Calculate totals (subtotal, tax, total)
  - Set initial status to 'draft'

- [ ] **Handler File:** Create `handlers/updateInvoice.ts` with typed handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbacOwn`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'invoices', 'update')`
  - Verify ownership before updating
  - Prevent updates to paid invoices
  - Recalculate totals if line items changed

- [ ] **Handler File:** Create `handlers/deleteInvoice.ts` with typed handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbacOwn`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'invoices', 'delete')`
  - Verify ownership before deleting
  - Only allow deletion of draft invoices

- [ ] **Handler File:** Create `handlers/sendInvoice.ts` with typed handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbacOwn`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'invoices', 'update')`
  - Change status from 'draft' to 'sent'
  - Trigger email notification to client
  - Generate shareable payment link

- [ ] **Handler File:** Create `handlers/markPaid.ts` with typed handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbacOwn`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'invoices', 'update')`
  - Change status to 'paid'
  - Record payment date and method
  - Send payment confirmation email

- [ ] **Function Config:** Create YAML files for each handler
  - `functions/listInvoices.yml` - GET /api/invoices
  - `functions/getInvoice.yml` - GET /api/invoices/{id}
  - `functions/createInvoice.yml` - POST /api/invoices
  - `functions/updateInvoice.yml` - PUT /api/invoices/{id}
  - `functions/deleteInvoice.yml` - DELETE /api/invoices/{id}
  - `functions/sendInvoice.yml` - POST /api/invoices/{id}/send
  - `functions/markPaid.yml` - POST /api/invoices/{id}/mark-paid

- [ ] **Service Layer:** Business logic in `services/InvoiceService.ts`
  - Create service class with methods for CRUD operations
  - Instantiate service at module level: `const invoiceService = new InvoiceService()`
  - Methods: listInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, sendInvoice, markPaid
  - Generate unique invoice numbers (INV-2024-001)
  - Calculate totals (subtotal, tax, total)
  - Validate invoice data

- [ ] **Type Definitions:** Add types to `types.ts` for requests/responses
  - InvoiceStatus: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'
  - InvoiceType: 'fixed' | 'hourly'
  - PaymentMethod: 'bank_transfer' | 'credit_card' | 'paypal' | 'stripe' | 'other'
  - InvoiceLineItem interface
  - Invoice interface with all fields
  - CreateInvoiceRequest, UpdateInvoiceRequest, InvoiceResponse types

- [ ] **RBAC Verification:** Verify `config/permissions.ts` includes this module
  - Module 'invoices' should be in `ALL_MODULES` list
  - Freelancer role has createOwn, readOwn, updateOwn, deleteOwn
  - Client role has readOwn only
  - Admin role has full access

- [ ] **AWS Service Integration:** Use shared/clients/\* wrappers
  - DynamoDB: `import { dynamodb } from '../../../shared/clients/dynamodb'`
  - SES: `import { sesClient } from '../../../shared/clients/ses'`
  - **NEVER import @aws-sdk packages directly**

- [ ] **Error Handling:** Use `handleAsyncError()` and `commonErrors.*` consistently

### Frontend Tasks

- [ ] **Pages/Components:**
  - `pages/invoices/InvoiceListPage.tsx` - List all invoices with filters
  - `pages/invoices/InvoiceCreatePage.tsx` - Create new invoice
  - `pages/invoices/InvoiceEditPage.tsx` - Edit existing invoice
  - `pages/invoices/InvoiceViewPage.tsx` - View invoice details
  - `components/invoices/InvoiceList.tsx` - Table component
  - `components/invoices/InvoiceForm.tsx` - Form for create/edit
  - `components/invoices/InvoiceLineItems.tsx` - Line items editor
  - `components/invoices/InvoiceStatusBadge.tsx` - Status indicator
  - `components/invoices/InvoicePreview.tsx` - Preview before sending

- [ ] **shadcn Components:**
  - Button, Card, Table, Dialog, Form, Input, Select, Badge, Tabs, Calendar

- [ ] **API Integration:**
  - Create `hooks/useInvoices.ts` with React Query
  - Methods: useInvoices, useInvoice, useCreateInvoice, useUpdateInvoice, useDeleteInvoice, useSendInvoice, useMarkPaid
  - Handle loading/error states
  - Invalidate queries after mutations

- [ ] **State Management:**
  - React Query for server state
  - Local state for form inputs, line items, calculations

- [ ] **Routing:**
  - `/invoices` - List page
  - `/invoices/new` - Create page
  - `/invoices/:id` - View page
  - `/invoices/:id/edit` - Edit page

### Database Schema (Single Table)

```
PK: FREELANCER#{freelancerId} | SK: INVOICE#{invoiceId}
GSI1PK: CLIENT#{clientId} | GSI1SK: INVOICE#{invoiceId}
GSI2PK: STATUS#{status} | GSI2SK: DUEDATE#{dueDate}

Fields:
- invoiceId: string (unique ID)
- invoiceNumber: string (INV-2024-001)
- freelancerId: string (owner)
- clientId: string
- clientName: string
- clientEmail: string
- clientAddress?: string
- invoiceType: 'fixed' | 'hourly'
- lineItems: InvoiceLineItem[]
  - description: string
  - quantity: number
  - rate: number
  - amount: number
- subtotal: number
- taxRate: number (percentage)
- taxAmount: number
- total: number
- currency: string (default: 'USD')
- issueDate: string (ISO date)
- dueDate: string (ISO date)
- status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'
- paymentMethod?: string
- paidAt?: string (ISO timestamp)
- notes?: string
- terms?: string
- sentAt?: string (ISO timestamp)
- viewedAt?: string (ISO timestamp)
- shareableLink?: string
- proposalId?: string (if generated from proposal)
- createdAt: string (ISO timestamp)
- updatedAt: string (ISO timestamp)
```

## External Services

### Resend/SendGrid (Email)

- **Purpose:** Send invoice notifications and reminders
- **Setup Steps:**
  1. Use same setup as Proposal module
  2. Add invoice email templates
- **Environment Variables:** `EMAIL_API_KEY`, `EMAIL_FROM`
- **NPM Package:** `npm install resend` or `@sendgrid/mail`

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**BEFORE writing any code, spend 15-20 minutes studying:**

1. **Review Guidelines:**

   ```bash
   cat guidelines/QUICK_REFERENCE.md
   cat guidelines/CODING_GUIDELINES.md
   cat guidelines/STYLE_GUIDE.md  # IMPORTANT: Read for UI/UX consistency
   ```

2. **Study Similar Existing Modules:**

   ```bash
   ls -la backend/src/modules/users/handlers/
   cat backend/src/modules/users/services/ClerkUserService.ts
   ```

3. **Review Style Guide for This Module:**
   - **Number Formatting:** Right-align all currency amounts, use monospace font
   - **Line Items Editor:** Dynamic add/remove rows with real-time calculations
   - **Status Colors:** Draft (gray), Sent (blue), Paid (green), Overdue (red)
   - **Overdue Highlighting:** Red background tint for overdue invoices
   - **Currency Display:** Use Intl.NumberFormat for consistent formatting
   - See `guidelines/STYLE_GUIDE.md` → "F03: Invoice Management" section

4. **Study F01 (Proposal Management):**
   - Similar structure and patterns
   - Reuse email sending logic
   - Similar status workflow

### Step 1: Backend Implementation

**File Structure:**

```
backend/src/modules/invoices/
├── handlers/
│   ├── listInvoices.ts
│   ├── getInvoice.ts
│   ├── createInvoice.ts
│   ├── updateInvoice.ts
│   ├── deleteInvoice.ts
│   ├── sendInvoice.ts
│   └── markPaid.ts
├── functions/
│   ├── listInvoices.yml
│   ├── getInvoice.yml
│   ├── createInvoice.yml
│   ├── updateInvoice.yml
│   ├── deleteInvoice.yml
│   ├── sendInvoice.yml
│   └── markPaid.yml
├── services/
│   └── InvoiceService.ts
└── types.ts
```

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── pages/invoices/
│   ├── InvoiceListPage.tsx
│   ├── InvoiceCreatePage.tsx
│   ├── InvoiceEditPage.tsx
│   └── InvoiceViewPage.tsx
├── components/invoices/
│   ├── InvoiceList.tsx
│   ├── InvoiceForm.tsx
│   ├── InvoiceLineItems.tsx
│   ├── InvoiceStatusBadge.tsx
│   └── InvoicePreview.tsx
├── hooks/
│   └── useInvoices.ts
└── types/
    └── invoice.ts
```

### Step 3: Serverless Configuration

**Update serverless.yml:**

```yaml
functions:
  # Invoice Management
  - ${file(src/modules/invoices/functions/listInvoices.yml)}
  - ${file(src/modules/invoices/functions/getInvoice.yml)}
  - ${file(src/modules/invoices/functions/createInvoice.yml)}
  - ${file(src/modules/invoices/functions/updateInvoice.yml)}
  - ${file(src/modules/invoices/functions/deleteInvoice.yml)}
  - ${file(src/modules/invoices/functions/sendInvoice.yml)}
  - ${file(src/modules/invoices/functions/markPaid.yml)}
```

### Step 4: Integration

- [ ] Test API endpoints
- [ ] Connect frontend to backend
- [ ] Verify calculations work correctly
- [ ] Test email sending

## LLM Prompts for Implementation

**Backend Handler Creation:**

```
Create Lambda handlers for invoice management following the pattern from proposals module.

Requirements:
- Use AuthenticatedAPIGatewayEvent and withRbacOwn
- Implement handlers: list, get, create, update, delete, send, markPaid
- Delegate to InvoiceService
- Handle calculations in service layer
```

**Service Layer Creation:**

```
Create InvoiceService class with invoice business logic.

Requirements:
- Calculate subtotal, tax, and total
- Generate unique invoice numbers
- Validate line items
- Send email notifications
- Follow ProposalService pattern
```

**Frontend Component Creation:**

```
Create invoice management components with line items editor.

Requirements:
- InvoiceForm with dynamic line items
- Real-time total calculations
- Invoice preview component
- Status badges and filters
- Use shadcn/ui components
```

## Acceptance Criteria

- [ ] Freelancers can create invoices with line items
- [ ] Automatic calculation of subtotal, tax, and total
- [ ] Support for both fixed and hourly pricing
- [ ] Freelancers can send invoices to clients
- [ ] Email notification sent when invoice is sent
- [ ] Freelancers can mark invoices as paid
- [ ] Status tracking (draft, sent, viewed, paid, overdue)
- [ ] **Demo Ready:** Can create and send an invoice in 30 seconds
- [ ] **Full-Stack Working:** End-to-end functionality
- [ ] **Lambda Compatible:** All handlers work in serverless
- [ ] **Error Handling:** Graceful error handling
- [ ] **Mobile Responsive:** Works on mobile

## Testing Checklist

- [ ] **Manual API Testing:**
  - Create invoice with line items
  - Verify calculations are correct
  - Send invoice and check email
  - Mark invoice as paid
  - Test status transitions
- [ ] **Frontend Testing:**
  - Line items editor works
  - Calculations update in real-time
  - Invoice preview displays correctly
  - Status badges show correct colors
- [ ] **Integration:** End-to-end invoice workflow
- [ ] **Edge Cases:**
  - Cannot edit paid invoices
  - Tax calculation accuracy
  - Date validation (due date after issue date)

## Deployment Checklist

- [ ] **Code Review:** Self-review completed
- [ ] **Serverless Config:** Added function imports
- [ ] **RBAC Config:** Verified permissions
- [ ] **Types:** Exported types for frontend
- [ ] **Testing:** Manual testing completed

## Troubleshooting Guide

### Common Issues

1. **Calculation Errors**
   - Use decimal.js for precise calculations
   - Round to 2 decimal places
   - Validate line item amounts

2. **Status Transitions**
   - Validate allowed status changes
   - Prevent invalid transitions
   - Update timestamps correctly

3. **Email Delivery**
   - Check email service configuration
   - Verify recipient email format
   - Use test mode for development

## Related Modules

- **Depends On:** None (Foundation module)
- **Enables:** M07 (Payment Integration), M08 (Email Reminders)
- **Conflicts With:** None
