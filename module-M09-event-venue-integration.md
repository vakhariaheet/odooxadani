# Module M09: Event-Venue Integration

## Overview

**Estimated Time:** 1hr

**Complexity:** Medium

**Type:** Integration

**Risk Level:** Medium

**Dependencies:** F01 (Event Management) + F03 (Venue Management)

## Problem Context

Events and venues need to be seamlessly connected to solve the fragmented booking experience. Event organizers should be able to discover and book venues directly from event creation, while venue owners should see event bookings alongside regular venue bookings in a unified system.

## Technical Requirements

**Module Type:** Integration

### Backend Tasks

- [ ] **Handler Files:** Create integration endpoints
  - `handlers/linkEventToVenue.ts` - POST /api/events/:eventId/venue
  - `handlers/searchVenuesForEvent.ts` - GET /api/events/:eventId/venues/search
  - `handlers/getEventVenueDetails.ts` - GET /api/events/:eventId/venue
  - `handlers/unlinkEventFromVenue.ts` - DELETE /api/events/:eventId/venue
  - `handlers/getVenueEvents.ts` - GET /api/venues/:venueId/events

- [ ] **Function Configs:** Create corresponding .yml files for each handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbac`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'events', 'update')`

- [ ] **Service Layer:** Create `EventVenueIntegrationService.ts`
  - Event-venue linking and unlinking
  - Venue search with event-specific criteria
  - Availability synchronization between events and venues
  - Booking coordination for event-venue combinations
  - Conflict resolution and double-booking prevention

- [ ] **Type Definitions:** Add integration types to both modules
  - `EventVenueLink`, `VenueSearchForEvent`, `EventVenueDetails`
  - `IntegratedBooking`, `EventVenueConflict`

- [ ] **RBAC Verification:** Uses existing event and venue permissions
  - Event organizers can link venues to their events
  - Venue owners can see events at their venues

- [ ] **AWS Service Integration:** Use existing DynamoDB client wrapper
  - **NEVER import @aws-sdk packages directly**
  - Use `import { dynamodb } from '../../../shared/clients/dynamodb'`

- [ ] **Error Handling:** Use `handleAsyncError()` and `commonErrors.*` consistently

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.ts, .spec.ts) - Skip unit tests for hackathon speed

### Frontend Tasks

- [ ] **Integration Components:**
  - `VenueSearchForEvent.tsx` - Search venues when creating events
  - `EventVenueLinker.tsx` - Link/unlink venues from events
  - `VenueEventCalendar.tsx` - Show events and bookings together
  - `EventVenueDetails.tsx` - Combined event and venue information
  - `IntegratedBookingForm.tsx` - Book event + venue together

- [ ] **shadcn Components:** dialog, select, card, badge, calendar, tabs

- [ ] **API Integration:** Cross-module API calls with proper error handling

- [ ] **State Management:** Coordinated state between event and venue data

- [ ] **Routing:**
  - `/events/:eventId/venue/select` - Venue selection for event
  - `/venues/:venueId/events` - Events at specific venue
  - `/dashboard/integrated` - Combined event-venue management

- [ ] **Responsive Design:** Integrated views work on all devices

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.tsx, .spec.tsx) - Skip unit tests for hackathon speed

### Database Schema Integration

```
# Event-Venue relationship patterns
pk: EVENT#[eventId] | sk: VENUE#[venueId] | gsi1pk: VENUE#[venueId] | gsi1sk: EVENT#[eventId]
pk: VENUE#[venueId] | sk: EVENT#[eventId] | gsi1pk: EVENT#[eventId] | gsi1sk: VENUE#[venueId]

# Integrated booking patterns
pk: BOOKING#[bookingId] | sk: EVENT_VENUE | gsi1pk: EVENT#[eventId] | gsi1sk: VENUE#[venueId]

Integration fields:
- eventVenueLink: {
    eventId: string,
    venueId: string,
    linkType: 'confirmed' | 'pending' | 'cancelled',
    linkedAt: ISO string,
    linkedBy: string (userId),
    eventDate: ISO string,
    venueBookingId?: string
  }
- integratedBooking: {
    bookingId: string,
    eventId: string,
    venueId: string,
    bookingType: 'event_venue_combo',
    eventTickets: number,
    venueCapacityUsed: number
  }
```

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** You MUST read `guidelines/project-architecture.md` COMPLETELY before writing any code.

**MANDATORY Reading (15-20 minutes):**

