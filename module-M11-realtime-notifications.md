# Module M11: Real-time Notifications

## Overview

**Estimated Time:** 1hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Medium

**Dependencies:** F04 (Booking System) + WebSocket (existing)

## Problem Context

Users need real-time notifications for booking confirmations, cancellations, venue availability changes, event updates, and waitlist notifications to stay informed and respond quickly to time-sensitive opportunities. This module leverages the existing WebSocket infrastructure to provide instant communication.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler Files:** Create notification handlers using existing WebSocket
  - `handlers/sendBookingNotification.ts` - Send booking-related notifications
  - `handlers/sendVenueNotification.ts` - Send venue availability notifications
  - `handlers/sendEventNotification.ts` - Send event update notifications
  - `handlers/sendWaitlistNotification.ts` - Send waitlist availability notifications
  - `handlers/getNotificationHistory.ts` - GET /api/notifications/history

- [ ] **Function Configs:** Create corresponding .yml files for each handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbac`, `successResponse`, `handleAsyncError`
  - WebSocket handlers use existing WebSocket infrastructure

- [ ] **Service Layer:** Create `NotificationService.ts`
  - Real-time notification delivery via WebSocket
  - Notification persistence and history
  - User notification preferences management
  - Notification templates and formatting
  - Integration with existing booking, venue, and event services

- [ ] **Type Definitions:** Add notification types
  - `Notification`, `NotificationType`, `NotificationPreferences`
  - `BookingNotification`, `VenueNotification`, `EventNotification`
  - `NotificationTemplate`, `NotificationHistory`

- [ ] **RBAC Verification:** Uses existing WebSocket permissions
  - Users receive notifications for their own bookings and events
  - Venue owners receive notifications for their venues

- [ ] **AWS Service Integration:** Use existing WebSocket and DynamoDB clients
  - **NEVER import @aws-sdk packages directly**
  - Use existing WebSocket infrastructure from the project
  - Use `import { dynamodb } from '../../../shared/clients/dynamodb'`

- [ ] **Error Handling:** Use `handleAsyncError()` and `commonErrors.*` consistently

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.ts, .spec.ts) - Skip unit tests for hackathon speed

### Frontend Tasks

- [ ] **Notification Components:**
  - `NotificationCenter.tsx` - Central notification display
  - `NotificationToast.tsx` - Real-time toast notifications
  - `NotificationHistory.tsx` - Historical notifications list
  - `NotificationPreferences.tsx` - User notification settings
  - `NotificationBadge.tsx` - Unread notification indicator

- [ ] **shadcn Components:** toast, badge, dialog, switch, card, bell icon

- [ ] **WebSocket Integration:** Use existing WebSocket hooks and infrastructure

- [ ] **State Management:** Notification state, preferences, real-time updates

- [ ] **Routing:**
  - `/notifications` - Notification center and history
  - `/settings/notifications` - Notification preferences

- [ ] **Responsive Design:** Notifications work on all devices

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.tsx, .spec.tsx) - Skip unit tests for hackathon speed

### Database Schema for Notifications

```
# Notification storage patterns
pk: NOTIFICATION#[userId] | sk: [timestamp]#[notificationId] | gsi1pk: USER#[userId] | gsi1sk: [timestamp]
pk: NOTIFICATION#[notificationId] | sk: METADATA | gsi1pk: TYPE#[type] | gsi1sk: [timestamp]

# User notification preferences
pk: USER#[userId] | sk: NOTIFICATION_PREFERENCES | gsi1pk: USER#[userId] | gsi1sk: PREFERENCES

Notification fields:
- notificationId: string (UUID)
- userId: string
- type: 'booking_confirmed' | 'booking_cancelled' | 'venue_available' | 'event_updated' | 'waitlist_available'
- title: string
- message: string
- data: {
    bookingId?: string,
    venueId?: string,
    eventId?: string,
    actionUrl?: string
  }
- read: boolean
- delivered: boolean
- createdAt: ISO string
- readAt?: ISO string

Notification preferences:
- userId: string
- preferences: {
    bookingConfirmations: boolean,
    bookingCancellations: boolean,
    venueAvailability: boolean,
    eventUpdates: boolean,
    waitlistNotifications: boolean,
    emailNotifications: boolean,
    pushNotifications: boolean
  }
