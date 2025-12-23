# Module F04: Contract Management

## Overview

**Estimated Time:** 1hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Low

**Dependencies:** None

## Problem Context

Once proposals are accepted, freelancers need a way to convert them into legally binding contracts with digital signature capabilities. This module handles contract creation, signature workflow, and contract status tracking without external signature service dependencies initially.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler Files:** Create contract CRUD handlers
  - `handlers/listContracts.ts` - GET /api/contracts (role-based access)
  - `handlers/getContract.ts` - GET /api/contracts/:id (freelancer/client access)
  - `handlers/createContract.ts` - POST /api/contracts (freelancer only)
  - `handlers/updateContract.ts` - PUT /api/contracts/:id (signature updates)
  - `handlers/signContract.ts` - POST /api/contracts/:id/sign (client signature)

- [ ] **Function Configs:** Create serverless function configurations
  - `functions/listContracts.yml` - List contracts endpoint
  - `functions/getContract.yml` - Get single contract endpoint
  - `functions/createContract.yml` - Create contract endpoint
  - `functions/updateContract.yml` - Update contract endpoint
  - `functions/signContract.yml` - Sign contract endpoint

- [ ] **Service Layer:** Business logic in `services/ContractService.ts`
  - Create ContractService class with CRUD methods
  - Contract status management (draft, sent, signed, completed)
  - Simple signature capture (name + timestamp initially)
  - Contract generation from proposal data
  - Notification system for signature requests

- [ ] **Type Definitions:** Add types to `types.ts`
  - Contract interface with all fields
  - ContractStatus enum
  - Signature interface (name, timestamp, IP address)
  - CreateContractRequest/Response types
  - SignContractRequest/Response types

- [ ] **RBAC Verification:** Verify `config/permissions.ts` includes contracts module
  - Module already configured in ROLE_MODULE_ACCESS
  - Freelancer: create contracts, read/update own contracts
  - Client: read contracts sent to them, update for signatures
  - Admin: full access to all contracts

- [ ] **AWS Service Integration:** Use existing clients
  - DynamoDB client from `shared/clients/dynamodb`
  - SES client for signature request emails
  - Follow single-table design patterns

- [ ] **Error Handling:** Use `handleAsyncError()` and `commonErrors.*`

**CRITICAL - NO TESTS:** Do NOT create any test files - Focus on working features only

### Frontend Tasks

- [ ] **Components:** Build contract management UI
  - `ContractList.tsx` - List view with status indicators
  - `ContractDetails.tsx` - Contract viewing with signature section
  - `ContractForm.tsx` - Create contract from proposal
  - `SignatureCapture.tsx` - Simple signature input (name + checkbox)
  - `ContractStatusBadge.tsx` - Status indicator component
  - `ContractPreview.tsx` - PDF-like contract preview

- [ ] **Pages:** Create contract pages
  - `ContractListPage.tsx` - Contracts dashboard
  - `ContractViewPage.tsx` - View contract details
  - `ContractSignPage.tsx` - Client signature page
  - `ContractCreatePage.tsx` - Create from proposal

- [ ] **shadcn Components:** button, form, table, dialog, badge, card, checkbox, input

- [ ] **API Integration:** Connect to contract endpoints
  - Use `useApi` hook for CRUD operations
  - Handle signature submission
  - Real-time status updates

- [ ] **State Management:** Local state for signature form, React Query for server state

- [ ] **Routing:** Add contract routes to React Router
  - `/contracts` - List page
  - `/contracts/:id` - View contract
  - `/contracts/:id/sign` - Sign contract (client access)
  - `/contracts/create/:proposalId` - Create from proposal

- [ ] **Signature Interface:** Simple signature capture
  - Text input for full name
  - Checkbox for agreement confirmation
  - Timestamp and IP capture on backend
  - Visual signature representation (typed name in script font)

- [ ] **Responsive Design:** Mobile-first approach with Tailwind CSS

**CRITICAL - NO TESTS:** Do NOT create any test files - Focus on working features only