1. **Read `guidelines/project-architecture.md` COMPLETELY** (REQUIRED):
   - Complete backend and frontend architecture
   - Database design and cross-module relationship patterns
   - Integration patterns between modules
   - API design for cross-module operations

2. **Study F01 and F03 Modules:**
   - Review event management API endpoints and data structures
   - Review venue management API endpoints and data structures
   - Understand existing booking patterns from F04
   - Study how modules can share data and functionality

**CRITICAL REMINDER:** When implementing this module, DO NOT create markdown files. Only create code files (.ts, .tsx, .yml, etc.)

### Step 1: Backend Implementation (Lambda-Compatible)

**File Structure:**

```
backend/src/modules/integration/
├── handlers/
│   ├── linkEventToVenue.ts         # POST /api/events/:eventId/venue
│   ├── searchVenuesForEvent.ts     # GET /api/events/:eventId/venues/search
│   ├── getEventVenueDetails.ts     # GET /api/events/:eventId/venue
│   ├── unlinkEventFromVenue.ts     # DELETE /api/events/:eventId/venue
│   └── getVenueEvents.ts           # GET /api/venues/:venueId/events
├── functions/
│   ├── linkEventToVenue.yml
│   ├── searchVenuesForEvent.yml
│   ├── getEventVenueDetails.yml
│   ├── unlinkEventFromVenue.yml
│   └── getVenueEvents.yml
├── services/
│   └── EventVenueIntegrationService.ts # Integration business logic
└── types.ts                        # Integration-specific types
```

**Integration Service Example:**

```typescript
// services/EventVenueIntegrationService.ts
export class EventVenueIntegrationService {
  async linkEventToVenue(
    eventId: string,
    venueId: string,
    userId: string
  ): Promise<EventVenueLink> {
    // 1. Verify user owns the event
    // 2. Check venue availability for event date
    // 3. Verify venue capacity meets event requirements
    // 4. Create bidirectional link in database
    // 5. Update event with venue information
    // 6. Notify venue owner of event booking
  }

  async searchVenuesForEvent(eventId: string, criteria: VenueSearchCriteria): Promise<Venue[]> {
    // Get event details (date, capacity, location preferences)
    // Search venues that match event requirements
    // Filter by availability on event date
    // Sort by relevance (location, capacity, amenities)
  }

  async getIntegratedBookingOptions(
    eventId: string,
    venueId: string
  ): Promise<IntegratedBookingOptions> {
    // Calculate combined pricing for event + venue
    // Check availability conflicts
    // Provide booking options for attendees
  }

  async handleEventVenueConflict(eventId: string, venueId: string): Promise<ConflictResolution> {
    // Detect scheduling conflicts
    // Provide resolution options
    // Handle automatic conflict prevention
  }
}
```

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── components/integration/
│   ├── VenueSearchForEvent.tsx      # Venue selection during event creation
│   ├── EventVenueLinker.tsx         # Link/unlink interface
│   ├── VenueEventCalendar.tsx       # Combined calendar view
│   ├── EventVenueDetails.tsx        # Integrated details view
│   └── IntegratedBookingForm.tsx    # Combined booking form
├── pages/integration/
│   ├── EventVenueSelectionPage.tsx  # Venue selection page
│   ├── VenueEventsPage.tsx          # Events at venue page
│   └── IntegratedDashboardPage.tsx  # Combined management
├── hooks/
│   ├── useEventVenueIntegration.ts  # Integration hooks
│   └── useIntegratedBooking.ts      # Combined booking hooks
└── utils/
    └── integrationHelpers.ts        # Integration utility functions
