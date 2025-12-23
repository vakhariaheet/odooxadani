# Module M05: Enhanced Proposal Features

## Overview

**Estimated Time:** 1hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Low

**Dependencies:** F01 (Proposal Management)

## Problem Context

Building on the basic proposal system, this module adds advanced features like proposal analytics, client interaction tracking, proposal versioning, and enhanced collaboration tools to make proposals more effective and trackable.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler Files:** Extend proposal functionality
  - `handlers/getProposalAnalytics.ts` - GET /api/proposals/:id/analytics
  - `handlers/duplicateProposal.ts` - POST /api/proposals/:id/duplicate
  - `handlers/getProposalVersions.ts` - GET /api/proposals/:id/versions
  - `handlers/addProposalComment.ts` - POST /api/proposals/:id/comments
  - `handlers/trackProposalView.ts` - POST /api/proposals/:id/track-view

- [ ] **Function Configs:** Create serverless function configurations
  - `functions/getProposalAnalytics.yml`
  - `functions/duplicateProposal.yml`
  - `functions/getProposalVersions.yml`
  - `functions/addProposalComment.yml`
  - `functions/trackProposalView.yml`

- [ ] **Service Layer:** Extend ProposalService with analytics
  - Add analytics tracking methods
  - Proposal duplication logic
  - Version history management
  - Comment system implementation
  - View tracking and engagement metrics

- [ ] **Type Definitions:** Add enhanced types to `types.ts`
  - ProposalAnalytics interface
  - ProposalVersion interface
  - ProposalComment interface
  - ViewTrackingEvent interface
  - EngagementMetrics interface

- [ ] **AWS Service Integration:** Use existing clients
  - DynamoDB for analytics data storage
  - CloudWatch for metrics (optional)
  - SES for comment notifications

- [ ] **Error Handling:** Use `handleAsyncError()` and `commonErrors.*`

**CRITICAL - NO TESTS:** Do NOT create any test files - Focus on working features only

### Frontend Tasks

- [ ] **Components:** Build enhanced proposal UI
  - `ProposalAnalytics.tsx` - Analytics dashboard for proposals
  - `ProposalVersionHistory.tsx` - Version comparison and history
  - `ProposalComments.tsx` - Comment thread component
  - `ProposalEngagement.tsx` - Client engagement metrics
  - `ProposalDuplicator.tsx` - Duplicate proposal modal
  - `ProposalViewTracker.tsx` - View tracking component

- [ ] **Enhanced Existing Components:**
  - Update `ProposalDetails.tsx` to include analytics tab
  - Add version history to `ProposalForm.tsx`
  - Include engagement metrics in `ProposalList.tsx`

- [ ] **shadcn Components:** tabs, progress, chart components, tooltip, popover

- [ ] **API Integration:** Connect to enhanced proposal endpoints
  - Analytics data fetching
  - Real-time view tracking
  - Comment system integration

- [ ] **State Management:** Enhanced React Query for analytics data

- [ ] **Charts and Visualizations:**
  - View timeline chart
  - Engagement heatmap
  - Response time metrics
  - Success rate indicators

- [ ] **Responsive Design:** Analytics dashboard mobile-friendly

**CRITICAL - NO TESTS:** Do NOT create any test files - Focus on working features only

### Database Schema Extensions (Single Table)

```
# Analytics tracking
pk: PROPOSAL#[id] | sk: ANALYTICS | gsi1pk: ANALYTICS#PROPOSAL | gsi1sk: [timestamp]

# View tracking events
pk: PROPOSAL#[id] | sk: VIEW#[timestamp] | gsi1pk: CLIENT#[clientId] | gsi1sk: VIEW#[timestamp]

# Comments
pk: PROPOSAL#[id] | sk: COMMENT#[commentId] | gsi1pk: COMMENT#[userId] | gsi1sk: [timestamp]

# Version history
pk: PROPOSAL#[id] | sk: VERSION#[versionNumber] | gsi1pk: VERSION#PROPOSAL | gsi1sk: [timestamp]

Analytics Fields:
- totalViews: number
- uniqueViews: number
- timeSpentViewing: number (seconds)
- lastViewedAt: string (ISO)
- viewsBySection: Record<string, number>
- engagementScore: number (0-100)
- responseTime?: number (hours from send to response)

Comment Fields:
- id: string (UUID)
- proposalId: string
- userId: string
- userRole: 'freelancer' | 'client'
- content: string
- createdAt: string (ISO)
- isInternal: boolean (freelancer-only notes)

Version Fields:
- versionNumber: number
- changes: string[] (summary of changes)
- createdBy: string
- createdAt: string (ISO)
- previousVersion?: number
```

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** Read existing F01 module implementation to understand current proposal structure.

### Step 1: Backend Implementation (Lambda-Compatible)

**File Structure:**

