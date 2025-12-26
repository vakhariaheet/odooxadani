# Module M09: Real-time Notifications

## Overview

**Estimated Time:** 2hr

**Complexity:** Complex

**Type:** Full-stack

**Risk Level:** Medium

**Dependencies:** All previous modules (F01, F02, F03, F04, M05, M06, M07, M08)

## Problem Context

As the platform grows with multiple modules generating activities (ideas, teams, votes, scores), participants need real-time notifications to stay engaged and respond quickly to opportunities. This module creates a comprehensive notification system that delivers timely updates about team invitations, idea feedback, vote milestones, and judge scores through WebSocket connections and persistent notification management.

## Technical Requirements

**Module Type:** Full-stack (Integration module - connects all previous modules with real-time communication)

### Backend Tasks

- [ ] **Handler Files:** Create notification management handlers
  - `handlers/getNotifications.ts` - GET /api/notifications
  - `handlers/markAsRead.ts` - PUT /api/notifications/:id/read
  - `handlers/markAllAsRead.ts` - PUT /api/notifications/read-all
  - `handlers/getNotificationSettings.ts` - GET /api/notifications/settings
  - `handlers/updateNotificationSettings.ts` - PUT /api/notifications/settings
  - `handlers/sendNotification.ts` - POST /api/notifications/send (internal)

- [ ] **Function Configs:** Create serverless function configurations
  - `functions/getNotifications.yml` - Get user notifications
  - `functions/markAsRead.yml` - Mark notification as read
  - `functions/markAllAsRead.yml` - Mark all notifications as read
  - `functions/getNotificationSettings.yml` - Get notification preferences
  - `functions/updateNotificationSettings.yml` - Update preferences
  - `functions/sendNotification.yml` - Send notification (internal)

- [ ] **Service Layer:** Create notification service
  - `services/NotificationService.ts` - Notification management
  - Real-time WebSocket message broadcasting
  - Notification persistence and retrieval
  - User preference management
  - Notification templating and formatting
  - Integration with all existing modules

- [ ] **WebSocket Integration:** Extend existing WebSocket module
  - Add notification broadcasting to WebSocket handlers
  - Real-time notification delivery
  - Connection management for notification subscriptions

- [ ] **Type Definitions:** Add notification types
  - `NotificationRequest`, `NotificationResponse`, `NotificationSettings`
  - `NotificationType`, `NotificationPriority`, `NotificationChannel` enums
  - `WebSocketNotification`, `NotificationTemplate` interfaces

- [ ] **RBAC Verification:** Module already configured in permissions.ts
  - Participants can read own notifications and update settings
  - System can send notifications to any user

### Frontend Tasks

- [ ] **Components:** Create notification UI
  - `components/notifications/NotificationCenter.tsx` - Main notification panel
  - `components/notifications/NotificationItem.tsx` - Individual notification
  - `components/notifications/NotificationBell.tsx` - Header notification icon
  - `components/notifications/NotificationSettings.tsx` - Preference management
  - `components/notifications/ToastNotification.tsx` - Real-time toast display
  - `components/notifications/NotificationList.tsx` - Notification history

- [ ] **Real-time Integration:** WebSocket notification handling
  - Real-time notification reception via WebSocket
  - Toast notifications for immediate alerts
  - Notification badge updates
  - Sound and visual notification options

- [ ] **Pages:** Create notification-focused pages
  - `pages/notifications/NotificationsPage.tsx` - Full notification center
  - `pages/notifications/NotificationSettingsPage.tsx` - Manage preferences
  - Update existing pages with notification integration

- [ ] **API Integration:** Create notification hooks
  - `hooks/useNotifications.ts` - Notification management
  - `hooks/useWebSocketNotifications.ts` - Real-time notifications
  - `services/notificationsApi.ts` - Notification API service

- [ ] **State Management:** Notification state management
  - Real-time notification state
  - Unread count tracking
  - Notification history management
  - Settings synchronization

### Database Schema (Single Table)