### Database Schema (Single Table)

```
pk: CONTRACT#[id] | sk: METADATA | gsi1pk: FREELANCER#[freelancerId] | gsi1sk: CONTRACT#[createdAt]
pk: CONTRACT#[id] | sk: CLIENT#[clientId] | gsi1pk: CLIENT#[clientId] | gsi1sk: CONTRACT#[createdAt]
pk: CONTRACT#[id] | sk: SIGNATURE#[signerId] | gsi1pk: CONTRACT#[id] | gsi1sk: SIGNATURE#[signedAt]

Fields:
- id: string (UUID)
- proposalId?: string (if created from proposal)
- title: string
- content: string (contract terms)
- freelancerId: string
- clientId: string
- clientEmail: string
- status: 'draft' | 'sent' | 'signed' | 'completed' | 'cancelled'
- amount: number
- currency: string
- deliverables: string[]
- timeline: string
- terms: string
- signatures: Signature[]
- createdAt: string (ISO)
- updatedAt: string (ISO)
- sentAt?: string (ISO)
- signedAt?: string (ISO)
```

```typescript
interface Signature {
  signerId: string;
  signerName: string;
  signerEmail: string;
  signedAt: string;
  ipAddress: string;
  userAgent: string;
  signatureType: 'typed' | 'drawn'; // Start with 'typed'
}
```

## External Services

### Email Service (SES)

- **Purpose:** Send contract signature requests to clients
- **Setup Steps:**
  1. Use existing SES client from `shared/clients/ses`
  2. Configure email templates for signature requests
- **Environment Variables:** Already configured in existing setup
- **Code Pattern:** `await ses.sendEmail({ to, subject, body })`

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
backend/src/modules/contracts/
├── handlers/
│   ├── listContracts.ts         # GET /api/contracts
│   ├── getContract.ts          # GET /api/contracts/:id
│   ├── createContract.ts       # POST /api/contracts
│   ├── updateContract.ts       # PUT /api/contracts/:id
│   └── signContract.ts         # POST /api/contracts/:id/sign
├── functions/
│   ├── listContracts.yml
│   ├── getContract.yml
│   ├── createContract.yml
│   ├── updateContract.yml
│   └── signContract.yml
├── services/
│   └── ContractService.ts      # Business logic
└── types.ts                    # Domain-specific types
```

**Handler Pattern:**

```typescript
// handlers/signContract.ts
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { ContractService } from '../services/ContractService';

const contractService = new ContractService();

const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const contractId = event.pathParameters?.id;
    const body = JSON.parse(event.body || '{}');
    const userId = event.auth.userid;
    const userEmail = event.auth.email;

    // Extract IP address for signature audit
    const ipAddress = event.requestContext.http.sourceIp;
    const userAgent = event.headers['user-agent'] || '';

    const signature = await contractService.signContract(
      contractId!,
      userId,
      userEmail,
      body.signerName,
      ipAddress,
      userAgent
    );

    return successResponse(signature);
  } catch (error) {
    return handleAsyncError(error);
  }
};

export const handler = withRbac(baseHandler, 'contracts', 'update');
```

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── components/contracts/
│   ├── ContractList.tsx
│   ├── ContractDetails.tsx
│   ├── ContractForm.tsx
│   ├── SignatureCapture.tsx
│   ├── ContractStatusBadge.tsx
│   └── ContractPreview.tsx
├── pages/contracts/
│   ├── ContractListPage.tsx
│   ├── ContractViewPage.tsx
│   ├── ContractSignPage.tsx
│   └── ContractCreatePage.tsx
├── hooks/
│   └── useContracts.ts
├── services/
│   └── contractsApi.ts
└── types/
    └── contract.ts
```

**Signature Capture Component:**