```
backend/src/modules/proposals/
├── handlers/ (extend existing)
│   ├── getProposalAnalytics.ts
│   ├── duplicateProposal.ts
│   ├── getProposalVersions.ts
│   ├── addProposalComment.ts
│   └── trackProposalView.ts
├── functions/ (extend existing)
│   └── [new function configs]
├── services/
│   └── ProposalService.ts (extend existing)
└── types.ts (extend existing)
```

**Analytics Handler Example:**

```typescript
// handlers/getProposalAnalytics.ts
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';
import { withRbacOwn } from '../../../shared/auth/rbacMiddleware';
import { successResponse, handleAsyncError } from '../../../shared/response';
import { ProposalService } from '../services/ProposalService';

const proposalService = new ProposalService();

const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const proposalId = event.pathParameters?.id;
    const userId = event.auth.userid;

    const analytics = await proposalService.getProposalAnalytics(proposalId!, userId);
    return successResponse(analytics);
  } catch (error) {
    return handleAsyncError(error);
  }
};

export const handler = withRbacOwn(baseHandler, 'proposals', 'read');
```

### Step 2: Frontend Implementation

**Analytics Dashboard Component:**

```typescript
// components/proposals/ProposalAnalytics.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useApi } from '@/hooks';

interface ProposalAnalyticsProps {
  proposalId: string;
}

export const ProposalAnalytics = ({ proposalId }: ProposalAnalyticsProps) => {
  const { data: analytics, loading } = useApi(`/proposals/${proposalId}/analytics`);

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Views</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics?.totalViews || 0}</div>
          <p className="text-sm text-gray-600">
            {analytics?.uniqueViews || 0} unique viewers
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics?.engagementScore || 0}%</div>
          <Progress value={analytics?.engagementScore || 0} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Time Spent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round((analytics?.timeSpentViewing || 0) / 60)}m
          </div>
          <p className="text-sm text-gray-600">Average viewing time</p>
        </CardContent>
      </Card>
    </div>
  );
};
```

### Step 3: Integration with F01

- [ ] Extend existing ProposalDetails component with analytics tab
- [ ] Add analytics summary to ProposalList cards
- [ ] Integrate view tracking into proposal viewing

## Acceptance Criteria

- [ ] Proposal analytics show view counts, engagement metrics, and time spent
- [ ] Freelancers can duplicate existing proposals for reuse
- [ ] Version history tracks changes to proposals over time
- [ ] Comment system allows communication between freelancer and client
- [ ] View tracking captures client engagement automatically
- [ ] Analytics dashboard provides actionable insights
- [ ] **Demo Ready:** Can show proposal analytics in 30 seconds
- [ ] **Integration Working:** Seamlessly extends F01 functionality
- [ ] **Performance:** Analytics load in <2s
- [ ] **Mobile Responsive:** Analytics work on mobile devices

## Testing Checklist

- [ ] **Manual API Testing:**
  - Test analytics endpoint with various proposals
  - Verify view tracking captures events correctly
  - Test comment creation and retrieval
  - Check proposal duplication functionality

- [ ] **Frontend Testing:**
  - Test analytics dashboard rendering
  - Verify charts and metrics display correctly
  - Test comment interface functionality
  - Check responsive design on mobile

- [ ] **Integration:** Analytics integrate smoothly with existing proposal views
- [ ] **Performance:** Large datasets load efficiently
- [ ] **Real-time:** View tracking updates in near real-time

## Deployment Checklist

- [ ] **Code Review:** Self-review completed
- [ ] **Serverless Config:** Added new function imports to serverless.yml
- [ ] **Database Migration:** Analytics schema added to existing proposals
- [ ] **Testing:** Manual testing with existing F01 proposals
- [ ] **Performance:** Verified analytics queries are efficient

## Troubleshooting Guide

### Common Issues

1. **Analytics Not Updating**
   - Check view tracking event capture
   - Verify DynamoDB write operations
   - Test with simple analytics first

2. **Performance Issues with Large Datasets**
   - Implement pagination for analytics
   - Use DynamoDB query optimization
   - Cache frequently accessed analytics

3. **Chart Rendering Issues**
   - Start with simple text metrics
   - Add charts incrementally
   - Test on different screen sizes

## Related Modules

- **Depends On:** F01 (Proposal Management)
- **Enables:** M11 (Analytics Dashboard)
- **Integrates With:** M06 (Client Portal) for client-side analytics
- **Conflicts With:** None

## Analytics Metrics Definitions

**Engagement Score Calculation:**

- Views: 20 points
- Time spent (>30s): 30 points
- Comments added: 25 points
- Proposal accepted: 25 points
- Total: 100 points maximum

**Key Performance Indicators:**

- Proposal view rate (% of sent proposals viewed)
- Average response time (hours from send to response)
- Acceptance rate (% of proposals accepted)
- Client engagement time (average time spent viewing)
- Comment engagement (proposals with client comments)