```

**Integration Component Examples:**

```typescript
// components/integration/VenueSearchForEvent.tsx
export const VenueSearchForEvent = ({ eventId, onVenueSelect }: VenueSearchForEventProps) => {
  const { data: event } = useEvent(eventId);
  const [searchCriteria, setSearchCriteria] = useState<VenueSearchCriteria>({
    capacity: event?.maxAttendees || 0,
    location: event?.location?.city || '',
    date: event?.startDate || '',
    amenities: []
  });

  const { data: venues, loading } = useVenueSearchForEvent(eventId, searchCriteria);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold">Event Requirements</h3>
        <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
          <div>Date: {formatDate(event?.startDate)}</div>
          <div>Capacity: {event?.maxAttendees} people</div>
          <div>Location: {event?.location?.city}</div>
        </div>
      </div>

      <div className="grid gap-4">
        {venues?.map(venue => (
          <Card key={venue.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold">{venue.name}</h4>
                <p className="text-sm text-gray-600">{venue.location.address}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">Capacity: {venue.capacity.max}</Badge>
                  <Badge variant="outline">${venue.pricing.basePrice}/{venue.pricing.pricingModel}</Badge>
                </div>
              </div>
              <Button onClick={() => onVenueSelect(venue)}>
                Select Venue
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// components/integration/VenueEventCalendar.tsx
export const VenueEventCalendar = ({ venueId }: { venueId: string }) => {
  const { data: events } = useVenueEvents(venueId);
  const { data: bookings } = useVenueBookings(venueId);

  const calendarEvents = useMemo(() => {
    const eventItems = events?.map(event => ({
      id: event.id,
      title: event.title,
      start: event.startDate,
      end: event.endDate,
      type: 'event',
      color: 'blue'
    })) || [];

    const bookingItems = bookings?.map(booking => ({
      id: booking.id,
      title: `Booking - ${booking.contactInfo.name}`,
      start: booking.startDate,
      end: booking.endDate,
      type: 'booking',
      color: 'green'
    })) || [];

    return [...eventItems, ...bookingItems];
  }, [events, bookings]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Events & Bookings Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          events={calendarEvents}
          onEventClick={handleEventClick}
          view="month"
        />
      </CardContent>
    </Card>
  );
};
```

### Step 3: Cross-Module Integration

**Enhanced Event Creation Flow:**

```typescript
// Enhanced event creation with venue selection
const createEventWithVenue = async (eventData: CreateEventRequest, venueId?: string) => {
  // 1. Create event
  const event = await createEvent(eventData);

  // 2. If venue selected, link them
  if (venueId) {
    await linkEventToVenue(event.id, venueId);
  }

  return event;
};

// Enhanced venue booking with event awareness
const createBookingWithEventCheck = async (bookingData: CreateBookingRequest) => {
  // Check if venue has events on the same date
  const conflicts = await checkEventVenueConflicts(bookingData.venueId, bookingData.startDate);

  if (conflicts.length > 0) {
    // Show conflict resolution options
    return handleBookingConflicts(conflicts, bookingData);
  }

  return createBooking(bookingData);
};
```

## Acceptance Criteria

- [ ] Event organizers can search and select venues during event creation
- [ ] Events and venues are properly linked with bidirectional relationships
- [ ] Venue owners can see events scheduled at their venues
- [ ] Integrated calendar shows both events and regular bookings
- [ ] Booking conflicts between events and venue bookings are prevented
- [ ] Combined booking flow works for event attendees
- [ ] **Demo Ready:** Can demonstrate event-venue integration in 30 seconds
- [ ] **Data Consistency:** Event and venue data stays synchronized
- [ ] **Conflict Prevention:** System prevents double bookings across modules
- [ ] **User Experience:** Integration feels seamless and natural

## Testing Checklist

- [ ] **Manual API Testing:**
  - Test event-venue linking and unlinking
  - Test venue search with event-specific criteria
  - Test conflict detection between events and bookings
  - Test cross-module data consistency

- [ ] **Frontend Testing:**
  - Test venue selection during event creation
  - Test integrated calendar view
  - Test combined booking flow
  - Test conflict resolution interfaces

- [ ] **Integration:** End-to-end event-venue workflows work correctly

## Deployment Checklist

- [ ] **Serverless Config:** Added integration function imports to serverless.yml
- [ ] **Cross-Module Types:** Shared types between event and venue modules
- [ ] **Testing:** Manual testing of all integration scenarios completed
- [ ] **Data Migration:** Existing events and venues can be linked if needed

## Related Modules

- **Depends On:** F01 (Event Management) + F03 (Venue Management)
- **Integrates With:** F04 (Booking System - for conflict prevention)
- **Enables:** M10 (Analytics & Reporting - cross-module analytics)
- **Enhances:** User experience across the entire platform

## Integration Patterns

**Data Synchronization:**

- Bidirectional links between events and venues
- Automatic availability updates
- Conflict detection and prevention
- Consistent data across modules

**User Experience:**

- Seamless venue selection during event creation
- Unified calendar views for venue owners
- Combined booking flows for attendees
- Integrated search and discovery

**Business Logic:**

- Capacity matching between events and venues
- Pricing coordination for combined bookings
- Availability synchronization
- Conflict resolution workflows
