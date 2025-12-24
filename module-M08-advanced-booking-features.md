# Module M08: Advanced Booking Features

## Overview

**Estimated Time:** 1hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Medium

**Dependencies:** F04 (Booking System)

## Problem Context

Building on the basic booking system, users need advanced features like recurring bookings, booking modifications, waitlists, group bookings, and enhanced communication between bookers and venue owners to create a truly seamless booking experience.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler Files:** Enhance booking system with advanced features
  - `handlers/createRecurringBooking.ts` - POST /api/bookings/recurring
  - `handlers/modifyBooking.ts` - PUT /api/bookings/:id/modify
  - `handlers/joinWaitlist.ts` - POST /api/bookings/:id/waitlist
  - `handlers/createGroupBooking.ts` - POST /api/bookings/group
  - `handlers/getBookingMessages.ts` - GET /api/bookings/:id/messages
  - `handlers/sendBookingMessage.ts` - POST /api/bookings/:id/messages

- [ ] **Function Configs:** Create corresponding .yml files for each handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbac`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'bookings', 'action')`
  - Use ownership middleware for booking-specific operations

- [ ] **Service Layer:** Enhance `BookingService.ts` with advanced features
  - Recurring booking creation and management
  - Booking modification with conflict checking
  - Waitlist management and automatic notifications
  - Group booking coordination and split payments
  - Booking communication system

- [ ] **Type Definitions:** Add enhanced types to `types.ts`
  - `RecurringBooking`, `BookingModification`, `WaitlistEntry`, `GroupBooking`
  - `BookingMessage`, `BookingCommunication`, `BookingNotification`
  - Recurring patterns and modification types

- [ ] **RBAC Verification:** Uses existing booking module permissions
  - Enhanced with communication and modification permissions

- [ ] **AWS Service Integration:** Use existing client wrappers
  - **NEVER import @aws-sdk packages directly**
  - Use `import { dynamodb } from '../../../shared/clients/dynamodb'`
  - Use `import { ses } from '../../../shared/clients/ses'` for notifications

- [ ] **Error Handling:** Use `handleAsyncError()` and `commonErrors.*` consistently

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.ts, .spec.ts) - Skip unit tests for hackathon speed

### Frontend Tasks

- [ ] **Enhanced Booking Components:**
  - `RecurringBookingForm.tsx` - Create recurring bookings
  - `BookingModificationForm.tsx` - Modify existing bookings
  - `WaitlistDialog.tsx` - Join waitlist for unavailable slots
  - `GroupBookingForm.tsx` - Coordinate group bookings
  - `BookingCommunication.tsx` - Message thread with venue owner
  - `BookingCalendarView.tsx` - Calendar view of all bookings

- [ ] **shadcn Components:** calendar, dialog, form, textarea, badge, alert, tabs

- [ ] **API Integration:** Advanced booking operations with optimistic updates

- [ ] **State Management:** Complex form state, TanStack Query for server state

- [ ] **Routing:**
  - `/bookings/:id/modify` - Modify booking page
  - `/bookings/:id/messages` - Booking communication
  - `/bookings/recurring/create` - Create recurring booking
  - `/bookings/group/create` - Create group booking

- [ ] **Responsive Design:** Enhanced mobile experience for booking management

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.tsx, .spec.tsx) - Skip unit tests for hackathon speed

### Database Schema Enhancements

```
# Recurring booking patterns
pk: BOOKING#[bookingId] | sk: RECURRING#[instanceId] | gsi1pk: RECURRING#[parentId] | gsi1sk: [date]
pk: BOOKING#[bookingId] | sk: MODIFICATION#[modificationId] | gsi1pk: BOOKING#[bookingId] | gsi1sk: [timestamp]

# Waitlist management
pk: WAITLIST#[venueId]#[date] | sk: USER#[userId] | gsi1pk: USER#[userId] | gsi1sk: WAITLIST#[timestamp]

# Group booking coordination
pk: GROUP#[groupId] | sk: BOOKING#[bookingId] | gsi1pk: BOOKING#[bookingId] | gsi1sk: GROUP#[groupId]

# Booking communication
pk: BOOKING#[bookingId] | sk: MESSAGE#[messageId] | gsi1pk: BOOKING#[bookingId] | gsi1sk: [timestamp]

Enhanced booking fields:
- recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly',
    interval: number,
    endDate: string,
    daysOfWeek?: number[],
    exceptions?: string[]
  }
- modificationHistory: BookingModification[]
- groupBookingId?: string
- waitlistPosition?: number
- communicationThread: BookingMessage[]
- lastModified: ISO string
- modificationCount: number
```

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** You MUST read `guidelines/project-architecture.md` COMPLETELY before writing any code.

