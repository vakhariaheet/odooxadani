# Module F03: Venue Management

## Overview

**Estimated Time:** 1hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Low

**Dependencies:** None

## Problem Context

Venue owners need a comprehensive system to manage their spaces, track availability, handle booking requests, and prevent double bookings. This module provides the core venue management capabilities that solve the operational inefficiencies mentioned in the problem statement.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler Files:** Create venue CRUD handlers with typed interfaces
  - `handlers/listVenues.ts` - GET /api/venues (public venue search)
  - `handlers/getVenue.ts` - GET /api/venues/:id (venue details with availability)
  - `handlers/createVenue.ts` - POST /api/venues (venue_owner/admin only)
  - `handlers/updateVenue.ts` - PUT /api/venues/:id (own venues only)
  - `handlers/deleteVenue.ts` - DELETE /api/venues/:id (own venues only)
  - `handlers/getAvailability.ts` - GET /api/venues/:id/availability (real-time slots)

- [ ] **Function Configs:** Create corresponding .yml files for each handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbac`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'venues', 'action')`
  - Always use try-catch with `handleAsyncError(error)` in catch block

- [ ] **Service Layer:** Business logic in `services/VenueService.ts`
  - Venue creation with validation
  - Availability management (time slots, capacity)
  - Search and filtering (location, capacity, amenities, price range)
  - Real-time availability checking

- [ ] **Type Definitions:** Add types to `types.ts`
  - `Venue`, `CreateVenueRequest`, `UpdateVenueRequest`, `VenueListResponse`
  - `AvailabilitySlot`, `VenueAmenities`, `VenueSearchQuery`
  - Venue categories, pricing models

- [ ] **RBAC Verification:** Module already configured in `permissions.ts`
  - `user`: read any venues
  - `event_organizer`: read any venues
  - `venue_owner`: read any venues, full CRUD on own venues
  - `admin`: full CRUD on all venues

- [ ] **AWS Service Integration:** Use existing DynamoDB client wrapper
  - **NEVER import @aws-sdk packages directly**
  - Use `import { dynamodb } from '../../../shared/clients/dynamodb'`

- [ ] **Error Handling:** Use `handleAsyncError()` and `commonErrors.*` consistently

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.ts, .spec.ts) - Skip unit tests for hackathon speed

### Frontend Tasks

- [ ] **Components:**
  - `VenueList.tsx` - Grid/list view of venues with search/filters
  - `VenueCard.tsx` - Individual venue display card
  - `VenueForm.tsx` - Create/edit venue form
  - `VenueDetails.tsx` - Detailed venue view with availability
  - `AvailabilityCalendar.tsx` - Calendar showing available time slots

- [ ] **shadcn Components:** button, card, form, input, textarea, select, badge, dialog, calendar

- [ ] **API Integration:** Venue CRUD operations with real-time availability

- [ ] **State Management:** Local state for forms, TanStack Query for server state

- [ ] **Routing:**
  - `/venues` - Public venue search
  - `/venues/:id` - Venue details with booking
  - `/dashboard/venues` - My venues (venue owners)
  - `/dashboard/venues/create` - Add new venue
  - `/dashboard/venues/:id/edit` - Edit venue

- [ ] **Responsive Design:** Mobile-first approach with Tailwind CSS

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.tsx, .spec.tsx) - Skip unit tests for hackathon speed

### Database Schema (Single Table)

```
pk: VENUE#[venueId] | sk: METADATA | gsi1pk: LOCATION#[city] | gsi1sk: [capacity]
pk: VENUE#[venueId] | sk: OWNER#[userId] | gsi1pk: USER#[userId] | gsi1sk: VENUE#[venueId]
pk: VENUE#[venueId] | sk: AVAILABILITY#[date] | gsi1pk: AVAILABLE#[date] | gsi1sk: VENUE#[venueId]

Venue fields:
- venueId: string (UUID)
- name: string
- description: string
- category: string (conference, wedding, concert, etc.)
- location: {
    address: string,
    city: string,
    state: string,
    zipCode: string,
    coordinates: [lat, lng]
  }
- capacity: { min: number, max: number }
- amenities: string[] (parking, wifi, catering, av_equipment, etc.)
- pricing: {
    basePrice: number,
    currency: string,
    pricingModel: 'hourly' | 'daily' | 'event'
  }
- images: string[] (S3 URLs)
- ownerId: string
- status: 'active' | 'inactive' | 'maintenance'
- createdAt: ISO string
- updatedAt: ISO string

Availability fields:
- date: string (YYYY-MM-DD)
- timeSlots: {
    startTime: string (HH:mm),
    endTime: string (HH:mm),
    available: boolean,
    bookingId?: string
  }[]
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
backend/src/modules/venues/
├── handlers/
│   ├── listVenues.ts        # GET /api/venues
│   ├── getVenue.ts          # GET /api/venues/:id
│   ├── createVenue.ts       # POST /api/venues
│   ├── updateVenue.ts       # PUT /api/venues/:id
│   ├── deleteVenue.ts       # DELETE /api/venues/:id
│   └── getAvailability.ts   # GET /api/venues/:id/availability
├── functions/
│   ├── listVenues.yml
│   ├── getVenue.yml
│   ├── createVenue.yml
│   ├── updateVenue.yml
│   ├── deleteVenue.yml
│   └── getAvailability.yml
├── services/
│   └── VenueService.ts      # Business logic and data operations
└── types.ts                 # Domain-specific TypeScript types
```

