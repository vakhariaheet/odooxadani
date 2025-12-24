# Module F01: Event Management

## Overview

**Estimated Time:** 1hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Low

**Dependencies:** None

## Problem Context

Event organizers need a streamlined way to create, manage, and promote their events with clear visibility into attendee registration and event performance. This module solves the core event lifecycle management from creation to completion.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler Files:** Create event CRUD handlers with typed interfaces
  - `handlers/listEvents.ts` - GET /api/events (public + own events)
  - `handlers/getEvent.ts` - GET /api/events/:id (public event details)
  - `handlers/createEvent.ts` - POST /api/events (event_organizer/admin only)
  - `handlers/updateEvent.ts` - PUT /api/events/:id (own events only)
  - `handlers/deleteEvent.ts` - DELETE /api/events/:id (own events only)

- [ ] **Function Configs:** Create corresponding .yml files for each handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbac`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'events', 'action')`
  - Always use try-catch with `handleAsyncError(error)` in catch block

- [ ] **Service Layer:** Business logic in `services/EventService.ts`
  - Event creation with validation
  - Event search and filtering (by category, date, location)
  - Event status management (draft, published, cancelled)
  - Attendee count tracking

- [ ] **Type Definitions:** Add types to `types.ts`
  - `Event`, `CreateEventRequest`, `UpdateEventRequest`, `EventListResponse`
  - Event categories, status enums
  - Search/filter query types

- [ ] **RBAC Verification:** Module already configured in `permissions.ts`
  - `user`: read any events, full CRUD on own events
  - `event_organizer`: read any events, full CRUD on own events
  - `venue_owner`: read any events
  - `admin`: full CRUD on all events

- [ ] **AWS Service Integration:** Use existing DynamoDB client wrapper
  - **NEVER import @aws-sdk packages directly**
  - Use `import { dynamodb } from '../../../shared/clients/dynamodb'`

- [ ] **Error Handling:** Use `handleAsyncError()` and `commonErrors.*` consistently

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.ts, .spec.ts) - Skip unit tests for hackathon speed

### Frontend Tasks

- [ ] **Components:**
  - `EventList.tsx` - Grid/list view of events with filtering
  - `EventCard.tsx` - Individual event display card
  - `EventForm.tsx` - Create/edit event form
  - `EventDetails.tsx` - Detailed event view page

- [ ] **shadcn Components:** button, card, form, input, textarea, select, badge, dialog

- [ ] **API Integration:** Event CRUD operations with loading states

- [ ] **State Management:** Local state for forms, TanStack Query for server state

- [ ] **Routing:**
  - `/events` - Public event listing
  - `/events/:id` - Event details
  - `/dashboard/events` - My events (organizers)
  - `/dashboard/events/create` - Create event
  - `/dashboard/events/:id/edit` - Edit event

- [ ] **Responsive Design:** Mobile-first approach with Tailwind CSS

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.tsx, .spec.tsx) - Skip unit tests for hackathon speed

### Database Schema (Single Table)

```
pk: EVENT#[eventId] | sk: METADATA | gsi1pk: CATEGORY#[category] | gsi1sk: [startDate]
pk: EVENT#[eventId] | sk: ORGANIZER#[userId] | gsi1pk: USER#[userId] | gsi1sk: EVENT#[eventId]

Event fields:
- eventId: string (UUID)
- title: string
- description: string
- category: string (music, sports, business, etc.)
- startDate: ISO string
- endDate: ISO string
- location: { address: string, city: string, coordinates?: [lat, lng] }
- maxAttendees: number
- currentAttendees: number
- price: number
- currency: string
- status: 'draft' | 'published' | 'cancelled' | 'completed'
- organizerId: string
- createdAt: ISO string
- updatedAt: ISO string
```

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

**CRITICAL REMINDER:** When implementing this module, DO NOT create markdown files. Only create code files (.ts, .tsx, .yml, etc.)

### Step 1: Backend Implementation (Lambda-Compatible)

**File Structure:**

```
backend/src/modules/events/
├── handlers/
│   ├── listEvents.ts         # GET /api/events
│   ├── getEvent.ts          # GET /api/events/:id
│   ├── createEvent.ts       # POST /api/events
│   ├── updateEvent.ts       # PUT /api/events/:id
│   └── deleteEvent.ts       # DELETE /api/events/:id
├── functions/
│   ├── listEvents.yml
│   ├── getEvent.yml
│   ├── createEvent.yml
│   ├── updateEvent.yml
│   └── deleteEvent.yml
├── services/
│   └── EventService.ts      # Business logic and data operations
└── types.ts                 # Domain-specific TypeScript types
```

**Service Layer Example:**

```typescript
// services/EventService.ts
export class EventService {
  async listEvents(query: EventListQuery): Promise<EventListResponse> {
    // Filter by category, date range, location
    // Support pagination
    // Return public events + user's own events
  }

  async getEvent(id: string, userId?: string): Promise<Event> {
    // Get event details
    // Check if user can view (public or own event)
  }

  async createEvent(data: CreateEventRequest, userId: string): Promise<Event> {
    // Validate event data
    // Set organizerId to current user
    // Create event with draft status
  }
}
```

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── components/events/
│   ├── EventList.tsx        # List view with filtering
│   ├── EventCard.tsx        # Event display card
│   ├── EventForm.tsx        # Create/edit form
│   └── EventDetails.tsx     # Detail view component
├── pages/events/
│   ├── EventsPage.tsx       # Public events listing
│   ├── EventDetailsPage.tsx # Event detail page
│   ├── MyEventsPage.tsx     # Organizer's events
│   └── CreateEventPage.tsx  # Create event page
├── hooks/
│   └── useEvents.ts         # Event API integration hooks
├── services/
│   └── eventsApi.ts         # Event API service functions
└── types/
    └── event.ts             # Frontend event types
```

### Step 3: Integration

- [ ] Test API endpoints with Postman/curl
- [ ] Connect frontend to backend
- [ ] Verify event creation and listing flow
- [ ] Test role-based access (organizers can create, users can view)

## Acceptance Criteria

- [ ] Event organizers can create events with all required details
- [ ] Public users can browse and search events by category/date/location
- [ ] Event organizers can view and manage their own events
- [ ] Events display properly in both list and detail views
- [ ] **Demo Ready:** Can create an event and show it in public listing in 30 seconds
- [ ] **Full-Stack Working:** Frontend connects to backend, backend connects to database
- [ ] **Lambda Compatible:** Backend code works in serverless environment
- [ ] **Error Handling:** Graceful failure modes implemented
- [ ] **Mobile Responsive:** Works on mobile devices

## Testing Checklist

- [ ] **Manual API Testing:**
  - Test event creation with valid data
  - Test event listing with filters
  - Test role-based access (organizers vs users)
  - Test error cases (invalid data, unauthorized access)

- [ ] **Frontend Testing:**
  - Manual testing in browser
  - Test event creation form
  - Test event listing and filtering
  - Test responsive design on mobile

- [ ] **Integration:** End-to-end event creation and viewing flow works

## Deployment Checklist

- [ ] **Serverless Config:** Added function imports to serverless.yml
- [ ] **Types:** Exported types from module's types.ts for frontend use
- [ ] **Testing:** Manual testing completed
- [ ] **RBAC:** Verified permissions work correctly for different roles

## Related Modules

- **Depends On:** None (Foundation module)
- **Enables:** M05 (Enhanced Event Discovery), M09 (Event-Venue Integration), M10 (Analytics)
- **Conflicts With:** None