**MANDATORY Reading (15-20 minutes):**

1. **Read `guidelines/project-architecture.md` COMPLETELY** (REQUIRED):
   - Complete backend and frontend architecture
   - Database design and complex relationship patterns
   - Authentication and authorization flow
   - Existing booking system patterns from F04

2. **Study F04 Booking System:**
   - Review existing booking handlers and services
   - Understand current database schema
   - Study booking form patterns and validation
   - Check existing booking status management

**CRITICAL REMINDER:** When implementing this module, DO NOT create markdown files. Only create code files (.ts, .tsx, .yml, etc.)

### Step 1: Backend Implementation (Lambda-Compatible)

**File Structure:**

```
backend/src/modules/bookings/
├── handlers/
│   ├── createRecurringBooking.ts    # POST /api/bookings/recurring
│   ├── modifyBooking.ts             # PUT /api/bookings/:id/modify
│   ├── joinWaitlist.ts              # POST /api/bookings/:id/waitlist
│   ├── createGroupBooking.ts        # POST /api/bookings/group
│   ├── getBookingMessages.ts        # GET /api/bookings/:id/messages
│   └── sendBookingMessage.ts        # POST /api/bookings/:id/messages
├── functions/
│   ├── createRecurringBooking.yml
│   ├── modifyBooking.yml
│   ├── joinWaitlist.yml
│   ├── createGroupBooking.yml
│   ├── getBookingMessages.yml
│   └── sendBookingMessage.yml
├── services/
│   ├── BookingService.ts            # Enhanced with advanced features
│   ├── RecurringBookingService.ts   # Recurring booking logic
│   └── WaitlistService.ts           # Waitlist management
└── types.ts                         # Enhanced with advanced booking types
```

**Enhanced Service Layer Example:**

```typescript
// services/RecurringBookingService.ts
export class RecurringBookingService {
  async createRecurringBooking(
    data: CreateRecurringBookingRequest,
    userId: string
  ): Promise<RecurringBooking> {
    // 1. Validate recurring pattern
    // 2. Generate all booking instances
    // 3. Check availability for each instance
    // 4. Create parent booking and instances
    // 5. Handle partial failures gracefully
  }

  async modifyRecurringBooking(
    bookingId: string,
    modifications: BookingModification
  ): Promise<RecurringBooking> {
    // Handle modifications to recurring series
    // Options: this instance only, this and future, all instances
  }
}

// services/WaitlistService.ts
export class WaitlistService {
  async joinWaitlist(venueId: string, date: string, userId: string): Promise<WaitlistEntry> {
    // Add user to waitlist for specific date/time
    // Calculate position in queue
    // Set up notifications for availability
  }

  async processWaitlist(venueId: string, date: string): Promise<void> {
    // When booking becomes available, notify waitlist users
    // Process in FIFO order
    // Send availability notifications
  }
}
```

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── components/bookings/advanced/
│   ├── RecurringBookingForm.tsx     # Recurring booking creation
│   ├── BookingModificationForm.tsx  # Modify existing bookings
│   ├── WaitlistDialog.tsx           # Join waitlist
│   ├── GroupBookingForm.tsx         # Group booking coordination
│   ├── BookingCommunication.tsx     # Message thread
│   └── BookingCalendarView.tsx      # Calendar view
├── pages/bookings/
│   ├── ModifyBookingPage.tsx        # Booking modification
│   ├── RecurringBookingPage.tsx     # Create recurring booking
│   └── GroupBookingPage.tsx         # Group booking creation
├── hooks/
│   ├── useRecurringBookings.ts      # Recurring booking hooks
│   ├── useBookingModification.ts    # Modification hooks
│   └── useWaitlist.ts               # Waitlist hooks
└── utils/
    └── recurringPatterns.ts         # Recurring pattern helpers
