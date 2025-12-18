# Module F03: Live Session Management

## Overview

**Estimated Time:** 1 hour  
**Complexity:** Medium (WebSocket real-time communication)  
**Type:** Full-stack  
**Risk Level:** Medium (real-time complexity)  
**Dependencies:** None (Foundation module - uses existing WebSocket infrastructure)

## Problem Context

Teachers need to conduct live classes with real-time communication. Students need to join live sessions, participate in chat, and receive updates. For low-bandwidth environments, prioritize text-based chat and audio over video streaming. This module provides the core real-time session infrastructure.

## Technical Requirements

### Backend Tasks

- [ ] **Handler: createSession.ts** - POST /api/sessions
  - Body: `{ classId, title, scheduledAt, type }`
  - Creates live session record in DynamoDB
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbac`
  - Only teachers can create sessions
  - **CRITICAL:** Use `dynamodb` wrapper from `shared/clients/dynamodb`

- [ ] **Handler: listSessions.ts** - GET /api/sessions
  - Query: `classId`, `status`, `limit`
  - Teachers see their sessions, students see enrolled class sessions
  - Filter by status: upcoming, live, ended

- [ ] **Handler: getSession.ts** - GET /api/sessions/:sessionId
  - Fetch session details with participant count
  - Include WebSocket connection URL for joining

- [ ] **Handler: startSession.ts** - POST /api/sessions/:sessionId/start
  - Teacher-only endpoint to start session
  - Update status to 'live'
  - Notify all enrolled students via WebSocket or SES

- [ ] **Handler: endSession.ts** - POST /api/sessions/:sessionId/end
  - Teacher ends session
  - Update status to 'ended'
  - Save session analytics (duration, participant count)

- [ ] **WebSocket Handler: connect.ts** - $connect route
  - Student/Teacher connects to live session
  - Store connectionId in DynamoDB
  - Send welcome message
  - Use existing `withWebSocketRbac` middleware

- [ ] **WebSocket Handler: disconnect.ts** - $disconnect route
  - Clean up connection record
  - Decrement participant count
  - Use existing WebSocket infrastructure from template

- [ ] **WebSocket Handler: sendMessage.ts** - sendMessage action
  - Broadcast chat message to all participants
  - Body: `{ sessionId, message, messageType }`
  - Message types: chat, question, answer, poll
  - Use `@aws-sdk/client-apigatewaymanagementapi` for broadcasting

- [ ] **WebSocket Handler: raiseHand.ts** - raiseHand action
  - Student raises hand for question
  - Notify teacher via WebSocket

- [ ] **Function Configs** - YAML files
  - HTTP API: `createSession.yml`, `listSessions.yml`, `getSession.yml`, `startSession.yml`, `endSession.yml`
  - WebSocket API: `connect.yml`, `disconnect.yml`, `sendMessage.yml`, `raiseHand.yml`
  - Use `clerkJwtAuthorizer` for HTTP, token in query string for WebSocket

- [ ] **Service Layer: SessionService.ts**
  - `createSession(classId, data)` - Validate and create session
  - `startSession(sessionId, teacherId)` - Start live session
  - `endSession(sessionId)` - End and save analytics
  - `listSessions(filters)` - Query sessions by status/class
  - `joinSession(sessionId, userId)` - Add participant record
  - `broadcastMessage(sessionId, message)` - WebSocket broadcast
  - `getActiveConnections(sessionId)` - Query DynamoDB for connectionIds

- [ ] **Type Definitions: types.ts**

  ```typescript
  export interface Session {
    sessionId: string;
    classId: string;
    className: string;
    teacherId: string;
    teacherName: string;
    title: string;
    description?: string;
    type: 'lecture' | 'discussion' | 'quiz' | 'demo';
    scheduledAt: string;
    startedAt?: string;
    endedAt?: string;
    duration?: number; // minutes
    status: 'scheduled' | 'live' | 'ended' | 'cancelled';
    participantCount: number;
    maxParticipants?: number;
    recordingUrl?: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface SessionParticipant {
    sessionId: string;
    userId: string;
    userName: string;
    role: 'teacher' | 'student';
    connectionId: string;
    joinedAt: string;
    lastSeenAt: string;
    isHandRaised: boolean;
  }

  export interface ChatMessage {
    messageId: string;
    sessionId: string;
    userId: string;
    userName: string;
    message: string;
    messageType: 'chat' | 'question' | 'answer' | 'system';
    timestamp: string;
  }

  export interface CreateSessionRequest {
    classId: string;
    title: string;
    description?: string;
    type: Session['type'];
    scheduledAt: string;
    duration?: number;
    maxParticipants?: number;
  }
  ```

- [ ] **RBAC Configuration:**
  - Add `'sessions'` to `ALL_MODULES`
  - Teachers: createAny, readOwn, updateOwn, deleteOwn
  - Students: readAny (can join sessions)
  - WebSocket: All authenticated users can connect

- [ ] **WebSocket Connection Management:**
  - Use existing WebSocket API infrastructure from template
  - Connection URL: `wss://${apiId}.execute-api.${region}.amazonaws.com/${stage}`
  - Authentication: `?token=<clerk-jwt>` in connection URL
  - Store connections in DynamoDB with TTL (auto-cleanup)

### Frontend Tasks

- [ ] **Page: LiveSessionsPage.tsx** - `/sessions`
  - List of scheduled and live sessions
  - "Start Session" button for teachers
  - "Join Session" button for students
  - Session status badges (scheduled/live/ended)

- [ ] **Component: SessionList.tsx**
  - Table/cards showing sessions
  - Filter by status, class, date
  - Click to view details or join

- [ ] **Component: SessionForm.tsx** - Create session modal
  - Form fields: Title, Description, Class, Type, Scheduled time, Duration
  - Submit creates session and optionally starts immediately

- [ ] **Component: LiveSessionRoom.tsx** - Main live session interface
  - Split layout: Video/content area + chat sidebar
  - Participant list showing online users
  - Raised hands indicator
  - Teacher controls (start, end, mute, etc.)

- [ ] **Component: ChatBox.tsx** - Real-time chat
  - WebSocket connection to session
  - Message list with auto-scroll
  - Send message input
  - Message types: regular chat, questions, answers
  - "Raise Hand" button for students

- [ ] **Component: ParticipantList.tsx** - Live participant sidebar
  - List of connected users
  - Online status indicators
  - Raised hands highlighted
  - Participant count badge

- [ ] **Hooks: useWebSocket.ts** - WebSocket connection management
  - Connect to WebSocket URL
  - Handle connect/disconnect/message events
  - Send messages via WebSocket
  - Reconnect on disconnect
  - Can extend existing `useWebSocket` hook from template

- [ ] **Hooks: useLiveSession.ts** - Session state management
  - Join session on mount
  - Leave session on unmount
  - Track connection status
  - Handle incoming messages

- [ ] **shadcn Components:**
  - `button`, `form`, `input`, `card`, `badge`, `avatar`, `separator`, `scroll-area`, `toast`

- [ ] **API Integration: services/sessionsApi.ts**
  - `createSession(data)` - POST /api/sessions
  - `listSessions(filters)` - GET /api/sessions
  - `getSessionDetails(sessionId)` - GET /api/sessions/:sessionId
  - `startSession(sessionId)` - POST /api/sessions/:sessionId/start
  - `endSession(sessionId)` - POST /api/sessions/:sessionId/end
  - `connectToSession(sessionId, token)` - WebSocket connection
  - `sendMessage(message)` - Via WebSocket

- [ ] **Routing:**
  - `/sessions` → List of sessions
  - `/sessions/:sessionId` → Session details
  - `/sessions/:sessionId/live` → Live session room

### Database Schema (DynamoDB Single Table)

```
# Session Metadata
PK: SESSION#<sessionId>
SK: METADATA
classId: string
className: string
teacherId: string
teacherName: string
title: string
type: string
scheduledAt: string
startedAt: string
endedAt: string
status: string
participantCount: number
createdAt: string
GSI1PK: CLASS#<classId>
GSI1SK: SESSION#<scheduledAt>
GSI2PK: STATUS#<status>
GSI2SK: SESSION#<scheduledAt>

# Active Connection (WebSocket)
PK: SESSION#<sessionId>
SK: CONNECTION#<connectionId>
userId: string
userName: string
role: string
joinedAt: string
lastSeenAt: string
isHandRaised: boolean
TTL: timestamp + 3600 (auto-cleanup)

# Chat Message
PK: SESSION#<sessionId>
SK: MESSAGE#<timestamp>#<messageId>
userId: string
userName: string
message: string
messageType: string
timestamp: string

# Access Patterns:
1. List sessions by class → Query GSI1PK = CLASS#<classId>
2. List live sessions → Query GSI2PK = STATUS#live
3. Get active connections → Query PK = SESSION#<sessionId>, SK begins_with CONNECTION#
4. Get chat history → Query PK = SESSION#<sessionId>, SK begins_with MESSAGE#
```

## External Services

### AWS WebSocket API (Already Configured)

- **Purpose:** Real-time bidirectional communication
- **Setup:** Already configured in template (`backend/src/modules/websocket/`)
- **Library:** `@aws-sdk/client-apigatewaymanagementapi`
- **Code Pattern:**

  ```typescript
  import {
    ApiGatewayManagementApiClient,
    PostToConnectionCommand,
  } from '@aws-sdk/client-apigatewaymanagementapi';

  const apiGwClient = new ApiGatewayManagementApiClient({
    endpoint: `https://${apiId}.execute-api.${region}.amazonaws.com/${stage}`,
  });

  await apiGwClient.send(
    new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: JSON.stringify({ type: 'message', data: message }),
    })
  );
  ```

## Implementation Guide

### Step 0: Study Existing WebSocket Module

**CRITICAL:** Study existing WebSocket implementation before starting!

```bash
# Review existing WebSocket handlers
cat backend/src/modules/websocket/handlers/connect.ts
cat backend/src/modules/websocket/handlers/sendMessage.ts
cat client/src/hooks/useWebSocket.ts
```

### Step 1: Backend Implementation

**File Structure:**

```
backend/src/modules/sessions/
├── handlers/
│   ├── createSession.ts
│   ├── listSessions.ts
│   ├── getSession.ts
│   ├── startSession.ts
│   ├── endSession.ts
│   └── websocket/
│       ├── connect.ts
│       ├── disconnect.ts
│       ├── sendMessage.ts
│       └── raiseHand.ts
├── functions/
│   └── [YAML configs]
├── services/
│   └── SessionService.ts
└── types.ts
```

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── components/sessions/
│   ├── SessionList.tsx
│   ├── SessionForm.tsx
│   ├── LiveSessionRoom.tsx
│   ├── ChatBox.tsx
│   └── ParticipantList.tsx
├── pages/sessions/
│   ├── LiveSessionsPage.tsx
│   └── SessionRoomPage.tsx
├── hooks/
│   ├── useLiveSession.ts
│   └── useWebSocket.ts (extend existing)
└── services/
    └── sessionsApi.ts
```

