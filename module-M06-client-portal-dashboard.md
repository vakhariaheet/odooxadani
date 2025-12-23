# Module M06: Client Portal & Dashboard

## Overview

**Estimated Time:** 1hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Low

**Dependencies:** F02 (Landing Page)

## Problem Context

Clients need a professional interface to review proposals, track project status, and manage their interactions with freelancers. This module creates a dedicated client portal that enhances the professional experience and provides clients with visibility into their projects.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler Files:** Create client portal endpoints
  - `handlers/getClientDashboard.ts` - GET /api/client/dashboard (client overview)
  - `handlers/getClientProposals.ts` - GET /api/client/proposals (proposals sent to client)
  - `handlers/getClientContracts.ts` - GET /api/client/contracts (client's contracts)
  - `handlers/getClientInvoices.ts` - GET /api/client/invoices (client's invoices)
  - `handlers/updateClientProfile.ts` - PUT /api/client/profile (client profile)

- [ ] **Function Configs:** Create serverless function configurations
  - `functions/getClientDashboard.yml`
  - `functions/getClientProposals.yml`
  - `functions/getClientContracts.yml`
  - `functions/getClientInvoices.yml`
  - `functions/updateClientProfile.yml`

- [ ] **Service Layer:** Business logic in `services/ClientPortalService.ts`
  - Create ClientPortalService class
  - Dashboard data aggregation
  - Client-specific data filtering
  - Activity timeline generation
  - Notification preferences management

- [ ] **Type Definitions:** Add types to `types.ts`
  - ClientDashboard interface
  - ClientActivity interface
  - ClientProfile interface
  - DashboardStats interface
  - ActivityTimeline interface

- [ ] **RBAC Verification:** Verify `config/permissions.ts` includes client access
  - Client role already configured in ROLE_MODULE_ACCESS
  - Client: read access to own proposals, contracts, invoices
  - Ensure proper ownership middleware usage

- [ ] **AWS Service Integration:** Use existing clients
  - DynamoDB for data aggregation
  - SES for client notifications

- [ ] **Error Handling:** Use `handleAsyncError()` and `commonErrors.*`

**CRITICAL - NO TESTS:** Do NOT create any test files - Focus on working features only

### Frontend Tasks

- [ ] **Components:** Build client portal UI
  - `ClientDashboard.tsx` - Main dashboard with overview cards
  - `ClientProposalList.tsx` - Client view of proposals
  - `ClientContractList.tsx` - Client view of contracts
  - `ClientInvoiceList.tsx` - Client view of invoices
  - `ClientProfile.tsx` - Client profile management
  - `ActivityTimeline.tsx` - Recent activity feed
  - `ClientStats.tsx` - Dashboard statistics cards

- [ ] **Pages:** Create client portal pages
  - `ClientDashboardPage.tsx` - Main client dashboard
  - `ClientProposalsPage.tsx` - Client proposals view
  - `ClientContractsPage.tsx` - Client contracts view
  - `ClientInvoicesPage.tsx` - Client invoices view
  - `ClientProfilePage.tsx` - Client profile settings

- [ ] **shadcn Components:** card, badge, table, tabs, progress, avatar, button

- [ ] **API Integration:** Connect to client portal endpoints
  - Use `useApi` hook for data fetching
  - Client-specific data filtering
  - Real-time updates for new proposals/contracts

- [ ] **State Management:** React Query for server state, local state for UI

- [ ] **Routing:** Add client portal routes
  - `/client/dashboard` - Main dashboard
  - `/client/proposals` - Proposals list
  - `/client/contracts` - Contracts list
  - `/client/invoices` - Invoices list
  - `/client/profile` - Profile settings

- [ ] **Client-Specific Features:**
  - Proposal review and response interface
  - Contract signing workflow
  - Invoice viewing and payment status
  - Communication history with freelancers

- [ ] **Responsive Design:** Mobile-first approach optimized for client use

**CRITICAL - NO TESTS:** Do NOT create any test files - Focus on working features only

### Database Schema Extensions (Single Table)

```
# Client dashboard aggregation
pk: CLIENT#[clientId] | sk: DASHBOARD | gsi1pk: DASHBOARD#CLIENT | gsi1sk: [lastUpdated]

# Client activity timeline
pk: CLIENT#[clientId] | sk: ACTIVITY#[timestamp] | gsi1pk: ACTIVITY#CLIENT | gsi1sk: [timestamp]

# Client profile
pk: CLIENT#[clientId] | sk: PROFILE | gsi1pk: PROFILE#CLIENT | gsi1sk: [updatedAt]

Dashboard Fields:
- totalProposals: number
- pendingProposals: number
- acceptedProposals: number
- activeContracts: number
- completedContracts: number
- outstandingInvoices: number
- totalSpent: number
- lastActivity: string (ISO)

Activity Fields:
- id: string (UUID)
- type: 'proposal_received' | 'contract_signed' | 'invoice_received' | 'payment_made'
- title: string
- description: string
- relatedId: string (proposal/contract/invoice ID)
- timestamp: string (ISO)
- isRead: boolean

Profile Fields:
- companyName?: string
- contactName: string
- email: string
- phone?: string
- address?: Address
- preferences: ClientPreferences
```

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** Read F02 implementation and existing client-facing patterns.

### Step 1: Backend Implementation (Lambda-Compatible)

**File Structure:**

```
backend/src/modules/client-portal/
├── handlers/
│   ├── getClientDashboard.ts
│   ├── getClientProposals.ts
│   ├── getClientContracts.ts
│   ├── getClientInvoices.ts
│   └── updateClientProfile.ts
├── functions/
│   ├── getClientDashboard.yml
│   ├── getClientProposals.yml
│   ├── getClientContracts.yml
│   ├── getClientInvoices.yml
│   └── updateClientProfile.yml
├── services/
│   └── ClientPortalService.ts
└── types.ts
```

**Dashboard Handler Example:**

```typescript
// handlers/getClientDashboard.ts
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { ClientPortalService } from '../services/ClientPortalService';

const clientPortalService = new ClientPortalService();

const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const clientId = event.auth.userid;

    const dashboard = await clientPortalService.getClientDashboard(clientId);
    return successResponse(dashboard);
  } catch (error) {
    return handleAsyncError(error);
  }
};

export const handler = withRbac(baseHandler, 'users', 'read');
```

### Step 2: Frontend Implementation

**Client Dashboard Component:**

```typescript
// components/client-portal/ClientDashboard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApi } from '@/hooks';

export const ClientDashboard = () => {
  const { data: dashboard, loading } = useApi('/client/dashboard');

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Active Proposals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.pendingProposals || 0}</div>
            <p className="text-sm text-gray-600">Awaiting your review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.activeContracts || 0}</div>
            <p className="text-sm text-gray-600">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outstanding Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.outstandingInvoices || 0}</div>
            <p className="text-sm text-gray-600">Pending payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboard?.totalSpent || 0}</div>
            <p className="text-sm text-gray-600">This year</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityTimeline activities={dashboard?.recentActivity || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline">
              Review Pending Proposals
            </Button>
            <Button className="w-full" variant="outline">
              View Outstanding Invoices
            </Button>
            <Button className="w-full" variant="outline">
              Update Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
```

### Step 3: Integration

- [ ] Test client dashboard data aggregation
- [ ] Verify client-specific data filtering
- [ ] Connect to existing proposal/contract/invoice modules
- [ ] Test responsive design for client use

## Acceptance Criteria

- [ ] Clients have a dedicated dashboard showing their project overview
- [ ] Client can view all proposals sent to them with clear status
- [ ] Client can access their contracts and signing workflow
- [ ] Client can view invoices and payment status
- [ ] Activity timeline shows recent interactions with freelancers
- [ ] Client profile management works correctly
- [ ] **Demo Ready:** Can show complete client portal in 30 seconds
- [ ] **Professional Experience:** Portal looks polished and trustworthy
- [ ] **Mobile Responsive:** Works perfectly on mobile devices
- [ ] **Integration Working:** Connects seamlessly with F01, F04, M09

## Testing Checklist

- [ ] **Manual API Testing:**
  - Test client dashboard data aggregation
  - Verify client-only data access (no other client's data)
  - Test profile updates
  - Check activity timeline generation

- [ ] **Frontend Testing:**
  - Test dashboard rendering with various data states
  - Verify responsive design on mobile
  - Test navigation between portal sections
  - Check loading states and error handling

- [ ] **Integration:** Client portal integrates with existing modules
- [ ] **Security:** Clients can only access their own data
- [ ] **Performance:** Dashboard loads in <2s

## Deployment Checklist

- [ ] **Code Review:** Self-review completed
- [ ] **Serverless Config:** Added function imports to serverless.yml
- [ ] **RBAC Config:** Verified client permissions work correctly
- [ ] **Types:** Exported types for frontend use
- [ ] **Testing:** Manual testing with client role
- [ ] **Integration:** Tested with existing F01, F04, M09 data

## Troubleshooting Guide

### Common Issues

1. **Client Seeing Other Clients' Data**
   - Check ownership middleware implementation
   - Verify DynamoDB queries filter by clientId
   - Test with multiple client accounts

2. **Dashboard Data Not Aggregating**
   - Check data aggregation logic in service
   - Verify GSI queries for client data
   - Test with various data scenarios

3. **Mobile Responsiveness Issues**
   - Test dashboard cards on small screens
   - Verify table responsiveness
   - Check touch interactions

## Related Modules

- **Depends On:** F02 (Landing Page)
- **Integrates With:** F01 (Proposals), F04 (Contracts), M09 (Invoices)
- **Enables:** Better client experience and engagement
- **Conflicts With:** None

## Client Experience Features

**Dashboard Highlights:**

- Clean, professional interface
- Clear status indicators
- Quick action buttons
- Recent activity feed
- Mobile-optimized design

**Client Journey:**

1. Land on professional portal
2. See overview of all projects
3. Review pending proposals
4. Sign contracts digitally
5. Track project progress
6. View and pay invoices