```
# Notification Entity
PK: USER#[userId] | SK: NOTIFICATION#[notificationId] | GSI1PK: NOTIFICATION#[type] | GSI1SK: [createdAt]
- notificationId: string (UUID)
- userId: string (recipient Clerk user ID)
- type: 'team_invitation' | 'idea_vote' | 'idea_comment' | 'judge_score' | 'team_update' | 'system'
- title: string (notification headline)
- message: string (notification content)
- actionUrl?: string (optional link for action)
- actionText?: string (optional action button text)
- priority: 'low' | 'medium' | 'high' | 'urgent'
- isRead: boolean
- createdAt: ISO string
- readAt?: ISO string
- expiresAt?: ISO string (optional expiration)
- metadata: {
  sourceId?: string (idea ID, team ID, etc.)
  sourceType?: string (idea, team, vote, etc.)
  actorId?: string (who triggered the notification)
  actorName?: string (denormalized actor name)
  additionalData?: object (type-specific data)
}

# Notification Settings
PK: USER#[userId] | SK: NOTIFICATION_SETTINGS
- userId: string
- emailNotifications: boolean
- pushNotifications: boolean
- soundEnabled: boolean
- notificationTypes: {
  team_invitations: { enabled: boolean, email: boolean, push: boolean }
  idea_votes: { enabled: boolean, email: boolean, push: boolean }
  idea_comments: { enabled: boolean, email: boolean, push: boolean }
  judge_scores: { enabled: boolean, email: boolean, push: boolean }
  team_updates: { enabled: boolean, email: boolean, push: boolean }
  system: { enabled: boolean, email: boolean, push: boolean }
}
- quietHours: {
  enabled: boolean
  startTime: string (HH:MM)
  endTime: string (HH:MM)
  timezone: string
}
- updatedAt: ISO string

# Notification Templates
PK: TEMPLATE#[type] | SK: [variant]
- type: string (notification type)
- variant: string (e.g., 'default', 'milestone', 'urgent')
- titleTemplate: string (with placeholders)
- messageTemplate: string (with placeholders)
- actionUrlTemplate?: string
- actionTextTemplate?: string
- defaultPriority: string
- isActive: boolean
```

## Enhancement Features

### Enhancement Feature: Smart Notification Intelligence

**Problem Solved:** Users get overwhelmed with too many notifications or miss important ones due to poor timing and relevance filtering.

**Enhancement Type:** Smart Logic + AI - Intelligent notification timing, batching, and relevance scoring

**User Trigger:** Automatic - runs in background for all notification decisions

**Input Requirements:**

- **Required Fields:** User activity patterns, notification history, current context
- **Optional Fields:** User preferences, device status, time zone
- **Validation Rules:** User must have notification settings configured

**Processing Logic:**

1. **Relevance Scoring:** Calculate notification importance based on user interests and activity
2. **Timing Optimization:** Determine optimal delivery time based on user patterns
3. **Batching Intelligence:** Group related notifications to reduce noise
4. **Context Awareness:** Consider user's current activity and availability

**COMPLETE IMPLEMENTATION SPECIFICATION:**

**Types Definition:**

```typescript
// types.ts - Add these exact types
export interface SmartNotificationRequest {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata: {
    sourceId?: string;
    sourceType?: string;
    actorId?: string;
    actorName?: string;
    urgency?: 'low' | 'medium' | 'high' | 'critical';
    category?: string;
  };
  actionUrl?: string;
  actionText?: string;
}

export interface NotificationIntelligence {
  relevanceScore: number; // 0-100
  optimalDeliveryTime: string; // ISO timestamp
  shouldBatch: boolean;
  batchKey?: string;
  deliveryChannel: 'realtime' | 'email' | 'both' | 'none';
  reasoning: string[];
}

export interface NotificationBatch {
  batchKey: string;
  notifications: SmartNotificationRequest[];
  scheduledFor: string;
  title: string;
  summary: string;
}

export interface UserNotificationPattern {
  userId: string;
  activeHours: { start: string; end: string };
  responseRate: number; // 0-1
  preferredTypes: NotificationType[];
  lastActiveAt: string;
  deviceInfo?: {
    isOnline: boolean;
    lastSeen: string;
  };
}
```