```typescript
// components/contracts/SignatureCapture.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SignatureCaptureProps {
  onSign: (signerName: string) => void;
  loading?: boolean;
}

export const SignatureCapture = ({ onSign, loading }: SignatureCaptureProps) => {
  const [signerName, setSignerName] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSign = () => {
    if (signerName.trim() && agreed) {
      onSign(signerName.trim());
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Digital Signature</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Full Legal Name</label>
          <Input
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            placeholder="Enter your full name"
            className="mt-1"
          />
        </div>

        {signerName && (
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Your signature:</p>
            <p className="text-2xl font-script text-blue-600">{signerName}</p>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="agreement"
            checked={agreed}
            onCheckedChange={setAgreed}
          />
          <label htmlFor="agreement" className="text-sm">
            I agree to the terms and conditions of this contract
          </label>
        </div>

        <Button
          onClick={handleSign}
          disabled={!signerName.trim() || !agreed || loading}
          className="w-full"
        >
          {loading ? 'Signing...' : 'Sign Contract'}
        </Button>
      </CardContent>
    </Card>
  );
};
```

### Step 3: Integration

- [ ] Test API endpoints with Postman/curl
- [ ] Connect frontend to backend
- [ ] Verify signature capture and storage
- [ ] Test contract status updates

## Acceptance Criteria

- [ ] Freelancers can create contracts from proposals or from scratch
- [ ] Clients can view contracts sent to them and provide digital signatures
- [ ] Simple signature capture works (typed name + agreement checkbox)
- [ ] Contract status updates correctly (draft → sent → signed)
- [ ] Email notifications sent for signature requests
- [ ] Signature audit trail captured (IP, timestamp, user agent)
- [ ] **Demo Ready:** Can create and sign a contract in 45 seconds
- [ ] **Full-Stack Working:** Frontend connects to backend, data persists in DynamoDB
- [ ] **Lambda Compatible:** All handlers work in serverless environment
- [ ] **Error Handling:** Graceful failure modes for all operations
- [ ] **Mobile Responsive:** Signature capture works on mobile devices

## Testing Checklist

- [ ] **Manual API Testing:**
  - Test CRUD operations with curl/Postman
  - Verify RBAC permissions (freelancer vs client access)
  - Test signature capture and storage
  - Check error handling (401, 403, 404, 500)

- [ ] **Frontend Testing:**
  - Manual testing in browser
  - Test signature capture on desktop and mobile
  - Test contract viewing and status updates
  - Verify responsive design

- [ ] **Integration:** End-to-end contract creation and signing flow
- [ ] **Edge Cases:** Invalid signatures, missing data, unauthorized access
- [ ] **Performance:** Contract loading and signing in <3s

## Deployment Checklist

- [ ] **Code Review:** Self-review completed
- [ ] **Serverless Config:** Added function imports to serverless.yml
- [ ] **RBAC Config:** Verified permissions.ts includes contracts module
- [ ] **Types:** Exported types for frontend use
- [ ] **Testing:** Manual testing completed
- [ ] **Email Templates:** Signature request email configured

## Troubleshooting Guide

### Common Issues

1. **Signature Not Saving**
   - Check DynamoDB item structure for signatures
   - Verify signature data validation
   - Test with simple signature data first

2. **Email Notifications Not Sending**
   - Check SES client configuration
   - Verify email template formatting
   - Test with simple text emails first

3. **Contract Status Not Updating**
   - Check status transition logic
   - Verify DynamoDB update operations
   - Test status changes manually

## Related Modules

- **Depends On:** None (Foundation module)
- **Enables:** M08 (Digital Signature Workflow), M09 (Invoice Generation)
- **Integrates With:** F01 (Proposal Management) - contracts created from proposals
- **Conflicts With:** None

## Future Enhancements (Post-Hackathon)

1. **Advanced Signature Options:**
   - Canvas-based signature drawing
   - Upload signature image
   - Biometric signature verification

2. **External Signature Services:**
   - DocuSign integration
   - HelloSign/Dropbox Sign integration
   - Adobe Sign integration

3. **Contract Templates:**
   - Legal contract templates
   - Industry-specific templates
   - Custom clause library

4. **Advanced Features:**
   - Multi-party signatures
   - Signature reminders
   - Contract expiration dates
   - Version control for contract changes
