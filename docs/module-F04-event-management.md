# Module F04: Event Management

## Overview

**Estimated Time:** 1hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Low

**Dependencies:** None

## Problem Context

Organizers need to create and manage hackathon events, set up event parameters, manage participant registration, and configure event-specific settings. This module provides the foundation for event creation and management that other modules will reference.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler File:** Create `handlers/listEvents.ts` with typed handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbac`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'events', 'read')`
  - Always use try-catch with `handleAsyncError(error)` in catch block

- [ ] **Handler File:** Create `handlers/getEvent.ts` for single event retrieval
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'events', 'read')`

- [ ] **Handler File:** Create `handlers/createEvent.ts` for event creation
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'events', 'create')`

- [ ] **Handler File:** Create `handlers/updateEvent.ts` for event editing
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'events', 'update')`

- [ ] **Handler File:** Create `handlers/deleteEvent.ts` for event removal
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'events', 'delete')`

- [ ] **Handler File:** Create `handlers/registerEvent.ts` for participant registration
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'events', 'update')`

- [ ] **Function Config:** Create corresponding `.yml` files in `functions/` directory
  - Specify handler path: `src/modules/events/handlers/[action]Event.handler`
  - Define HTTP method and path
  - Add authorizer: `clerkJwtAuthorizer` (for protected routes)

- [ ] **Service Layer:** Business logic in `services/EventService.ts`
  - Create service class with methods for business logic
  - Instantiate service at module level: `const eventService = new EventService()`
  - Keep handlers thin - delegate to service methods
  - **MANDATORY AI Integration:** Include AI-powered event management features

- [ ] **AI Features Implementation:**
  - `generateEventDescription()` - AI-enhanced event descriptions
  - `suggestEventCategories()` - AI-powered category suggestions
  - `analyzeEventTrends()` - AI insights on hackathon trends
  - `optimizeEventSchedule()` - AI-powered schedule optimization

- [ ] **Type Definitions:** Add types to `types.ts` for requests/responses
  - Request query/body types
  - Response data types
  - Service method parameter types

- [ ] **RBAC Verification:** Verify `config/permissions.ts` includes this module
  - Module should already be in `ALL_MODULES` list (configured during planning)
  - Role permissions should already be configured in `ROLE_MODULE_ACCESS`
  - Just verify the module name matches what you're implementing

- [ ] **AWS Service Integration:** **ALWAYS use shared/clients/\* wrappers**
  - **Already Available**: DynamoDB, S3, SES, SQS, Gemini AI clients in `shared/clients/`
  - **For NEW services**: Create new client wrapper following existing patterns
  - **Clerk API**: Direct import OK: `import { createClerkClient } from '@clerk/backend'`
  - **NEVER import @aws-sdk packages directly in handlers or services**

- [ ] **Error Handling:** Use `handleAsyncError()` and `commonErrors.*` consistently

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.ts, .spec.ts) - Skip unit tests for hackathon speed

### Frontend Tasks

- [ ] **Pages/Components:**
  - `EventList.tsx` - Browse all hackathon events
  - `EventForm.tsx` - Create/edit event information
  - `EventCard.tsx` - Individual event display with registration
  - `EventDetails.tsx` - Full event view with participant management
  - `EventDashboard.tsx` - Organizer dashboard for event management
  - `RegistrationModal.tsx` - Modal for event registration

- [ ] **shadcn Components:** button, form, table, dialog, card, badge, calendar, select, textarea

- [ ] **API Integration:**
  - GET /api/events (list events with filters)
  - GET /api/events/:id (get single event)
  - POST /api/events (create new event)
  - PUT /api/events/:id (update event)
  - DELETE /api/events/:id (delete event)
  - POST /api/events/:id/register (register for event)

- [ ] **AI Features:**
  - AI-enhanced event descriptions
  - Smart category suggestions
  - Event trend insights
  - Schedule optimization recommendations

- [ ] **State Management:** TanStack Query for server state, local state for form data

- [ ] **Routing:**
  - `/events` - Events list page
  - `/events/new` - Create event page
  - `/events/:id` - Event details page
  - `/events/:id/edit` - Edit event page
  - `/events/:id/dashboard` - Organizer dashboard

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.tsx, .spec.tsx) - Skip unit tests for hackathon speed

### Database Schema (Single Table)

```
pk: EVENT#[id] | sk: METADATA | gsi1pk: ORGANIZER#[organizerId] | gsi1sk: START_DATE#[startDate]
- name: string (event name)
- description: string (event description)
- organizerId: string (organizer Clerk user ID)
- organizerName: string (organizer display name)
- startDate: string (ISO timestamp)
- endDate: string (ISO timestamp)
- registrationDeadline: string (ISO timestamp)
- location: string (physical location or "Virtual")
- maxParticipants: number (maximum participants)
- currentParticipants: number (current registration count)
- categories: string[] (hackathon categories/themes)
- prizes: Prize[] (prize information)
- rules: string (event rules and guidelines)
- status: string (draft, published, ongoing, completed, cancelled)
- isPublic: boolean (whether event is publicly visible)
- requiresApproval: boolean (whether registration requires approval)
- tags: string[] (AI-generated tags)
- trendScore: number (AI-assessed trend relevance 1-10)
- createdAt: string (ISO timestamp)
- updatedAt: string (ISO timestamp)