```

**Advanced Component Examples:**

```typescript
// components/bookings/advanced/RecurringBookingForm.tsx
export const RecurringBookingForm = ({ venueId }: { venueId: string }) => {
  const [recurringPattern, setRecurringPattern] = useState<RecurringPattern>({
    frequency: 'weekly',
    interval: 1,
    endDate: '',
    daysOfWeek: []
  });

  const { mutate: createRecurring, loading } = useRecurringBookings();

  const handleSubmit = async (bookingData: CreateBookingRequest) => {
    await createRecurring({
      ...bookingData,
      recurringPattern,
      venueId
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Frequency</Label>
          <Select value={recurringPattern.frequency} onValueChange={(value) =>
            setRecurringPattern(prev => ({ ...prev, frequency: value }))
          }>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </Select>
        </div>

        <div>
          <Label>Repeat Every</Label>
          <Input
            type="number"
            min="1"
            value={recurringPattern.interval}
            onChange={(e) => setRecurringPattern(prev => ({
              ...prev,
              interval: parseInt(e.target.value)
            }))}
          />
        </div>
      </div>

      {recurringPattern.frequency === 'weekly' && (
        <div>
          <Label>Days of Week</Label>
          <div className="flex gap-2 mt-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <Button
                key={day}
                type="button"
                variant={recurringPattern.daysOfWeek?.includes(index) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleDayOfWeek(index)}
              >
                {day}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Rest of booking form */}
      <Button type="submit" disabled={loading}>
        Create Recurring Booking
      </Button>
    </form>
  );
};

// components/bookings/advanced/BookingCommunication.tsx
export const BookingCommunication = ({ bookingId }: { bookingId: string }) => {
  const { data: messages, loading } = useBookingMessages(bookingId);
  const { mutate: sendMessage } = useSendBookingMessage();
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    await sendMessage({
      bookingId,
      message: newMessage,
      type: 'user_message'
    });

    setNewMessage('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-64 overflow-y-auto space-y-2">
          {messages?.map(message => (
            <div key={message.id} className={`p-2 rounded ${
              message.senderId === currentUserId ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'
            }`}>
              <p className="text-sm">{message.content}</p>
              <span className="text-xs text-gray-500">
                {formatDate(message.timestamp)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </CardContent>
    </Card>
  );
};
```

### Step 3: Advanced Features Integration

**Waitlist Management:**

```typescript
// components/bookings/advanced/WaitlistDialog.tsx
export const WaitlistDialog = ({ venueId, date, onClose }: WaitlistDialogProps) => {
  const { mutate: joinWaitlist, loading } = useWaitlist();

  const handleJoinWaitlist = async () => {
    await joinWaitlist({ venueId, date });
    toast.success('Added to waitlist! We\'ll notify you when a spot opens up.');
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Waitlist</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>This time slot is currently unavailable. Would you like to join the waitlist?</p>
          <p className="text-sm text-gray-600">
            We'll notify you immediately if a spot becomes available.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleJoinWaitlist} disabled={loading}>
              Join Waitlist
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

## Acceptance Criteria

- [ ] Users can create recurring bookings with flexible patterns
- [ ] Users can modify existing bookings with conflict checking
- [ ] Users can join waitlists for unavailable time slots
- [ ] Group bookings can be coordinated with multiple participants
- [ ] Communication system works between bookers and venue owners
- [ ] Calendar view shows all bookings in an organized layout
- [ ] **Demo Ready:** Can demonstrate advanced booking features in 30 seconds
- [ ] **Conflict Prevention:** Modification system prevents double bookings
- [ ] **User Experience:** Advanced features are intuitive and easy to use
- [ ] **Mobile Responsive:** All advanced features work on mobile devices

## Testing Checklist

- [ ] **Manual API Testing:**
  - Test recurring booking creation with different patterns
  - Test booking modification with conflict scenarios
  - Test waitlist functionality and notifications
  - Test group booking coordination
  - Test communication system between users

- [ ] **Frontend Testing:**
  - Test recurring booking form with various patterns
  - Test booking modification flow
  - Test waitlist dialog and notifications
  - Test communication interface
  - Test calendar view with multiple bookings

- [ ] **Integration:** End-to-end advanced booking flows work correctly

## Deployment Checklist

- [ ] **Serverless Config:** Added advanced booking function imports to serverless.yml
- [ ] **Types:** Advanced booking types exported for frontend use
- [ ] **Testing:** Manual testing of all advanced features completed
- [ ] **Notifications:** Email notifications for waitlist and modifications work
- [ ] **RBAC:** Advanced booking permissions verified

## Related Modules

- **Depends On:** F04 (Booking System)
- **Integrates With:** F03 (Venue Management - for availability checking)
- **Integrates With:** WebSocket (for real-time notifications)
- **Enables:** M11 (Real-time Notifications - booking updates)

## Risk Mitigation

**Medium Risk Factors:**

1. **Complex Recurring Logic:** Start with simple patterns, add complexity gradually
2. **Booking Conflicts:** Implement robust conflict checking with atomic operations
3. **Group Coordination:** Use simple coordination, avoid complex payment splitting

**Backup Plans:**

- If recurring bookings are complex, implement weekly-only patterns first
- If group bookings are complex, focus on individual booking modifications
- If communication system is complex, implement basic messaging only
- If waitlist is complex, implement simple notification system
