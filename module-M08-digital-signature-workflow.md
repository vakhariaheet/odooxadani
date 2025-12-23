# Module M08: Digital Signature Workflow

## Overview

**Estimated Time:** 1.5hr

**Complexity:** Complex

**Type:** Full-stack

**Risk Level:** Medium

**Dependencies:** F04 (Contract Management)

## Problem Context

Building on the basic contract signature system, this module adds advanced digital signature features like multi-party signing, signature reminders, signature templates, audit trails, and integration with external signature services for enhanced legal compliance.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler Files:** Extend signature functionality
  - `handlers/createSignatureRequest.ts` - POST /api/contracts/:id/signature-request
  - `handlers/getSignatureStatus.ts` - GET /api/contracts/:id/signature-status
  - `handlers/sendSignatureReminder.ts` - POST /api/contracts/:id/remind-signature
  - `handlers/getSignatureAuditTrail.ts` - GET /api/contracts/:id/audit-trail
  - `handlers/validateSignature.ts` - POST /api/signatures/:id/validate

- [ ] **Function Configs:** Create serverless function configurations
  - `functions/createSignatureRequest.yml`
  - `functions/getSignatureStatus.yml`
  - `functions/sendSignatureReminder.yml`
  - `functions/getSignatureAuditTrail.yml`
  - `functions/validateSignature.yml`

- [ ] **Service Layer:** Extend ContractService with advanced signature features
  - Multi-party signature workflow management
  - Signature reminder scheduling and sending
  - Enhanced audit trail generation
  - Signature validation and verification
  - Integration with external signature services (optional)

- [ ] **Type Definitions:** Add advanced signature types to `types.ts`
  - SignatureRequest interface
  - SignatureWorkflow interface
  - AuditTrailEntry interface
  - SignatureReminder interface
  - SignatureValidation interface

- [ ] **AWS Service Integration:** Use existing clients plus new features
  - DynamoDB for signature workflow storage
  - SES for signature request and reminder emails
  - SQS for signature reminder scheduling (optional)

- [ ] **Error Handling:** Use `handleAsyncError()` and `commonErrors.*`

**CRITICAL - NO TESTS:** Do NOT create any test files - Focus on working features only

### Frontend Tasks

- [ ] **Components:** Build advanced signature UI
  - `SignatureWorkflow.tsx` - Multi-party signature progress
  - `SignatureRequest.tsx` - Create signature request form
  - `SignatureReminders.tsx` - Reminder management interface
  - `AuditTrail.tsx` - Signature audit trail viewer
  - `SignatureValidation.tsx` - Signature verification display
  - `MultiPartySignature.tsx` - Multiple signer interface
  - `SignatureProgress.tsx` - Visual progress indicator

- [ ] **Enhanced Existing Components:**
  - Update `ContractDetails.tsx` with advanced signature workflow
  - Enhance `SignatureCapture.tsx` with validation
  - Add audit trail to contract viewing

- [ ] **shadcn Components:** stepper, timeline, alert, tooltip, progress, calendar

- [ ] **API Integration:** Connect to advanced signature endpoints
  - Signature workflow management
  - Reminder scheduling and tracking
  - Audit trail visualization

- [ ] **State Management:** Complex workflow state, React Query for server state

- [ ] **Signature Workflow:** Multi-step signature process
  - Signature request creation
  - Signer notification and tracking
  - Progress visualization
  - Completion confirmation

- [ ] **Enhanced Signature Capture:**
  - Improved signature validation
  - Multiple signature types (typed, drawn, uploaded)
  - Signature preview and confirmation
  - Legal disclaimer and terms

- [ ] **Responsive Design:** Signature workflow works on all devices

**CRITICAL - NO TESTS:** Do NOT create any test files - Focus on working features only

### Database Schema Extensions (Single Table)

