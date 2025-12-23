# Module M09: Invoice Generation System

## Overview

**Estimated Time:** 1hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Low

**Dependencies:** F01 (Proposal Management), F04 (Contract Management)

## Problem Context

Once contracts are signed, freelancers need to generate professional invoices automatically. This module creates invoices from signed contracts, manages invoice status, and provides invoice templates with automated numbering and tax calculations.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler Files:** Create invoice CRUD handlers
  - `handlers/listInvoices.ts` - GET /api/invoices (role-based access)
  - `handlers/getInvoice.ts` - GET /api/invoices/:id (freelancer/client access)
  - `handlers/createInvoice.ts` - POST /api/invoices (freelancer only)
  - `handlers/updateInvoice.ts` - PUT /api/invoices/:id (status updates)
  - `handlers/generateFromContract.ts` - POST /api/contracts/:id/generate-invoice

- [ ] **Function Configs:** Create serverless function configurations
  - `functions/listInvoices.yml`
  - `functions/getInvoice.yml`
  - `functions/createInvoice.yml`
  - `functions/updateInvoice.yml`
  - `functions/generateFromContract.yml`

- [ ] **Service Layer:** Business logic in `services/InvoiceService.ts`
  - Create InvoiceService class with CRUD methods
  - Automatic invoice generation from contracts
  - Invoice numbering system (INV-YYYY-NNNN)
  - Tax calculation logic
  - Payment status tracking
  - PDF generation (simple HTML to PDF initially)

- [ ] **Type Definitions:** Add types to `types.ts`
  - Invoice interface with all fields
  - InvoiceStatus enum
  - InvoiceLineItem interface
  - TaxCalculation interface
  - CreateInvoiceRequest/Response types

- [ ] **RBAC Verification:** Verify `config/permissions.ts` includes invoices module
  - Module already configured in ROLE_MODULE_ACCESS
  - Freelancer: create/read/update own invoices
  - Client: read invoices sent to them
  - Admin: full access to all invoices

- [ ] **AWS Service Integration:** Use existing clients
  - DynamoDB for invoice storage
  - SES for invoice delivery emails
  - S3 for PDF storage (optional)

- [ ] **Error Handling:** Use `handleAsyncError()` and `commonErrors.*`

**CRITICAL - NO TESTS:** Do NOT create any test files - Focus on working features only

### Frontend Tasks

- [ ] **Components:** Build invoice management UI
  - `InvoiceList.tsx` - List view with status and payment tracking
  - `InvoiceDetails.tsx` - Invoice viewing with PDF preview
  - `InvoiceForm.tsx` - Create/edit invoice form
  - `InvoicePreview.tsx` - PDF-style invoice preview
  - `InvoiceStatusBadge.tsx` - Status indicator component
  - `InvoiceLineItems.tsx` - Line item editor component

- [ ] **Pages:** Create invoice pages
  - `InvoiceListPage.tsx` - Invoices dashboard
  - `InvoiceViewPage.tsx` - View invoice details
  - `InvoiceCreatePage.tsx` - Create new invoice
  - `InvoiceEditPage.tsx` - Edit existing invoice

- [ ] **shadcn Components:** button, form, table, dialog, badge, card, input, select

- [ ] **API Integration:** Connect to invoice endpoints
  - Use `useApi` hook for CRUD operations
  - Handle invoice generation from contracts
  - Real-time status updates

- [ ] **State Management:** Local state for form data, React Query for server state

- [ ] **Routing:** Add invoice routes to React Router
  - `/invoices` - List page
  - `/invoices/:id` - View invoice
  - `/invoices/new` - Create invoice
  - `/invoices/:id/edit` - Edit invoice

- [ ] **Invoice Template:** Professional invoice layout
  - Company branding area
  - Client billing information
  - Line items with descriptions, quantities, rates
  - Tax calculations and totals
  - Payment terms and instructions

- [ ] **Responsive Design:** Mobile-first approach with Tailwind CSS

**CRITICAL - NO TESTS:** Do NOT create any test files - Focus on working features only

### Database Schema (Single Table)

