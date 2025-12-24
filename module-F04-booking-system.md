# Module F04: Booking System

## Overview

**Estimated Time:** 1.5hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Medium

**Dependencies:** None

## Problem Context

Users need a streamlined booking system that prevents double bookings, provides real-time availability, and handles the complete booking lifecycle from reservation to completion. This module solves the core booking workflow that eliminates the manual coordination problems mentioned in the problem statement.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler Files:** Create booking CRUD handlers with typed interfaces
  - `handlers/listBookings.ts` - GET /api/bookings (user's own bookings)
  - `handlers/getBooking.ts` - GET /api/bookings/:id (booking details)
  - `handlers/createBooking.ts` - POST /api/bookings (create new booking)
  - `handlers/updateBooking.ts` - PUT /api/bookings/:id (modify booking)
  - `handlers/cancelBooking.ts` - DELETE /api/bookings/:id (cancel booking)
  - `handlers/confirmBooking.ts` - POST /api/bookings/:id/confirm (venue owner confirms)

- [ ] **Function Configs:** Create corresponding .yml files for each handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbac`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'bookings', 'action')`
  - Always use try-catch with `handleAsyncError(error)` in catch block

- [ ] **Service Layer:** Business logic in `services/BookingService.ts`
  - Booking creation with conflict checking
  - Real-time availability verification
  - Booking status management (pending, confirmed, cancelled, completed)
  - Payment processing integration (mock for hackathon)
  - Notification system integration

- [ ] **Type Definitions:** Add types to `types.ts`
  - `Booking`, `CreateBookingRequest`, `UpdateBookingRequest`, `BookingListResponse`
  - `BookingStatus`, `PaymentStatus`, `BookingConflictCheck`
  - Booking confirmation and cancellation types

- [ ] **RBAC Verification:** Module already configured in `permissions.ts`
  - `user`: full CRUD on own bookings
  - `event_organizer`: full CRUD on own bookings
  - `venue_owner`: read and update bookings for their venues
  - `admin`: full CRUD on all bookings

- [ ] **AWS Service Integration:** Use existing client wrappers
  - **NEVER import @aws-sdk packages directly**
  - Use `import { dynamodb } from '../../../shared/clients/dynamodb'`
  - Use `import { ses } from '../../../shared/clients/ses'` for booking confirmations

- [ ] **Error Handling:** Use `handleAsyncError()` and `commonErrors.*` consistently

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.ts, .spec.ts) - Skip unit tests for hackathon speed

### Frontend Tasks

- [ ] **Components:**
  - `BookingList.tsx` - List of user's bookings with status
  - `BookingCard.tsx` - Individual booking display card
  - `BookingForm.tsx` - Create booking form with date/time selection
  - `BookingDetails.tsx` - Detailed booking view
  - `BookingConfirmation.tsx` - Booking success/confirmation page
  - `PaymentForm.tsx` - Mock payment form (for demo)

- [ ] **shadcn Components:** button, card, form, input, select, badge, dialog, calendar, alert

- [ ] **API Integration:** Booking CRUD operations with real-time conflict checking

- [ ] **State Management:** Local state for forms, TanStack Query for server state

- [ ] **Routing:**
  - `/bookings` - User's booking history
  - `/bookings/:id` - Booking details
  - `/venues/:venueId/book` - Create booking for venue
  - `/events/:eventId/book` - Create booking for event
  - `/bookings/:id/confirm` - Booking confirmation page

- [ ] **Responsive Design:** Mobile-first approach with Tailwind CSS

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.tsx, .spec.tsx) - Skip unit tests for hackathon speed

### Database Schema (Single Table)

```
pk: BOOKING#[bookingId] | sk: METADATA | gsi1pk: USER#[userId] | gsi1sk: [createdAt]
pk: BOOKING#[bookingId] | sk: VENUE#[venueId] | gsi1pk: VENUE#[venueId] | gsi1sk: [startDate]
pk: BOOKING#[bookingId] | sk: EVENT#[eventId] | gsi1pk: EVENT#[eventId] | gsi1sk: [startDate]

Booking fields:
- bookingId: string (UUID)
- userId: string (person making booking)
- venueId?: string (if venue booking)
- eventId?: string (if event booking)
- bookingType: 'venue' | 'event'
- startDate: ISO string
- endDate: ISO string
- startTime: string (HH:mm)
- endTime: string (HH:mm)
- attendeeCount: number
- totalAmount: number
- currency: string
- status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
- paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed'
- paymentId?: string (mock payment reference)
- specialRequests?: string
- contactInfo: {
    name: string,
    email: string,
    phone: string
  }
- createdAt: ISO string
- updatedAt: ISO string
- confirmedAt?: ISO string
- cancelledAt?: ISO string
```

## External Services

### Mock Payment Service

- **Purpose:** Simulate payment processing for demo
- **Setup Steps:**
  1. Create mock payment service in `services/PaymentService.ts`
  2. Simulate payment success/failure with random delays
- **Environment Variables:** None needed (mock service)
- **Code Pattern:**