**Service Layer Example:**

```typescript
// services/VenueService.ts
export class VenueService {
  async listVenues(query: VenueSearchQuery): Promise<VenueListResponse> {
    // Filter by location, capacity, amenities, price range
    // Support pagination and sorting
    // Return public venue information
  }

  async getVenue(id: string): Promise<Venue> {
    // Get venue details with current availability
    // Include owner information for contact
  }

  async createVenue(data: CreateVenueRequest, userId: string): Promise<Venue> {
    // Validate venue data
    // Set ownerId to current user
    // Initialize default availability slots
  }

  async getAvailability(
    venueId: string,
    startDate: string,
    endDate: string
  ): Promise<AvailabilitySlot[]> {
    // Get real-time availability for date range
    // Check for existing bookings
    // Return available time slots
  }
}
```

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── components/venues/
│   ├── VenueList.tsx        # List view with search/filters
│   ├── VenueCard.tsx        # Venue display card
│   ├── VenueForm.tsx        # Create/edit form
│   ├── VenueDetails.tsx     # Detail view component
│   └── AvailabilityCalendar.tsx # Availability display
├── pages/venues/
│   ├── VenuesPage.tsx       # Public venue search
│   ├── VenueDetailsPage.tsx # Venue detail page
│   ├── MyVenuesPage.tsx     # Owner's venues
│   └── CreateVenuePage.tsx  # Create venue page
├── hooks/
│   └── useVenues.ts         # Venue API integration hooks
├── services/
│   └── venuesApi.ts         # Venue API service functions
└── types/
    └── venue.ts             # Frontend venue types
```

### Step 3: Integration

- [ ] Test API endpoints with Postman/curl
- [ ] Connect frontend to backend
- [ ] Verify venue creation and search flow
- [ ] Test availability checking functionality
- [ ] Test role-based access (venue owners can create, users can search)

## Acceptance Criteria

- [ ] Venue owners can create venues with all required details
- [ ] Public users can search venues by location, capacity, amenities
- [ ] Venue owners can view and manage their own venues
- [ ] Real-time availability checking works correctly
- [ ] Venues display properly in both list and detail views
- [ ] **Demo Ready:** Can create a venue and show it in search results in 30 seconds
- [ ] **Full-Stack Working:** Frontend connects to backend, backend connects to database
- [ ] **Lambda Compatible:** Backend code works in serverless environment
- [ ] **Error Handling:** Graceful failure modes implemented
- [ ] **Mobile Responsive:** Works on mobile devices

## Testing Checklist

- [ ] **Manual API Testing:**
  - Test venue creation with valid data
  - Test venue search with various filters
  - Test availability checking for different dates
  - Test role-based access (venue owners vs users)
  - Test error cases (invalid data, unauthorized access)

- [ ] **Frontend Testing:**
  - Manual testing in browser
  - Test venue creation form
  - Test venue search and filtering
  - Test availability calendar display
  - Test responsive design on mobile

- [ ] **Integration:** End-to-end venue creation and search flow works

## Deployment Checklist

- [ ] **Serverless Config:** Added function imports to serverless.yml
- [ ] **Types:** Exported types from module's types.ts for frontend use
- [ ] **Testing:** Manual testing completed
- [ ] **RBAC:** Verified permissions work correctly for different roles

## Related Modules

- **Depends On:** None (Foundation module)
- **Enables:** M07 (Venue Analytics), M09 (Event-Venue Integration), M10 (Analytics)
- **Conflicts With:** None