```

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** You MUST read `guidelines/project-architecture.md` COMPLETELY before writing any code.

**MANDATORY Reading (15-20 minutes):**

1. **Read `guidelines/project-architecture.md` COMPLETELY** (REQUIRED):
   - Complete backend and frontend architecture
   - Existing WebSocket infrastructure and patterns
   - Real-time communication implementation
   - Integration patterns with existing modules

2. **Study Existing WebSocket Implementation:**
   - Review existing WebSocket handlers in `backend/src/modules/websocket/`
   - Check WebSocket client integration in frontend
   - Study existing real-time communication patterns
   - Understand WebSocket connection management

**CRITICAL REMINDER:** When implementing this module, DO NOT create markdown files. Only create code files (.ts, .tsx, .yml, etc.)

### Step 1: Backend Implementation (Lambda-Compatible)

**File Structure:**

```
backend/src/modules/notifications/
├── handlers/
│   ├── sendBookingNotification.ts   # WebSocket booking notifications
│   ├── sendVenueNotification.ts     # WebSocket venue notifications
│   ├── sendEventNotification.ts     # WebSocket event notifications
│   ├── sendWaitlistNotification.ts  # WebSocket waitlist notifications
│   └── getNotificationHistory.ts    # GET /api/notifications/history
├── functions/
│   ├── sendBookingNotification.yml
│   ├── sendVenueNotification.yml
│   ├── sendEventNotification.yml
│   ├── sendWaitlistNotification.yml
│   └── getNotificationHistory.yml
├── services/
│   ├── NotificationService.ts       # Main notification service
│   └── NotificationTemplates.ts     # Notification message templates
└── types.ts                         # Notification types and interfaces
```

**Notification Service Example:**

```typescript
// services/NotificationService.ts
import { WebSocketService } from '../websocket/services/WebSocketService';

export class NotificationService {
  private webSocketService = new WebSocketService();

  async sendBookingNotification(
    userId: string,
    type: BookingNotificationType,
    bookingData: any
  ): Promise<void> {
    // 1. Check user notification preferences
    const preferences = await this.getUserNotificationPreferences(userId);
    if (!preferences.bookingConfirmations && type === 'booking_confirmed') return;

    // 2. Create notification record
    const notification = await this.createNotification({
      userId,
      type,
      title: this.getNotificationTitle(type, bookingData),
      message: this.getNotificationMessage(type, bookingData),
      data: { bookingId: bookingData.id, actionUrl: `/bookings/${bookingData.id}` },
    });

    // 3. Send real-time notification via WebSocket
    await this.webSocketService.sendToUser(userId, {
      type: 'notification',
      notification,
    });

    // 4. Send email notification if enabled
    if (preferences.emailNotifications) {
      await this.sendEmailNotification(userId, notification);
    }
  }

  async sendVenueAvailabilityNotification(userId: string, venueData: any): Promise<void> {
    // Notify users on waitlist when venue becomes available
    const notification = await this.createNotification({
      userId,
      type: 'venue_available',
      title: 'Venue Now Available!',
      message: `${venueData.name} is now available for your requested date.`,
      data: { venueId: venueData.id, actionUrl: `/venues/${venueData.id}/book` },
    });

    await this.webSocketService.sendToUser(userId, {
      type: 'notification',
      notification,
    });
  }

  async processWaitlistNotifications(venueId: string, date: string): Promise<void> {
    // Get all users on waitlist for this venue/date
    const waitlistUsers = await this.getWaitlistUsers(venueId, date);

    // Send notifications to all waitlisted users
    for (const user of waitlistUsers) {
      await this.sendVenueAvailabilityNotification(user.userId, {
        id: venueId,
        name: user.venueName,
      });
    }
  }

  private async createNotification(
    notificationData: CreateNotificationRequest
  ): Promise<Notification> {
    // Store notification in database
    // Return notification object for real-time delivery
  }

  private getNotificationTitle(type: NotificationType, data: any): string {
    // Use notification templates to generate titles
    return NotificationTemplates.getTitle(type, data);
  }
}
```

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── components/notifications/
│   ├── NotificationCenter.tsx       # Central notification hub
│   ├── NotificationToast.tsx        # Real-time toast notifications
│   ├── NotificationHistory.tsx      # Historical notifications
│   ├── NotificationPreferences.tsx  # User settings
│   └── NotificationBadge.tsx        # Unread count indicator
├── pages/notifications/
│   ├── NotificationsPage.tsx        # Notification center page
│   └── NotificationSettingsPage.tsx # Notification preferences
├── hooks/
│   ├── useNotifications.ts          # Notification hooks
│   ├── useRealtimeNotifications.ts  # WebSocket notification hooks
│   └── useNotificationPreferences.ts # Preferences hooks
└── utils/
    └── notificationHelpers.ts       # Notification utilities
```

**Real-time Notification Components:**

