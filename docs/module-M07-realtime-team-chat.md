# Module M07: Real-time Team Chat

## Overview

**Estimated Time:** 1.5hr

**Complexity:** Complex

**Type:** Full-stack

**Risk Level:** Medium

**Dependencies:** F03 (Team Formation & Matching)

## Problem Context

Once teams are formed, members need to communicate and collaborate in real-time before and during the hackathon. This module leverages the existing WebSocket infrastructure to provide team-specific chat rooms, file sharing, and collaborative planning tools.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler File:** Create `handlers/createChatRoom.ts` for team chat creation
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'teams', 'create')`

- [ ] **Handler File:** Create `handlers/getChatHistory.ts` for message history
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'teams', 'read')`

- [ ] **WebSocket Handler:** Extend existing WebSocket handlers for team chat
  - Use existing WebSocket infrastructure from `backend/src/modules/websocket/`
  - Add team-specific message routing and permissions

- [ ] **Function Config:** Create corresponding `.yml` files in `functions/` directory

- [ ] **Service Layer:** Business logic in `services/TeamChatService.ts`
  - **MANDATORY AI Integration:** AI-powered chat features and moderation

- [ ] **AI Features Implementation:**
  - `moderateMessage()` - AI-powered content moderation
  - `generateMeetingSummary()` - AI summary of chat discussions
  - `suggestNextSteps()` - AI recommendations based on chat content
  - `translateMessage()` - AI-powered real-time translation

### Frontend Tasks

- [ ] **Pages/Components:**
  - `TeamChatRoom.tsx` - Main chat interface with message history
  - `MessageBubble.tsx` - Individual message display component
  - `MessageInput.tsx` - Rich message input with file upload
  - `ChatSidebar.tsx` - Team members and chat settings
  - `FileSharing.tsx` - File upload and sharing interface
  - `MeetingNotes.tsx` - Collaborative meeting notes with AI summaries

- [ ] **WebSocket Integration:**
  - Extend existing `useWebSocket` hook for team-specific channels
  - Real-time message delivery and typing indicators
  - Online/offline status for team members

- [ ] **AI Features:**
  - Message moderation with AI warnings
  - Auto-generated meeting summaries
  - Smart suggestions for next steps
  - Real-time translation for international teams

### Database Schema Extensions

```
pk: TEAM#[teamId] | sk: CHAT_ROOM | gsi1pk: TEAM#[teamId] | gsi1sk: CHAT_ROOM
- teamId: string
- roomId: string (WebSocket room identifier)
- createdAt: string (ISO timestamp)
- settings: ChatSettings (notifications, moderation, etc.)
- participants: string[] (team member user IDs)
- isActive: boolean

pk: CHAT#[roomId] | sk: MESSAGE#[timestamp] | gsi1pk: USER#[userId] | gsi1sk: SENT#[timestamp]
- roomId: string
- messageId: string (unique message ID)
- userId: string (sender user ID)
- userName: string (sender display name)
- content: string (message content)
- messageType: string (text, file, system, ai_summary)
- fileUrl: string (optional, for file messages)
- fileName: string (optional, for file messages)
- replyTo: string (optional, message ID being replied to)
- reactions: Reaction[] (message reactions)
- isModerated: boolean (AI moderation flag)
- moderationReason: string (optional, if moderated)
- timestamp: string (ISO timestamp)
- editedAt: string (optional, if edited)

pk: CHAT#[roomId] | sk: SUMMARY#[date] | gsi1pk: TEAM#[teamId] | gsi1sk: SUMMARY#[date]
- roomId: string
- teamId: string
- date: string (YYYY-MM-DD)
- summary: string (AI-generated summary)
- keyDecisions: string[] (important decisions made)
- actionItems: ActionItem[] (tasks and assignments)
- participants: string[] (active participants)
- messageCount: number (total messages that day)
- generatedAt: string (ISO timestamp)
```

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** You MUST read `guidelines/project-architecture.md` COMPLETELY before writing any code.