```
pk: INVOICE#[id] | sk: METADATA | gsi1pk: FREELANCER#[freelancerId] | gsi1sk: INVOICE#[createdAt]
pk: INVOICE#[id] | sk: CLIENT#[clientId] | gsi1pk: CLIENT#[clientId] | gsi1sk: INVOICE#[createdAt]
pk: INVOICE#[id] | sk: CONTRACT#[contractId] | gsi1pk: CONTRACT#[contractId] | gsi1sk: INVOICE#[createdAt]

Fields:
- id: string (UUID)
- invoiceNumber: string (INV-YYYY-NNNN)
- contractId?: string (if generated from contract)
- proposalId?: string (reference to original proposal)
- freelancerId: string
- clientId: string
- clientEmail: string
- status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'
- lineItems: InvoiceLineItem[]
- subtotal: number
- taxRate: number
- taxAmount: number
- total: number
- currency: string
- dueDate: string (ISO)
- paymentTerms: string
- notes?: string
- createdAt: string (ISO)
- updatedAt: string (ISO)
- sentAt?: string (ISO)
- paidAt?: string (ISO)
```

```typescript
interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number; // quantity * rate
}
```

## External Services

### Email Service (SES)

- **Purpose:** Send invoices to clients
- **Setup Steps:**
  1. Use existing SES client from `shared/clients/ses`
  2. Configure email templates for invoice delivery
- **Environment Variables:** Already configured
- **Code Pattern:** `await ses.sendEmail({ to, subject, body, attachments })`

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** Read F01 and F04 implementations to understand proposal and contract data structures.

### Step 1: Backend Implementation (Lambda-Compatible)

**File Structure:**

```
backend/src/modules/invoices/
├── handlers/
│   ├── listInvoices.ts
│   ├── getInvoice.ts
│   ├── createInvoice.ts
│   ├── updateInvoice.ts
│   └── generateFromContract.ts
├── functions/
│   ├── listInvoices.yml
│   ├── getInvoice.yml
│   ├── createInvoice.yml
│   ├── updateInvoice.yml
│   └── generateFromContract.yml
├── services/
│   └── InvoiceService.ts
└── types.ts
```

**Invoice Generation Handler:**

```typescript
// handlers/generateFromContract.ts
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { InvoiceService } from '../services/InvoiceService';

const invoiceService = new InvoiceService();

const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const contractId = event.pathParameters?.id;
    const userId = event.auth.userid;

    const invoice = await invoiceService.generateFromContract(contractId!, userId);
    return successResponse(invoice, 201);
  } catch (error) {
    return handleAsyncError(error);
  }
};

export const handler = withRbacOwn(baseHandler, 'contracts', 'read');
```

**Invoice Service Methods:**

```typescript
// services/InvoiceService.ts
export class InvoiceService {
  async generateFromContract(contractId: string, freelancerId: string): Promise<Invoice> {
    // 1. Fetch contract details
    const contract = await this.getContract(contractId, freelancerId);

    // 2. Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber();

    // 3. Create line items from contract
    const lineItems = this.createLineItemsFromContract(contract);

    // 4. Calculate totals
    const { subtotal, taxAmount, total } = this.calculateTotals(lineItems);

    // 5. Create invoice
    const invoice: Invoice = {
      id: generateUUID(),
      invoiceNumber,
      contractId,
      proposalId: contract.proposalId,
      freelancerId,
      clientId: contract.clientId,
      clientEmail: contract.clientEmail,
      status: 'draft',
      lineItems,
      subtotal,
      taxRate: 0.1, // 10% default tax
      taxAmount,
      total,
      currency: contract.currency,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      paymentTerms: 'Net 30',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 6. Save to database
    await this.saveInvoice(invoice);

    return invoice;
  }

  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.getInvoiceCountForYear(year);
    return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  }
}
```

### Step 2: Frontend Implementation

**Invoice Preview Component:**