```typescript
// components/notifications/NotificationCenter.tsx
export const NotificationCenter = () => {
  const { data: notifications, loading } = useNotifications();
  const { unreadCount, markAsRead, markAllAsRead } = useNotificationActions();

  return (
    <Card className="w-80">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Notifications</CardTitle>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            Mark all read
          </Button>
        )}
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto">
        {notifications?.map(notification => (
          <div
            key={notification.id}
            className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
              !notification.read ? 'bg-blue-50' : ''
            }`}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{notification.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                <span className="text-xs text-gray-400">
                  {formatTimeAgo(notification.createdAt)}
                </span>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1" />
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// hooks/useRealtimeNotifications.ts
export const useRealtimeNotifications = () => {
  const { socket } = useWebSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data: { notification: Notification }) => {
      const { notification } = data;

      // Add to notifications list
      setNotifications(prev => [notification, ...prev]);

      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
        action: notification.data.actionUrl ? (
          <Button size="sm" onClick={() => navigate(notification.data.actionUrl)}>
            View
          </Button>
        ) : undefined
      });
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket, toast]);

  return { notifications };
};

// components/notifications/NotificationToast.tsx
export const NotificationToast = () => {
  useRealtimeNotifications(); // This hook handles toast display
  return null; // Component just sets up the real-time listener
};
```

### Step 3: Integration with Existing Modules

**Booking Integration:**

```typescript
// Enhance booking service to send notifications
// In BookingService.ts
export class BookingService {
  private notificationService = new NotificationService();

  async createBooking(data: CreateBookingRequest, userId: string): Promise<Booking> {
    const booking = await this.createBookingRecord(data, userId);

    // Send confirmation notification
    await this.notificationService.sendBookingNotification(userId, 'booking_confirmed', booking);

    // Notify venue owner
    await this.notificationService.sendBookingNotification(
      booking.venueOwnerId,
      'new_booking_received',
      booking
    );

    return booking;
  }
}
```

**Waitlist Integration:**

```typescript
// Enhance waitlist service with notifications
export class WaitlistService {
  private notificationService = new NotificationService();

  async processBookingCancellation(bookingId: string): Promise<void> {
    const booking = await this.getBooking(bookingId);

    // Process waitlist for the newly available slot
    await this.notificationService.processWaitlistNotifications(booking.venueId, booking.startDate);
  }
}
```

## Acceptance Criteria

- [ ] Users receive real-time notifications for booking confirmations and cancellations
- [ ] Venue owners receive notifications for new bookings at their venues
- [ ] Waitlisted users receive notifications when venues become available
- [ ] Notification center shows all notifications with read/unread status
- [ ] Users can customize their notification preferences
- [ ] Toast notifications appear for real-time events
- [ ] **Demo Ready:** Can demonstrate real-time notifications in 30 seconds
- [ ] **Real-time Delivery:** Notifications appear instantly via WebSocket
- [ ] **Persistent Storage:** Notification history is maintained
- [ ] **User Control:** Users can manage notification preferences

## Testing Checklist

- [ ] **Manual API Testing:**
  - Test notification creation and delivery
  - Test WebSocket notification sending
  - Test notification preferences management
  - Test notification history retrieval

- [ ] **Frontend Testing:**
  - Test real-time notification reception
  - Test toast notification display
  - Test notification center functionality
  - Test notification preferences interface

- [ ] **Integration:** End-to-end notification flow from trigger to display

## Deployment Checklist

- [ ] **WebSocket Integration:** Verified connection to existing WebSocket infrastructure
- [ ] **Serverless Config:** Added notification function imports to serverless.yml
- [ ] **Real-time Testing:** WebSocket notifications tested in real-time
- [ ] **Notification Templates:** Message templates configured and tested

## Related Modules

- **Depends On:** F04 (Booking System) + WebSocket (existing infrastructure)
- **Integrates With:** F01 (Event Management - event update notifications)
- **Integrates With:** F03 (Venue Management - venue availability notifications)
- **Integrates With:** M08 (Advanced Booking Features - waitlist notifications)

## Notification Types

**Booking Notifications:**

- Booking confirmed
- Booking cancelled
- Booking modified
- Payment processed
- Booking reminder (24 hours before)

**Venue Notifications:**

- New booking received (venue owners)
- Booking cancelled (venue owners)
- Venue availability changed
- Waitlist spot available

**Event Notifications:**

- Event updated
- Event cancelled
- Event reminder
- New attendee registered

**System Notifications:**

- Account verification
- Password reset
- Security alerts
- Platform updates

## Future Enhancements

**Push Notifications:**

- Browser push notifications
- Mobile app notifications
- Email digest notifications

**Advanced Features:**

- Notification scheduling
- Bulk notification sending
- Notification analytics
- A/B testing for notification content