**Frontend Component:**

```typescript
// components/notifications/SmartNotificationCenter.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  BellRing,
  Check,
  Settings,
  Filter,
  Clock,
  Users,
  Lightbulb,
  Star,
  MessageCircle
} from 'lucide-react';
import { useWebSocketNotifications } from '@/hooks/useWebSocketNotifications';
import { toast } from 'sonner';

export const SmartNotificationCenter = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('unread');

  // WebSocket integration for real-time notifications
  const {
    isConnected,
    lastNotification,
    sendMessage
  } = useWebSocketNotifications();

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  useEffect(() => {
    // Handle real-time notifications
    if (lastNotification) {
      handleNewNotification(lastNotification);
    }
  }, [lastNotification]);

  const loadNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${await getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleNewNotification = (notification: any) => {
    // Add to notifications list
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show toast for high priority notifications
    if (notification.priority === 'high' || notification.priority === 'urgent') {
      toast(notification.title, {
        description: notification.message,
        action: notification.actionUrl ? {
          label: notification.actionText || 'View',
          onClick: () => window.location.href = notification.actionUrl
        } : undefined,
        duration: notification.priority === 'urgent' ? 10000 : 5000
      });
    }

    // Play notification sound if enabled
    if (notification.priority !== 'low') {
      playNotificationSound();
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await getToken()}`
        }
      });

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await getToken()}`
        }
      });

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'team_invitation': return <Users className="w-4 h-4 text-blue-600" />;
      case 'idea_vote': return <Lightbulb className="w-4 h-4 text-yellow-600" />;
      case 'idea_comment': return <MessageCircle className="w-4 h-4 text-green-600" />;
      case 'judge_score': return <Star className="w-4 h-4 text-purple-600" />;
      case 'team_update': return <Users className="w-4 h-4 text-orange-600" />;
      default: return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-300 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const playNotificationSound = () => {
    // Simple notification sound
    const audio = new Audio('/notification-sound.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Ignore audio play errors (user interaction required)
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.isRead;
      case 'important': return notification.priority === 'high' || notification.priority === 'urgent';
      default: return true;
    }
  });

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5" />
        ) : (
          <Bell className="w-5 h-5" />
        )}

        {unreadCount > 0 && (
          <Badge
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            variant="destructive"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-96 max-h-96 overflow-hidden shadow-lg z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/notifications/settings">
                    <Settings className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Filter Tabs */}
            <Tabs value={filter} onValueChange={(value: any) => setFilter(value)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
                <TabsTrigger value="important">Important</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="p-0">
            {/* Mark All Read Button */}
            {unreadCount > 0 && (
              <div className="px-4 pb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="w-full"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark All as Read
                </Button>
              </div>
            )}

            {/* Notifications List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-l-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                        getPriorityColor(notification.priority)
                      } ${!notification.isRead ? 'bg-opacity-100' : 'bg-opacity-30'}`}
                      onClick={() => {
                        if (!notification.isRead) {
                          markAsRead(notification.id);
                        }
                        if (notification.actionUrl) {
                          window.location.href = notification.actionUrl;
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className={`text-sm font-medium ${!notification.isRead ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {notification.message}
                              </div>
                            </div>

                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-primary rounded-full ml-2 mt-1" />
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimeAgo(notification.createdAt)}</span>
                            </div>

                            {notification.actionText && (
                              <Badge variant="outline" className="text-xs">
                                {notification.actionText}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* View All Link */}
            <div className="p-3 border-t">
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link to="/notifications">
                  View All Notifications
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
```

**Backend Service Method:**

```typescript
// services/NotificationService.ts
export class NotificationService {
  async sendSmartNotification(params: SmartNotificationRequest): Promise<void> {
    try {
      // Get user notification preferences
      const userSettings = await this.getUserNotificationSettings(params.userId);

      // Check if user wants this type of notification
      if (!this.shouldSendNotification(params.type, userSettings)) {
        return;
      }

      // Calculate notification intelligence
      const intelligence = await this.calculateNotificationIntelligence(params);

      // Decide delivery method and timing
      if (intelligence.shouldBatch) {
        await this.addToBatch(params, intelligence);
      } else if (intelligence.deliveryChannel !== 'none') {
        await this.deliverNotification(params, intelligence);
      }
    } catch (error) {
      console.error('Smart notification failed:', error);
      // Fallback to basic notification
      await this.sendBasicNotification(params);
    }
  }

  private async calculateNotificationIntelligence(
    params: SmartNotificationRequest
  ): Promise<NotificationIntelligence> {
    try {
      // Get user activity patterns
      const userPattern = await this.getUserNotificationPattern(params.userId);

      // Calculate relevance score
      const relevanceScore = this.calculateRelevanceScore(params, userPattern);

      // Determine optimal delivery time
      const optimalDeliveryTime = this.calculateOptimalDeliveryTime(userPattern);

      // Check if should batch with other notifications
      const shouldBatch = this.shouldBatchNotification(params, userPattern);

      // Determine delivery channel
      const deliveryChannel = this.determineDeliveryChannel(params, userPattern, relevanceScore);

      return {
        relevanceScore,
        optimalDeliveryTime,
        shouldBatch,
        batchKey: shouldBatch ? this.generateBatchKey(params) : undefined,
        deliveryChannel,
        reasoning: [
          `Relevance: ${relevanceScore}% based on user interests`,
          `Timing: ${optimalDeliveryTime} based on activity patterns`,
          `Channel: ${deliveryChannel} based on urgency and preferences`,
        ],
      };
    } catch (error) {
      console.error('Intelligence calculation failed:', error);

      // Fallback to basic intelligence
      return {
        relevanceScore: 50,
        optimalDeliveryTime: new Date().toISOString(),
        shouldBatch: false,
        deliveryChannel: 'realtime',
        reasoning: ['Fallback to basic delivery'],
      };
    }
  }

  private calculateRelevanceScore(
    params: SmartNotificationRequest,
    userPattern: UserNotificationPattern
  ): number {
    let score = 50; // Base score

    // Boost for preferred notification types
    if (userPattern.preferredTypes.includes(params.type)) {
      score += 30;
    }

    // Boost for high urgency
    if (params.metadata.urgency === 'critical') {
      score += 40;
    } else if (params.metadata.urgency === 'high') {
      score += 20;
    }

    // Reduce for low response rate users
    if (userPattern.responseRate < 0.3) {
      score -= 20;
    }

    // Boost for recently active users
    const lastActiveMinutes =
      (Date.now() - new Date(userPattern.lastActiveAt).getTime()) / (1000 * 60);
    if (lastActiveMinutes < 30) {
      score += 15;
    } else if (lastActiveMinutes > 1440) {
      // 24 hours
      score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateOptimalDeliveryTime(userPattern: UserNotificationPattern): string {
    const now = new Date();
    const currentHour = now.getHours();

    // Parse user's active hours
    const [activeStart] = userPattern.activeHours.start.split(':').map(Number);
    const [activeEnd] = userPattern.activeHours.end.split(':').map(Number);

    // If currently in active hours, deliver immediately
    if (currentHour >= activeStart && currentHour <= activeEnd) {
      return now.toISOString();
    }

    // Otherwise, schedule for next active period
    const nextActiveTime = new Date();
    if (currentHour < activeStart) {
      // Later today
      nextActiveTime.setHours(activeStart, 0, 0, 0);
    } else {
      // Tomorrow
      nextActiveTime.setDate(nextActiveTime.getDate() + 1);
      nextActiveTime.setHours(activeStart, 0, 0, 0);
    }

    return nextActiveTime.toISOString();
  }

  private shouldBatchNotification(
    params: SmartNotificationRequest,
    userPattern: UserNotificationPattern
  ): boolean {
    // Don't batch urgent notifications
    if (params.metadata.urgency === 'critical' || params.metadata.urgency === 'high') {
      return false;
    }

    // Don't batch for highly active users
    if (userPattern.responseRate > 0.8) {
      return false;
    }

    // Batch low priority notifications for less active users
    return params.metadata.urgency === 'low' || userPattern.responseRate < 0.5;
  }

  private determineDeliveryChannel(
    params: SmartNotificationRequest,
    userPattern: UserNotificationPattern,
    relevanceScore: number
  ): 'realtime' | 'email' | 'both' | 'none' {
    // Don't send if relevance is too low
    if (relevanceScore < 30) {
      return 'none';
    }

    // High relevance and urgency - use both channels
    if (relevanceScore > 80 && params.metadata.urgency === 'critical') {
      return 'both';
    }

    // User is online - use real-time
    if (userPattern.deviceInfo?.isOnline) {
      return 'realtime';
    }

    // User is offline but high relevance - use email
    if (relevanceScore > 60) {
      return 'email';
    }

    // Default to real-time for moderate relevance
    return 'realtime';
  }

  async deliverNotification(
    params: SmartNotificationRequest,
    intelligence: NotificationIntelligence
  ): Promise<void> {
    // Create notification entity
    const notification = {
      PK: `USER#${params.userId}`,
      SK: `NOTIFICATION#${generateUUID()}`,
      GSI1PK: `NOTIFICATION#${params.type}`,
      GSI1SK: new Date().toISOString(),
      notificationId: generateUUID(),
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      actionUrl: params.actionUrl,
      actionText: params.actionText,
      priority: params.metadata.urgency || 'medium',
      isRead: false,
      createdAt: new Date().toISOString(),
      metadata: params.metadata,
    };

    // Save to database
    await dynamodb.put(notification);

    // Send via appropriate channels
    if (intelligence.deliveryChannel === 'realtime' || intelligence.deliveryChannel === 'both') {
      await this.sendWebSocketNotification(params.userId, notification);
    }

    if (intelligence.deliveryChannel === 'email' || intelligence.deliveryChannel === 'both') {
      await this.sendEmailNotification(params.userId, notification);
    }
  }

  private async sendWebSocketNotification(userId: string, notification: any): Promise<void> {
    try {
      // Send via existing WebSocket infrastructure
      await this.webSocketService.sendToUser(userId, {
        type: 'notification',
        data: notification,
      });
    } catch (error) {
      console.error('WebSocket notification failed:', error);
    }
  }

  // Integration methods for all modules
  async notifyTeamInvitation(
    teamId: string,
    invitedUserId: string,
    inviterName: string
  ): Promise<void> {
    await this.sendSmartNotification({
      userId: invitedUserId,
      type: 'team_invitation',
      title: 'Team Invitation Received',
      message: `${inviterName} invited you to join their team`,
      actionUrl: `/teams/${teamId}`,
      actionText: 'View Team',
      metadata: {
        sourceId: teamId,
        sourceType: 'team',
        actorId: inviterName,
        actorName: inviterName,
        urgency: 'high',
      },
    });
  }

  async notifyIdeaVoteMilestone(
    ideaId: string,
    creatorId: string,
    voteCount: number
  ): Promise<void> {
    const milestones = [5, 10, 25, 50, 100];
    if (milestones.includes(voteCount)) {
      await this.sendSmartNotification({
        userId: creatorId,
        type: 'idea_vote',
        title: `🎉 ${voteCount} Votes Milestone!`,
        message: `Your idea has reached ${voteCount} votes from the community`,
        actionUrl: `/ideas/${ideaId}`,
        actionText: 'View Idea',
        metadata: {
          sourceId: ideaId,
          sourceType: 'idea',
          urgency: 'medium',
          category: 'milestone',
        },
      });
    }
  }

  async notifyJudgeScore(
    ideaId: string,
    creatorId: string,
    score: number,
    judgeName: string
  ): Promise<void> {
    await this.sendSmartNotification({
      userId: creatorId,
      type: 'judge_score',
      title: 'Judge Feedback Received',
      message: `${judgeName} scored your idea ${score}/10 with detailed feedback`,
      actionUrl: `/ideas/${ideaId}/scores`,
      actionText: 'View Feedback',
      metadata: {
        sourceId: ideaId,
        sourceType: 'judge_score',
        actorName: judgeName,
        urgency: 'high',
      },
    });
  }
}

export const notificationService = new NotificationService();
```

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** Read `guidelines/project-architecture.md` and review all previous module implementations.

### Step 1: Backend Implementation (Extends WebSocket)

**File Structure:**

```
backend/src/modules/notifications/ (new module)
├── handlers/
│   ├── getNotifications.ts
│   ├── markAsRead.ts
│   ├── markAllAsRead.ts
│   ├── getNotificationSettings.ts
│   ├── updateNotificationSettings.ts
│   └── sendNotification.ts
├── functions/
│   ├── getNotifications.yml
│   ├── markAsRead.yml
│   ├── markAllAsRead.yml
│   ├── getNotificationSettings.yml
│   ├── updateNotificationSettings.yml
│   └── sendNotification.yml
├── services/
│   └── NotificationService.ts
└── types.ts

backend/src/modules/websocket/ (extend existing)
└── Add notification broadcasting to existing handlers
```

### Step 2: Frontend Implementation (Global Integration)

**File Structure:**

```
client/src/
├── components/notifications/
│   ├── SmartNotificationCenter.tsx
│   ├── NotificationItem.tsx
│   ├── NotificationBell.tsx
│   ├── NotificationSettings.tsx
│   ├── ToastNotification.tsx
│   └── NotificationList.tsx
├── pages/notifications/
│   ├── NotificationsPage.tsx
│   └── NotificationSettingsPage.tsx
├── hooks/
│   ├── useNotifications.ts
│   └── useWebSocketNotifications.ts
├── services/
│   └── notificationsApi.ts
└── Update all existing pages with notification integration
```

### Step 3: Integration with All Modules

- [ ] **F01 Integration:** Add notifications for idea votes, comments, and judge scores
- [ ] **F03 Integration:** Add notifications for team invitations, joins, and updates
- [ ] **M05 Integration:** Add notifications for vote milestones and engagement
- [ ] **M08 Integration:** Add notifications for judge feedback and scores
- [ ] **WebSocket Enhancement:** Extend existing WebSocket for real-time notifications
- [ ] **Global UI Integration:** Add notification bell to main navigation

## Acceptance Criteria

- [ ] Real-time notifications deliver instantly via WebSocket connections
- [ ] Smart notification intelligence reduces noise while highlighting important updates
- [ ] Notification center provides comprehensive history with filtering and search
- [ ] User preferences allow granular control over notification types and channels
- [ ] Integration with all modules triggers appropriate notifications automatically
- [ ] Notification batching groups related updates to reduce overwhelm
- [ ] **Demo Ready:** Can receive and manage notifications across all features in real-time
- [ ] **Cross-Module Integration:** All modules trigger relevant notifications
- [ ] **Mobile Responsive:** Notification center and settings work perfectly on mobile

## Testing Checklist

- [ ] **Manual API Testing:**
  - Notifications are created and delivered correctly
  - WebSocket notifications arrive in real-time
  - Notification settings update properly
  - Smart intelligence filters notifications appropriately
  - All module integrations trigger notifications

- [ ] **Frontend Testing:**
  - Notification bell shows correct unread count
  - Real-time notifications appear as toasts
  - Notification center displays and filters correctly
  - Settings interface allows preference management
  - WebSocket connection handles reconnection properly

- [ ] **Integration:** All modules successfully trigger appropriate notifications
- [ ] **Real-time Performance:** WebSocket notifications deliver within 1 second
- [ ] **Intelligence Accuracy:** Smart filtering reduces noise while preserving important notifications

## Deployment Checklist

- [ ] **CRITICAL - Type Check:** Run `bun run typecheck` in both backend and client
- [ ] **Serverless Config:** Add notification function imports to serverless.yml
- [ ] **WebSocket Integration:** Ensure WebSocket module supports notification broadcasting
- [ ] **Module Integration:** Verify all modules can trigger notifications
- [ ] **Manual Testing:** Test complete notification workflow across all features
- [ ] **Performance Testing:** Verify WebSocket performance under notification load