```
# Signature workflows
pk: CONTRACT#[id] | sk: WORKFLOW | gsi1pk: WORKFLOW#CONTRACT | gsi1sk: [createdAt]

# Signature requests
pk: CONTRACT#[id] | sk: REQUEST#[requestId] | gsi1pk: SIGNER#[signerEmail] | gsi1sk: [createdAt]

# Audit trail entries
pk: CONTRACT#[id] | sk: AUDIT#[timestamp] | gsi1pk: AUDIT#CONTRACT | gsi1sk: [timestamp]

# Signature reminders
pk: CONTRACT#[id] | sk: REMINDER#[reminderId] | gsi1pk: REMINDER#PENDING | gsi1sk: [scheduledAt]

Workflow Fields:
- contractId: string
- signers: SignerInfo[]
- currentStep: number
- totalSteps: number
- status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
- createdAt: string (ISO)
- completedAt?: string (ISO)
- createdBy: string

SignerInfo Interface:
- email: string
- name: string
- role: 'freelancer' | 'client' | 'witness'
- order: number
- status: 'pending' | 'sent' | 'viewed' | 'signed'
- signedAt?: string (ISO)
- signature?: Signature

AuditTrailEntry Fields:
- id: string (UUID)
- contractId: string
- action: 'created' | 'sent' | 'viewed' | 'signed' | 'reminded' | 'cancelled'
- actor: string (user ID or email)
- actorName: string
- timestamp: string (ISO)
- ipAddress: string
- userAgent: string
- details: Record<string, any>

SignatureReminder Fields:
- id: string (UUID)
- contractId: string
- signerEmail: string
- scheduledAt: string (ISO)
- sentAt?: string (ISO)
- type: 'initial' | 'reminder_1' | 'reminder_2' | 'final'
- status: 'pending' | 'sent' | 'cancelled'
```

## External Services

### Email Service (SES)

- **Purpose:** Send signature requests and reminders
- **Setup Steps:**
  1. Use existing SES client from `shared/clients/ses`
  2. Create enhanced email templates for signature workflow
- **Environment Variables:** Already configured
- **Code Pattern:** `await ses.sendEmail({ to, subject, body, template })`

### Optional: External Signature Service

- **Purpose:** Enhanced legal compliance (DocuSign, HelloSign)
- **Setup Time:** 30min
- **Free Tier:** Limited signatures per month
- **Risk:** Medium (fallback to internal system)
- **Implementation:** Create service adapter pattern

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** Read F04 implementation to understand existing contract and signature structure.

### Step 1: Backend Implementation (Lambda-Compatible)

**File Structure:**

```
backend/src/modules/contracts/ (extend existing)
├── handlers/ (extend existing)
│   ├── createSignatureRequest.ts
│   ├── getSignatureStatus.ts
│   ├── sendSignatureReminder.ts
│   ├── getSignatureAuditTrail.ts
│   └── validateSignature.ts
├── functions/ (extend existing)
│   └── [new function configs]
├── services/
│   └── ContractService.ts (extend existing)
│   └── SignatureWorkflowService.ts (new)
└── types.ts (extend existing)
```

**Signature Workflow Handler:**

```typescript
// handlers/createSignatureRequest.ts
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { SignatureWorkflowService } from '../services/SignatureWorkflowService';

const signatureWorkflowService = new SignatureWorkflowService();

const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const contractId = event.pathParameters?.id;
    const body = JSON.parse(event.body || '{}');
    const userId = event.auth.userid;

    const workflow = await signatureWorkflowService.createSignatureRequest(
      contractId!,
      userId,
      body.signers,
      body.message
    );

    return successResponse(workflow, 201);
  } catch (error) {
    return handleAsyncError(error);
  }
};

export const handler = withRbacOwn(baseHandler, 'contracts', 'update');
```

**Signature Workflow Service:**

```typescript
// services/SignatureWorkflowService.ts
export class SignatureWorkflowService {
  async createSignatureRequest(
    contractId: string,
    createdBy: string,
    signers: SignerInfo[],
    message?: string
  ): Promise<SignatureWorkflow> {
    // 1. Create signature workflow
    const workflow: SignatureWorkflow = {
      contractId,
      signers: signers.map((signer, index) => ({
        ...signer,
        order: index + 1,
        status: 'pending',
      })),
      currentStep: 1,
      totalSteps: signers.length,
      status: 'pending',
      createdAt: new Date().toISOString(),
      createdBy,
    };

    // 2. Save workflow to database
    await this.saveWorkflow(workflow);

    // 3. Send initial signature requests
    await this.sendSignatureRequests(workflow, message);

    // 4. Create audit trail entry
    await this.addAuditEntry(contractId, 'created', createdBy, {
      signers: signers.length,
      message,
    });

    return workflow;
  }

  async sendSignatureReminder(contractId: string, signerEmail: string): Promise<void> {
    // 1. Get workflow and signer info
    const workflow = await this.getWorkflow(contractId);
    const signer = workflow.signers.find((s) => s.email === signerEmail);

    if (!signer || signer.status === 'signed') {
      throw new Error('Invalid signer or already signed');
    }

    // 2. Send reminder email
    await this.sendReminderEmail(contractId, signer);

    // 3. Schedule next reminder (if applicable)
    await this.scheduleNextReminder(contractId, signerEmail);

    // 4. Add audit trail entry
    await this.addAuditEntry(contractId, 'reminded', signerEmail, {
      reminderType: 'manual',
    });
  }
}
```

### Step 2: Frontend Implementation

**Signature Workflow Component:**