**Pay special attention to the existing WebSocket infrastructure in `backend/src/modules/websocket/`**

### Step 1: Backend Implementation (Extend WebSocket)

**File Structure:**

```
backend/src/modules/teams/
├── handlers/
│   ├── createChatRoom.ts    # POST /api/teams/:id/chat
│   ├── getChatHistory.ts    # GET /api/teams/:id/chat/history
│   └── uploadChatFile.ts    # POST /api/teams/:id/chat/upload
├── functions/
│   ├── createChatRoom.yml
│   ├── getChatHistory.yml
│   └── uploadChatFile.yml
├── services/
│   └── TeamChatService.ts   # Chat business logic
└── websocket/
    ├── teamChatHandler.ts   # WebSocket message handlers
    └── chatModeration.ts    # AI moderation logic
```

**Service Layer Implementation:**

```typescript
// services/TeamChatService.ts
import { geminiClient } from '../../../shared/clients/gemini';
import { dynamodb } from '../../../shared/clients/dynamodb';
import { s3 } from '../../../shared/clients/s3';

export class TeamChatService {
  async createChatRoom(teamId: string, createdBy: string): Promise<ChatRoom> {
    const roomId = `team_${teamId}_${Date.now()}`;

    const chatRoom = {
      teamId,
      roomId,
      createdAt: new Date().toISOString(),
      settings: {
        moderationEnabled: true,
        fileUploadsEnabled: true,
        translationEnabled: true,
      },
      participants: [],
      isActive: true,
    };

    await dynamodb.put({
      PK: `TEAM#${teamId}`,
      SK: 'CHAT_ROOM',
      GSI1PK: `TEAM#${teamId}`,
      GSI1SK: 'CHAT_ROOM',
      ...chatRoom,
    });

    return chatRoom;
  }

  async sendMessage(
    roomId: string,
    userId: string,
    content: string,
    messageType: string = 'text'
  ): Promise<Message> {
    // Check for AI moderation
    const moderationResult = await this.moderateMessage(content);

    const message = {
      roomId,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userName: await this.getUserName(userId),
      content: moderationResult.isClean ? content : '[Message moderated]',
      messageType,
      timestamp: new Date().toISOString(),
      isModerated: !moderationResult.isClean,
      moderationReason: moderationResult.reason,
      reactions: [],
    };

    await dynamodb.put({
      PK: `CHAT#${roomId}`,
      SK: `MESSAGE#${message.timestamp}`,
      GSI1PK: `USER#${userId}`,
      GSI1SK: `SENT#${message.timestamp}`,
      ...message,
    });

    return message;
  }

  // MANDATORY: AI-powered message moderation
  async moderateMessage(content: string): Promise<ModerationResult> {
    const prompt = `Analyze this hackathon team chat message for inappropriate content:
    
    Message: "${content}"
    
    Check for:
    1. Harassment or bullying
    2. Spam or promotional content
    3. Offensive language
    4. Off-topic discussions that might distract from hackathon goals
    
    Return whether the message is clean and if not, provide a brief reason.`;

    const response = await geminiClient.generateJSON({
      prompt,
      schema: {
        type: 'object',
        properties: {
          isClean: { type: 'boolean' },
          reason: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
        },
      },
    });

    return response;
  }

  // MANDATORY: AI-powered meeting summary
  async generateMeetingSummary(roomId: string, date: string): Promise<MeetingSummary> {
    const messages = await this.getChatHistory(roomId, date);

    const prompt = `Summarize this hackathon team chat discussion:
    
    Messages: ${JSON.stringify(
      messages.map((m) => ({
        user: m.userName,
        message: m.content,
        time: m.timestamp,
      }))
    )}
    
    Provide:
    1. Brief summary of main discussion points
    2. Key decisions made
    3. Action items and task assignments
    4. Important links or resources shared
    5. Next steps for the team
    
    Focus on actionable items and important decisions.`;

    const response = await geminiClient.generateJSON({
      prompt,
      schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          keyDecisions: { type: 'array', items: { type: 'string' } },
          actionItems: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                task: { type: 'string' },
                assignee: { type: 'string' },
                deadline: { type: 'string' },
              },
            },
          },
          nextSteps: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    // Save summary to database
    await dynamodb.put({
      PK: `CHAT#${roomId}`,
      SK: `SUMMARY#${date}`,
      GSI1PK: `TEAM#${await this.getTeamIdFromRoom(roomId)}`,
      GSI1SK: `SUMMARY#${date}`,
      ...response,
      generatedAt: new Date().toISOString(),
    });

    return response;
  }

  // MANDATORY: AI-powered next steps suggestions
  async suggestNextSteps(roomId: string): Promise<string[]> {
    const recentMessages = await this.getRecentMessages(roomId, 50);

    const prompt = `Based on this hackathon team's recent chat, suggest 3-5 specific next steps:
    
    Recent Discussion: ${JSON.stringify(
      recentMessages.map((m) => ({
        user: m.userName,
        message: m.content,
      }))
    )}
    
    Consider:
    1. Current project status and blockers
    2. Skill gaps that need addressing
    3. Technical decisions that need to be made
    4. Tasks that should be prioritized
    5. Collaboration improvements
    
    Provide specific, actionable suggestions.`;

    const response = await geminiClient.generateJSON({
      prompt,
      schema: {
        type: 'object',
        properties: {
          suggestions: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return response.suggestions;
  }

  async uploadFile(
    roomId: string,
    userId: string,
    file: Buffer,
    fileName: string
  ): Promise<string> {
    const fileKey = `chat/${roomId}/${Date.now()}_${fileName}`;
    await s3.putBuffer(fileKey, file);

    const fileUrl = await s3.getDownloadUrl(fileKey, { expiresIn: 86400 }); // 24 hours

    // Send file message
    await this.sendMessage(roomId, userId, fileUrl, 'file');

    return fileUrl;
  }

  async getChatHistory(roomId: string, date?: string): Promise<Message[]> {
    // Retrieve chat history with pagination
  }
}
```

**WebSocket Handler Extension:**

```typescript
// websocket/teamChatHandler.ts
import { TeamChatService } from '../services/TeamChatService';

const teamChatService = new TeamChatService();

export const handleTeamChatMessage = async (connectionId: string, message: any) => {
  const { action, roomId, content, userId } = message;

  switch (action) {
    case 'join_room':
      await joinChatRoom(connectionId, roomId, userId);
      break;

    case 'send_message':
      const newMessage = await teamChatService.sendMessage(roomId, userId, content);
      await broadcastToRoom(roomId, {
        type: 'new_message',
        message: newMessage,
      });
      break;

    case 'typing':
      await broadcastToRoom(
        roomId,
        {
          type: 'typing',
          userId,
          isTyping: message.isTyping,
        },
        connectionId
      ); // Exclude sender
      break;

    case 'request_summary':
      const summary = await teamChatService.generateMeetingSummary(roomId, message.date);
      await sendToConnection(connectionId, {
        type: 'meeting_summary',
        summary,
      });
      break;
  }
};
```

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── components/chat/
│   ├── TeamChatRoom.tsx     # Main chat interface
│   ├── MessageBubble.tsx    # Individual message display
│   ├── MessageInput.tsx     # Rich message input
│   ├── ChatSidebar.tsx      # Team members sidebar
│   ├── FileSharing.tsx      # File upload interface
│   ├── MeetingNotes.tsx     # AI-generated summaries
│   └── TypingIndicator.tsx  # Typing indicator
├── hooks/
│   ├── useTeamChat.ts       # Team chat WebSocket hook
│   └── useChatHistory.ts    # Chat history management
└── types/
    └── chat.ts              # Chat-specific types
```

**Main Chat Component:**

```typescript
// components/chat/TeamChatRoom.tsx
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { ChatSidebar } from './ChatSidebar';
import { MeetingNotes } from './MeetingNotes';
import { useTeamChat } from '@/hooks/useTeamChat';
import { Users, FileText, Settings } from 'lucide-react';

interface TeamChatRoomProps {
  teamId: string;
  userId: string;
}

export const TeamChatRoom = ({ teamId, userId }: TeamChatRoomProps) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'notes' | 'files'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    onlineMembers,
    typingUsers,
    sendMessage,
    uploadFile,
    requestSummary,
    isConnected
  } = useTeamChat(teamId, userId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Chat
              {!isConnected && (
                <Badge variant="destructive" className="ml-2">
                  Disconnected
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'chat' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('chat')}
              >
                Chat
              </Button>
              <Button
                variant={activeTab === 'notes' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('notes')}
              >
                <FileText className="w-4 h-4 mr-1" />
                Notes
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {activeTab === 'chat' ? (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.messageId}
                    message={message}
                    isOwn={message.userId === userId}
                  />
                ))}
                {typingUsers.length > 0 && (
                  <div className="text-sm text-gray-500 italic">
                    {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t p-4">
                <MessageInput
                  onSendMessage={sendMessage}
                  onUploadFile={uploadFile}
                  disabled={!isConnected}
                />
              </div>
            </>
          ) : (
            <MeetingNotes
              teamId={teamId}
              onRequestSummary={requestSummary}
            />
          )}
        </CardContent>
      </div>

      {/* Sidebar */}
      <ChatSidebar
        teamId={teamId}
        onlineMembers={onlineMembers}
        className="w-64 border-l"
      />
    </div>
  );
};
```

**Message Input Component:**

```typescript
// components/chat/MessageInput.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Smile } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onUploadFile: (file: File) => void;
  disabled?: boolean;
}

export const MessageInput = ({ onSendMessage, onUploadFile, disabled }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadFile(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1 relative">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
          disabled={disabled}
          rows={2}
          className="resize-none pr-20"
        />
        <div className="absolute right-2 top-2 flex gap-1">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={disabled}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <Button type="submit" disabled={!message.trim() || disabled}>
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
};
```

### Step 3: WebSocket Hook Extension

```typescript
// hooks/useTeamChat.ts
import { useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';

export const useTeamChat = (teamId: string, userId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineMembers, setOnlineMembers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const { sendMessage: sendWsMessage, isConnected } = useWebSocket();

  useEffect(() => {
    // Join team chat room
    sendWsMessage({
      action: 'join_room',
      roomId: `team_${teamId}`,
      userId,
    });

    // Load chat history
    loadChatHistory();
  }, [teamId, userId]);

  const sendMessage = (content: string) => {
    sendWsMessage({
      action: 'send_message',
      roomId: `team_${teamId}`,
      content,
      userId,
    });
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`/api/teams/${teamId}/chat/upload`, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const { fileUrl } = await response.json();
      sendMessage(`📎 ${file.name}: ${fileUrl}`);
    }
  };

  const requestSummary = (date: string) => {
    sendWsMessage({
      action: 'request_summary',
      roomId: `team_${teamId}`,
      date,
    });
  };

  return {
    messages,
    onlineMembers,
    typingUsers,
    sendMessage,
    uploadFile,
    requestSummary,
    isConnected,
  };
};
```

## Acceptance Criteria

- [ ] Real-time team chat with message history
- [ ] File sharing with support for common file types
- [ ] Online/offline status and typing indicators
- [ ] **AI Feature Working:** Message moderation, meeting summaries, and next steps suggestions
- [ ] **Demo Ready:** Can demonstrate team collaboration in real-time in 30 seconds
- [ ] **WebSocket Integration:** Leverages existing WebSocket infrastructure
- [ ] **Mobile Responsive:** Chat works well on mobile devices
- [ ] **Performance:** Handles multiple concurrent team chats

## Related Modules

- **Depends On:** F03 (Team Formation & Matching)
- **Leverages:** Existing WebSocket infrastructure
- **Enables:** M11 (Cross-Platform Integration), M13 (Real-time Dashboard)
- **Conflicts With:** None