```typescript
// components/invoices/InvoicePreview.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Invoice } from '@/types/invoice';

interface InvoicePreviewProps {
  invoice: Invoice;
}

export const InvoicePreview = ({ invoice }: InvoicePreviewProps) => {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="border-b">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">INVOICE</h1>
            <p className="text-lg text-gray-600">{invoice.invoiceNumber}</p>
          </div>
          <Badge variant={invoice.status === 'paid' ? 'success' : 'secondary'}>
            {invoice.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-2">From:</h3>
            <p>Freelancer Name</p>
            <p>freelancer@email.com</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">To:</h3>
            <p>{invoice.clientEmail}</p>
            <p>Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Description</th>
                <th className="text-right py-2">Qty</th>
                <th className="text-right py-2">Rate</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2">{item.description}</td>
                  <td className="text-right py-2">{item.quantity}</td>
                  <td className="text-right py-2">${item.rate}</td>
                  <td className="text-right py-2">${item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-1">
              <span>Subtotal:</span>
              <span>${invoice.subtotal}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Tax ({invoice.taxRate * 100}%):</span>
              <span>${invoice.taxAmount}</span>
            </div>
            <div className="flex justify-between py-2 border-t font-bold text-lg">
              <span>Total:</span>
              <span>${invoice.total}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-8 p-4 bg-gray-50 rounded">
            <h4 className="font-semibold mb-2">Notes:</h4>
            <p>{invoice.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

### Step 3: Integration

- [ ] Test invoice generation from contracts
- [ ] Verify invoice numbering system
- [ ] Test email delivery functionality
- [ ] Integrate with payment tracking (M10)

## Acceptance Criteria

- [ ] Invoices can be generated automatically from signed contracts
- [ ] Invoice numbering system works (INV-YYYY-NNNN format)
- [ ] Professional invoice layout with all required information
- [ ] Tax calculations work correctly
- [ ] Invoice status tracking (draft, sent, viewed, paid, overdue)
- [ ] Email delivery of invoices to clients
- [ ] Line item management with quantities and rates
- [ ] **Demo Ready:** Can generate and view an invoice in 30 seconds
- [ ] **Integration Working:** Seamlessly connects to F01 and F04
- [ ] **Professional Output:** Invoice looks professional and complete
- [ ] **Mobile Responsive:** Invoice viewing works on mobile devices

## Testing Checklist

- [ ] **Manual API Testing:**
  - Test invoice CRUD operations
  - Verify invoice generation from contracts
  - Test invoice numbering sequence
  - Check tax calculations

- [ ] **Frontend Testing:**
  - Test invoice preview rendering
  - Verify line item calculations
  - Test responsive design on mobile
  - Check invoice status updates

- [ ] **Integration:** Invoice generation from contracts works end-to-end
- [ ] **Calculations:** All tax and total calculations are accurate
- [ ] **Email:** Invoice delivery emails work correctly

## Deployment Checklist

- [ ] **Code Review:** Self-review completed
- [ ] **Serverless Config:** Added function imports to serverless.yml
- [ ] **RBAC Config:** Verified permissions.ts includes invoices module
- [ ] **Types:** Exported types for frontend use
- [ ] **Testing:** Manual testing with contracts from F04
- [ ] **Email Templates:** Invoice delivery email configured

## Troubleshooting Guide

### Common Issues

1. **Invoice Numbers Not Sequential**
   - Check invoice counting logic
   - Verify DynamoDB queries for year-based counting
   - Test with multiple invoices

2. **Tax Calculations Incorrect**
   - Verify tax rate application
   - Check rounding logic
   - Test with various amounts

3. **PDF Generation Issues**
   - Start with HTML preview only
   - Add PDF generation as enhancement
   - Test with different invoice sizes

## Related Modules

- **Depends On:** F01 (Proposal Management), F04 (Contract Management)
- **Enables:** M10 (Payment Tracking & Reminders)
- **Integrates With:** M11 (Analytics Dashboard) for invoice metrics
- **Conflicts With:** None

## Invoice Template Customization

**Default Template Sections:**

1. Header with invoice number and status
2. Freelancer and client information
3. Invoice date and due date
4. Line items table
5. Tax calculations and totals
6. Payment terms and instructions
7. Notes section (optional)

**Future Enhancements:**

- Custom branding and logos
- Multiple tax rates
- Discount calculations
- Recurring invoice templates
- Multi-currency support