### Step 3: Integration

- [ ] Test WebSocket connection from browser console
- [ ] Verify messages broadcast to all connected clients
- [ ] Test disconnect cleanup
- [ ] Test on mobile browser

## Acceptance Criteria

- [ ] **Teacher can create scheduled session** with date/time
- [ ] **Teacher can start session** - status changes to 'live'
- [ ] **Student can join live session** - WebSocket connects
- [ ] **Chat messages delivered in real-time** to all participants
- [ ] **Student can raise hand** - teacher sees notification
- [ ] **Participant count updates** as users join/leave
- [ ] **Connection auto-cleanup** when user disconnects
- [ ] **Session ends gracefully** - all connections closed
- [ ] **Chat history persists** in DynamoDB
- [ ] **Demo Ready:** Create session → Start → Join → Chat → End in 30 seconds
- [ ] **Mobile Responsive:** Live session UI works on smartphones

## Testing Checklist

- [ ] **WebSocket Testing:**
  - Connect with valid token → Connected
  - Send message → Broadcasts to all
  - Disconnect → Cleanup successful
  - Reconnect after disconnect → Works
  - Invalid token → Connection refused

- [ ] **Frontend Testing:**
  - Multiple browser tabs can join same session
  - Messages appear in all connected clients
  - Raised hand shows in teacher view
  - Auto-scroll to latest messages

- [ ] **Edge Cases:**
  - Session at max capacity → Reject new joins
  - Teacher disconnects → Session auto-ends after timeout
  - Network interruption → Auto-reconnect

## Troubleshooting Guide

1. **WebSocket won't connect**
   - Check token passed in query string: `?token=<jwt>`
   - Verify WebSocket URL format
   - Check WebSocket route in serverless.yml

2. **Messages not broadcasting**
   - Verify ApiGatewayManagementApi endpoint URL
   - Check connectionId still valid (not stale)
   - Test with direct API Gateway test console

3. **Connections not cleaning up**
   - Check DynamoDB TTL enabled
   - Verify disconnect handler runs
   - Monitor CloudWatch logs for errors

## Related Modules

- **Depends On:** None (uses existing WebSocket infrastructure)
- **Enables:**
  - M06 - Interactive Learning Tools (whiteboard, polls in live session)
  - F01 - Class Management (sessions tied to classes)
- **Conflicts With:** None