```typescript
// Mock payment that always succeeds after 2 seconds
const processPayment = async (amount: number): Promise<{ success: boolean; paymentId: string }> => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return { success: true, paymentId: `mock_${Date.now()}` };
};
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
backend/src/modules/bookings/
├── handlers/
│   ├── listBookings.ts      # GET /api/bookings
│   ├── getBooking.ts        # GET /api/bookings/:id
│   ├── createBooking.ts     # POST /api/bookings
│   ├── updateBooking.ts     # PUT /api/bookings/:id
│   ├── cancelBooking.ts     # DELETE /api/bookings/:id
│   └── confirmBooking.ts    # POST /api/bookings/:id/confirm
├── functions/
│   ├── listBookings.yml
│   ├── getBooking.yml
│   ├── createBooking.yml
│   ├── updateBooking.yml
│   ├── cancelBooking.yml
│   └── confirmBooking.yml
├── services/
│   ├── BookingService.ts    # Business logic and data operations
│   └── PaymentService.ts    # Mock payment processing
└── types.ts                 # Domain-specific TypeScript types
```

**Service Layer Example:**

```typescript
// services/BookingService.ts
export class BookingService {
  async createBooking(data: CreateBookingRequest, userId: string): Promise<Booking> {
    // 1. Check availability conflicts
    // 2. Validate booking data
    // 3. Process mock payment
    // 4. Create booking record
    // 5. Send confirmation email
    // 6. Update venue/event availability
  }

  async checkAvailability(venueId: string, startDate: string, endDate: string): Promise<boolean> {
    // Check for existing bookings that conflict
    // Return true if slot is available
  }

  async confirmBooking(bookingId: string, venueOwnerId: string): Promise<Booking> {
    // Venue owner confirms the booking
    // Update status and send notifications
  }
}
```

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── components/bookings/
│   ├── BookingList.tsx      # List view with status filters
│   ├── BookingCard.tsx      # Booking display card
│   ├── BookingForm.tsx      # Create booking form
│   ├── BookingDetails.tsx   # Detail view component
│   ├── BookingConfirmation.tsx # Success page
│   └── PaymentForm.tsx      # Mock payment form
├── pages/bookings/
│   ├── BookingsPage.tsx     # User's bookings
│   ├── BookingDetailsPage.tsx # Booking detail page
│   ├── CreateBookingPage.tsx # Create booking page
│   └── BookingConfirmationPage.tsx # Confirmation page
├── hooks/
│   └── useBookings.ts       # Booking API integration hooks
├── services/
│   └── bookingsApi.ts       # Booking API service functions
└── types/
    └── booking.ts           # Frontend booking types
```

### Step 3: Integration

- [ ] Test API endpoints with Postman/curl
- [ ] Connect frontend to backend
- [ ] Verify booking creation and conflict checking
- [ ] Test payment flow (mock)
- [ ] Test role-based access (users vs venue owners)

## Acceptance Criteria

- [ ] Users can create bookings for venues with date/time selection
- [ ] System prevents double bookings with real-time conflict checking
- [ ] Users can view their booking history and status
- [ ] Venue owners can confirm/reject bookings for their venues
- [ ] Mock payment processing works smoothly
- [ ] Email confirmations are sent (using SES client)
- [ ] **Demo Ready:** Can create a booking and show confirmation in 30 seconds
- [ ] **Full-Stack Working:** Frontend connects to backend, backend connects to database
- [ ] **Lambda Compatible:** Backend code works in serverless environment
- [ ] **Error Handling:** Graceful failure modes implemented
- [ ] **Mobile Responsive:** Works on mobile devices

## Testing Checklist

- [ ] **Manual API Testing:**
  - Test booking creation with valid data
  - Test conflict detection (try to book same slot twice)
  - Test booking confirmation by venue owner
  - Test booking cancellation
  - Test role-based access (users vs venue owners)
  - Test error cases (invalid data, unauthorized access)

- [ ] **Frontend Testing:**
  - Manual testing in browser
  - Test booking creation form with date/time picker
  - Test booking list and filtering
  - Test mock payment flow
  - Test responsive design on mobile

- [ ] **Integration:** End-to-end booking creation and confirmation flow works

## Deployment Checklist

- [ ] **Serverless Config:** Added function imports to serverless.yml
- [ ] **Types:** Exported types from module's types.ts for frontend use
- [ ] **Testing:** Manual testing completed
- [ ] **RBAC:** Verified permissions work correctly for different roles
- [ ] **Email Service:** SES client integration tested

## Related Modules

- **Depends On:** None (Foundation module - uses mock services)
- **Enables:** M08 (Advanced Booking Features), M10 (Analytics), M11 (Real-time Notifications)
- **Conflicts With:** None

## Risk Mitigation

**Medium Risk Factors:**

1. **Booking Conflicts:** Implement atomic operations for booking creation
2. **Payment Integration:** Use mock service for hackathon, design for real integration later
3. **Real-time Updates:** Use polling for now, WebSocket integration in M11

**Backup Plans:**

- If payment mock is complex, simplify to instant success
- If conflict checking is complex, implement basic time slot validation
- If email integration fails, log confirmations to console