pk: EVENT#[id] | sk: PARTICIPANT#[userId] | gsi1pk: USER#[userId] | gsi1sk: REGISTERED#[timestamp]
- eventId: string
- userId: string
- userName: string
- userEmail: string
- skills: string[] (participant's skills)
- registrationStatus: string (registered, approved, waitlisted, cancelled)
- registeredAt: string (ISO timestamp)
- approvedAt: string (ISO timestamp, optional)

pk: EVENT#[id] | sk: SETTINGS | gsi1pk: EVENT#[id] | gsi1sk: SETTINGS
- eventId: string
- allowTeamFormation: boolean
- allowIdeaSubmission: boolean
- allowJudgeScoring: boolean
- maxTeamSize: number
- ideaSubmissionDeadline: string (ISO timestamp)
- judgingStartDate: string (ISO timestamp)
- customFields: CustomField[] (additional registration fields)
```

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** You MUST read `guidelines/project-architecture.md` COMPLETELY before writing any code.

**MANDATORY Reading (15-20 minutes):**

1. **Read `guidelines/project-architecture.md` COMPLETELY** (REQUIRED)
2. **Study Similar Existing Modules:** Review existing modules in `backend/src/modules/` for patterns
3. **Check Available Clients:** Review `backend/src/shared/clients/` for AWS service clients
4. **Examine Frontend Patterns:** Study `client/src/components/admin/` for UI patterns

### Step 1: Backend Implementation (Lambda-Compatible)

**File Structure:**

```
backend/src/modules/events/
├── handlers/
│   ├── listEvents.ts        # GET /api/events
│   ├── getEvent.ts          # GET /api/events/:id
│   ├── createEvent.ts       # POST /api/events
│   ├── updateEvent.ts       # PUT /api/events/:id
│   ├── deleteEvent.ts       # DELETE /api/events/:id
│   └── registerEvent.ts     # POST /api/events/:id/register
├── functions/
│   ├── listEvents.yml
│   ├── getEvent.yml
│   ├── createEvent.yml
│   ├── updateEvent.yml
│   ├── deleteEvent.yml
│   └── registerEvent.yml
├── services/
│   └── EventService.ts      # Business logic and AI integration
└── types.ts                 # Domain-specific TypeScript types
```

**Service Layer Example:**

```typescript
// services/EventService.ts
import { geminiClient } from '../../../shared/clients/gemini';
import { dynamodb } from '../../../shared/clients/dynamodb';
import { ses } from '../../../shared/clients/ses';

export class EventService {
  async listEvents(query: ListEventsQuery): Promise<EventListResponse> {
    // Query events with filtering and pagination
  }

  async getEvent(id: string): Promise<Event> {
    // Fetch single event with participant count and settings
  }

  async createEvent(data: CreateEventRequest): Promise<Event> {
    // Create new event with AI enhancement
    const enhancedDescription = await this.generateEventDescription(data);
    const suggestedCategories = await this.suggestEventCategories(data.name, enhancedDescription);
    const trendScore = await this.analyzeEventTrends(data);

    // Save to DynamoDB with enhanced data
  }

  // MANDATORY: AI-powered event description enhancement
  async generateEventDescription(eventData: CreateEventRequest): Promise<string> {
    const prompt = `Enhance this hackathon event description to be more engaging and informative:
    
    Event Name: ${eventData.name}
    Original Description: ${eventData.description}
    Categories: ${eventData.categories.join(', ')}
    Duration: ${eventData.startDate} to ${eventData.endDate}
    
    Make it compelling for developers, designers, and entrepreneurs. Include what participants can expect to learn and build.`;

    const response = await geminiClient.generateText({
      prompt,
      maxTokens: 400,
    });

    return response.text;
  }

  // MANDATORY: AI-powered category suggestions
  async suggestEventCategories(name: string, description: string): Promise<string[]> {
    const prompt = `Suggest 3-5 relevant categories for this hackathon event:
    
    Name: ${name}
    Description: ${description}
    
    Choose from common hackathon categories: Web Development, Mobile Apps, AI/ML, Blockchain, IoT, Gaming, FinTech, HealthTech, EdTech, Social Impact, Open Source, DevTools, AR/VR, Cybersecurity, Data Science.
    
    Return only the category names as a comma-separated list.`;

    const response = await geminiClient.generateText({
      prompt,
      maxTokens: 100,
    });

    return response.text.split(',').map((cat) => cat.trim());
  }

  // MANDATORY: AI-powered trend analysis
  async analyzeEventTrends(eventData: CreateEventRequest): Promise<number> {
    const prompt = `Rate the trend relevance of this hackathon event on a scale of 1-10:
    
    Name: ${eventData.name}
    Description: ${eventData.description}
    Categories: ${eventData.categories.join(', ')}
    
    Consider current tech trends, market demand, and developer interest.
    Return only the numeric score.`;

    const response = await geminiClient.generateText({
      prompt,
      maxTokens: 10,
    });

    return parseInt(response.text.trim()) || 5;
  }

  async registerForEvent(
    eventId: string,
    userId: string,
    registrationData: EventRegistration
  ): Promise<void> {
    // Handle event registration with email confirmation
    const event = await this.getEvent(eventId);

    // Save registration to DynamoDB
    await dynamodb.put({
      PK: `EVENT#${eventId}`,
      SK: `PARTICIPANT#${userId}`,
      GSI1PK: `USER#${userId}`,
      GSI1SK: `REGISTERED#${new Date().toISOString()}`,
      ...registrationData,
      registeredAt: new Date().toISOString(),
      registrationStatus: event.requiresApproval ? 'pending' : 'approved',
    });

    // Send confirmation email
    await ses.sendTemplated({
      from: 'noreply@hackmatch.com',
      to: registrationData.userEmail,
      templateName: 'event-registration-confirmation',
      templateData: {
        eventName: event.name,
        eventDate: event.startDate,
        userName: registrationData.userName,
      },
    });
  }

  async updateEvent(id: string, data: UpdateEventRequest): Promise<Event> {
    // Update event with validation
  }

  async deleteEvent(id: string, organizerId: string): Promise<void> {
    // Soft delete event and notify participants
  }
}
```

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── components/events/
│   ├── EventList.tsx        # List view with filtering
│   ├── EventForm.tsx        # Create/edit form
│   ├── EventCard.tsx        # Individual event card
│   ├── EventDetails.tsx     # Full event view
│   ├── EventDashboard.tsx   # Organizer dashboard
│   └── RegistrationModal.tsx # Registration modal
├── pages/events/
│   ├── EventsListPage.tsx   # Events list page
│   ├── EventCreatePage.tsx  # Create event page
│   ├── EventDetailsPage.tsx # Event details page
│   └── EventDashboardPage.tsx # Organizer dashboard page
├── hooks/
│   └── useEvents.ts         # API integration hooks
├── services/
│   └── eventsApi.ts         # API service functions
└── types/
    └── event.ts             # Frontend-specific types
```

**Event Card Example:**

```typescript
// components/events/EventCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, TrendingUp } from 'lucide-react';

interface EventCardProps {
  event: Event;
  onRegister: (eventId: string) => void;
}

export const EventCard = ({ event, onRegister }: EventCardProps) => {
  const isRegistrationOpen = new Date() < new Date(event.registrationDeadline);
  const isFull = event.currentParticipants >= event.maxParticipants;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{event.name}</CardTitle>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm">{event.trendScore}/10</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(event.startDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{event.currentParticipants}/{event.maxParticipants}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4 line-clamp-3">{event.description}</p>

        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {event.categories.map((category) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {event.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          onClick={() => onRegister(event.id)}
          disabled={!isRegistrationOpen || isFull}
          className="w-full"
        >
          {!isRegistrationOpen ? 'Registration Closed' :
           isFull ? 'Event Full' : 'Register Now'}
        </Button>
      </CardContent>
    </Card>
  );
};
```

### Step 3: Serverless Configuration

**Update serverless.yml:**

```yaml
functions:
  # ... existing functions ...

  # Import event module functions
  - ${file(src/modules/events/functions/listEvents.yml)}
  - ${file(src/modules/events/functions/getEvent.yml)}
  - ${file(src/modules/events/functions/createEvent.yml)}
  - ${file(src/modules/events/functions/updateEvent.yml)}
  - ${file(src/modules/events/functions/deleteEvent.yml)}
  - ${file(src/modules/events/functions/registerEvent.yml)}
```

### Step 4: Integration

- [ ] **Type Check:** Run `bun run typecheck` in both backend and client directories
- [ ] Test API endpoints with Postman/curl
- [ ] Connect frontend to backend
- [ ] Verify AI enhancement features are working
- [ ] Test event registration functionality
- [ ] Verify email notifications work
- [ ] Verify data flow end-to-end

## Acceptance Criteria

- [ ] Organizers can create events with all necessary details and settings
- [ ] Participants can browse and register for events
- [ ] Registration system with approval workflow for restricted events
- [ ] **AI Feature Working:** Event description enhancement, category suggestions, and trend analysis functional
- [ ] **Demo Ready:** Can demonstrate complete event creation and registration flow in 30 seconds
- [ ] **Full-Stack Working:** Frontend connects to backend, backend connects to database
- [ ] **Lambda Compatible:** Backend code works in serverless environment
- [ ] **Error Handling:** Graceful failure modes implemented
- [ ] **Mobile Responsive:** Works on mobile devices
- [ ] **Email Notifications:** Registration confirmations sent via SES

## Testing Checklist

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
  - Test AI features display

- [ ] **Integration:** End-to-end flow works as expected
- [ ] **Edge Cases:** Error scenarios handled gracefully
- [ ] **Performance:** Acceptable load times (<2s for API calls)
- [ ] **Email Testing:** Registration confirmation emails work

## Deployment Checklist

- [ ] **CRITICAL - Type Check:** Run `bun run typecheck` in both backend and client
- [ ] **Code Review:** Self-review completed
- [ ] **Serverless Config:** Added function imports to serverless.yml
- [ ] **RBAC Config:** Verified permissions.ts includes events module
- [ ] **Types:** Exported types from module's types.ts for frontend use
- [ ] **Testing:** Manual testing completed
- [ ] **AI Integration:** Verified Gemini client integration works
- [ ] **Email Templates:** SES email templates configured

## Related Modules

- **Depends On:** None (Foundation module)
- **Enables:** M05 (Event Analytics), M08 (Advanced Event Features), M10 (Multi-Event Management)
- **Conflicts With:** None