```typescript
// components/contracts/SignatureWorkflow.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Mail } from 'lucide-react';

interface SignatureWorkflowProps {
  workflow: SignatureWorkflow;
  onSendReminder: (signerEmail: string) => void;
}

export const SignatureWorkflow = ({ workflow, onSendReminder }: SignatureWorkflowProps) => {
  const progress = (workflow.signers.filter(s => s.status === 'signed').length / workflow.totalSteps) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Signature Progress
          <Badge variant={workflow.status === 'completed' ? 'success' : 'secondary'}>
            {workflow.status}
          </Badge>
        </CardTitle>
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-gray-600">
          {workflow.signers.filter(s => s.status === 'signed').length} of {workflow.totalSteps} signatures completed
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {workflow.signers.map((signer, index) => (
            <div key={signer.email} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {signer.status === 'signed' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{signer.name}</p>
                  <p className="text-sm text-gray-600">{signer.email}</p>
                  <p className="text-xs text-gray-500">
                    {signer.role} • Step {signer.order}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant={
                  signer.status === 'signed' ? 'success' :
                  signer.status === 'viewed' ? 'warning' : 'secondary'
                }>
                  {signer.status}
                </Badge>

                {signer.status !== 'signed' && (
                  <Button
                    onClick={() => onSendReminder(signer.email)}
                    size="sm"
                    variant="outline"
                  >
                    <Mail className="w-4 h-4 mr-1" />
                    Remind
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {workflow.status === 'completed' && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ All signatures completed! Contract is now legally binding.
            </p>
            {workflow.completedAt && (
              <p className="text-xs text-green-600 mt-1">
                Completed on {new Date(workflow.completedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

### Step 3: Integration with F04

- [ ] Extend existing contract system with advanced workflow
- [ ] Maintain backward compatibility with simple signatures
- [ ] Add migration path for existing contracts

## Acceptance Criteria

- [ ] Multi-party signature workflow supports multiple signers in sequence
- [ ] Signature reminders can be sent manually and automatically
- [ ] Complete audit trail tracks all signature-related activities
- [ ] Signature validation ensures integrity and authenticity
- [ ] Visual progress indicator shows signature completion status
- [ ] Email notifications keep all parties informed of progress
- [ ] **Demo Ready:** Can demonstrate complete multi-party signing in 60 seconds
- [ ] **Enhanced F04:** Seamlessly extends basic contract signature system
- [ ] **Legal Compliance:** Audit trail meets basic legal requirements
- [ ] **Professional Experience:** Workflow feels polished and trustworthy

## Testing Checklist

- [ ] **Manual API Testing:**
  - Test signature workflow creation
  - Verify reminder sending functionality
  - Test audit trail generation
  - Check signature validation

- [ ] **Frontend Testing:**
  - Test multi-party signature interface
  - Verify progress visualization
  - Test reminder management
  - Check audit trail display

- [ ] **Integration:** Advanced workflow integrates with existing F04 contracts
- [ ] **Email:** Signature request and reminder emails work correctly
- [ ] **Security:** Signature validation and audit trail are secure

## Deployment Checklist

- [ ] **Code Review:** Self-review completed
- [ ] **Serverless Config:** Added new function imports to serverless.yml
- [ ] **Database Migration:** Workflow schema added to existing contracts
- [ ] **Testing:** Manual testing with existing F04 contracts
- [ ] **Email Templates:** Enhanced signature email templates configured

## Troubleshooting Guide

### Common Issues

1. **Signature Workflow Not Progressing**
   - Check signer order and status logic
   - Verify email delivery for signature requests
   - Test with simple two-party workflow first

2. **Reminders Not Sending**
   - Check SES email configuration
   - Verify reminder scheduling logic
   - Test with manual reminder sending

3. **Audit Trail Missing Entries**
   - Check audit entry creation in all handlers
   - Verify DynamoDB write operations
   - Test with simple signature actions

## Related Modules

- **Depends On:** F04 (Contract Management)
- **Enables:** Enhanced legal compliance and professional workflow
- **Integrates With:** M06 (Client Portal) for client signature experience
- **Conflicts With:** None

## Signature Workflow Types

**Supported Workflows:**

1. **Simple Signature** - Single signer (existing F04 functionality)
2. **Sequential Signing** - Multiple signers in specific order
3. **Parallel Signing** - Multiple signers can sign simultaneously
4. **Witness Signing** - Additional witness signatures required

**Reminder Schedule:**

- Initial request: Immediate
- First reminder: 3 days after initial
- Second reminder: 7 days after initial
- Final reminder: 14 days after initial

**Audit Trail Events:**

- Workflow created
- Signature request sent
- Document viewed
- Signature completed
- Reminder sent
- Workflow cancelled
