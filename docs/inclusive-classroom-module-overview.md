# Inclusive Virtual Classroom - Module Overview

## Module List

| Module ID | Name                                           | Time Est. | Complexity | Type           | Dependencies | Risk       |
| --------- | ---------------------------------------------- | --------- | ---------- | -------------- | ------------ | ---------- |
| **F01**   | **Class Management System**                    | **1hr**   | **Medium** | **Full-stack** | **None**     | **Low**    |
| **F02**   | **Content Library & Upload**                   | **1hr**   | **Medium** | **Full-stack** | **None**     | **Low**    |
| **F03**   | **Live Session Management**                    | **1hr**   | **Medium** | **Full-stack** | **None**     | **Medium** |
| **F04**   | **User Dashboard (Multi-Role)**                | **1hr**   | **Medium** | **Full-stack** | **None**     | **Low**    |
| M05       | Attendance & Performance Tracking              | 1hr       | Medium     | Full-stack     | F01          | Low        |
| M06       | Interactive Learning Tools (Whiteboard, Polls) | 1.5hr     | Complex    | Full-stack     | F03          | Medium     |
| M07       | Multilingual Support & Translation             | 1hr       | Medium     | Full-stack     | F02          | Medium     |
| M08       | Gamification System (Badges, Leaderboards)     | 1hr       | Medium     | Full-stack     | M05          | Low        |
| M09       | Parent Monitoring & Notifications              | 45min     | Simple     | Full-stack     | M05          | Low        |
| M10       | Community Content Review System                | 1hr       | Medium     | Full-stack     | F02          | Low        |
| M11       | Video Adaptive Streaming                       | 1.5hr     | Complex    | Backend-heavy  | F02          | High       |
| M12       | Digital Literacy Onboarding                    | 45min     | Simple     | Frontend-heavy | F04          | Low        |

**Total Estimated Time:** ~13 hours of development across 4 developers = ~3.25 hours per developer (leaving ample buffer for integration and polish)

## Dependency Graph

### Foundation Phase (No Dependencies - Hours 0-4)

```
F01 (Class Management)     ──┐
F02 (Content Library)      ──┤ PARALLEL START
F03 (Live Sessions)        ──┤ (All 4 devs work simultaneously)
F04 (User Dashboards)      ──┘
```

### Core Features Phase (Hours 4-12)

```
F01 ──> M05 (Attendance & Analytics)
F02 ──> M07 (Multilingual Support)
        M10 (Content Review)
F03 ──> M06 (Interactive Tools)
F04 ──> M12 (Onboarding)

M05 ──> M08 (Gamification)
        M09 (Parent Monitoring)
```

### Advanced Features Phase (Hours 12-20)

```
F02 + M07 ──> M11 (Adaptive Video Streaming)
All modules ──> Integration, Testing, Polish
```

## Critical Path Timeline

### Hours 0-4: Foundation Phase (PARALLEL WORK)

**All 4 developers start simultaneously - NO dependencies**

- **Dev 1:** F01 - Class Management System (CRUD for classes, scheduling)
- **Dev 2:** F02 - Content Library & Upload (S3 upload, listing, categories)
- **Dev 3:** F03 - Live Session Management (WebSocket setup, room creation)
- **Dev 4:** F04 - User Dashboard (Role-based dashboards for all 4 roles)

**Deliverable at Hour 4:** 4 working modules, each demo-ready with frontend + backend + database

### Hours 4-12: Core Features

**Build on foundation, some parallelization possible**

- **Dev 1:** M05 - Attendance & Performance Tracking → M08 - Gamification
- **Dev 2:** M07 - Multilingual Support → M10 - Content Review
- **Dev 3:** M06 - Interactive Learning Tools (whiteboard, polls, chat)
- **Dev 4:** M09 - Parent Monitoring → M12 - Digital Literacy Onboarding

**Deliverable at Hour 12:** 8 additional features integrated with foundation

### Hours 12-20: Advanced Features & Polish

**Complex features + integration work**

- **Dev 1 + Dev 2:** M11 - Video Adaptive Streaming (backend + frontend)
- **Dev 3:** Integration testing, bug fixes
- **Dev 4:** UI/UX polish, mobile responsiveness verification

**Deliverable at Hour 20:** All features complete, tested end-to-end

### Hours 20-24: Final Integration & Demo Prep

**All 4 developers collaborate**

- End-to-end testing of complete user journeys
- Demo script preparation (30-second demos per feature)
- Presentation slides and documentation
- Deployment to production environment
- Performance optimization and bug fixes
- Rehearse demo presentation

## External Services Required

### Gemini AI (Google)

- **Purpose:** Real-time translation, subtitle generation, content suggestions
- **Setup Time:** 15 min (API key from Google AI Studio)
- **Free Tier:** Yes (60 requests/minute free)
- **Library:** `@google/genai` (already in codebase)
- **Risk:** Low (fallback to pre-translated content if API fails)
- **Backup:** Cache translated content in DynamoDB for reuse

### WebRTC/Simple-Peer (Optional for video)

- **Purpose:** Peer-to-peer video streaming for live classes
- **Setup Time:** 20 min (npm install, basic config)
- **Free Tier:** Yes (open source)
- **Library:** `simple-peer` or `mediasoup`
- **Risk:** Medium (fallback to WebSocket text chat if P2P fails)
- **Backup:** Pre-recorded videos only (no live video, just audio/chat)

### i18next (Internationalization)

- **Purpose:** Multilingual UI with language switching
- **Setup Time:** 15 min (npm install, setup config)
- **Free Tier:** Yes (open source)
- **Library:** `i18next`, `react-i18next`
- **Risk:** Low (standard industry solution)
- **Backup:** English-only fallback if translation fails

### AWS Services (Already Available)

- **DynamoDB:** Already configured (single-table design)
- **S3:** Already configured (file storage, presigned URLs)
- **SES:** Already configured (email notifications)
- **SQS:** Already configured (async processing)
- **WebSocket API:** Already configured (real-time communication)
- **Lambda:** Already configured (serverless functions)

## Team Assignment Strategy

### Phase 1: Foundation (Hours 0-4)

**Dev 1 (Backend-focused):** F01 - Class Management System

- Skills needed: Lambda handlers, DynamoDB, CRUD operations
- Output: Create class, list classes, join class, class details
- Demo: Teacher creates class → Student joins → View class details

**Dev 2 (Full-stack, S3 experience):** F02 - Content Library & Upload

- Skills needed: S3 presigned URLs, file upload, DynamoDB queries
- Output: Upload content, list library, search, download
- Demo: Teacher uploads video → Student searches → Plays video

**Dev 3 (Real-time, WebSocket experience):** F03 - Live Session Management

- Skills needed: WebSocket handlers, connection management, broadcasting
- Output: Start session, join session, send messages, disconnect
- Demo: Teacher starts live class → Student joins → Chat works

**Dev 4 (Frontend-focused, React/UI):** F04 - User Dashboard (Multi-Role)

- Skills needed: React, shadcn/ui, role-based rendering, charts
- Output: Admin, Teacher, Student, Parent dashboards with relevant widgets
- Demo: Login as each role → See personalized dashboard

### Phase 2: Core Features (Hours 4-12)

**Dev 1:** M05 (Attendance Tracking) → M08 (Gamification)

- M05: Track attendance in DynamoDB, analytics queries
- M08: Badge system, leaderboards, point calculations

**Dev 2:** M07 (Multilingual) → M10 (Content Review)

- M07: i18next setup, Gemini translation API, language switcher
- M10: Peer review system, rating, approval workflow

**Dev 3:** M06 (Interactive Tools - Most Complex)

- Whiteboard canvas, poll creation, quiz functionality
- Real-time synchronization via WebSocket

**Dev 4:** M09 (Parent Portal) → M12 (Onboarding Tutorial)

- M09: Parent dashboard, progress tracking, email notifications
- M12: Interactive walkthrough, tooltips, help system

### Phase 3: Advanced (Hours 12-20)

**Pair Programming:**

- Dev 1 + Dev 2: M11 - Adaptive video streaming (complex, benefits from pairing)
- Dev 3: Integration testing, fixing cross-module bugs
- Dev 4: Mobile responsiveness, UI polish, accessibility

## Risk Mitigation Strategies

### High-Risk Module: M11 (Adaptive Video Streaming)

**Mitigation:**

- Use simple HLS streaming instead of custom adaptive logic
- Fallback: Offer 3 fixed quality options (low, medium, high)
- Store multiple video qualities in S3 during upload
- Use browser native video player (avoid custom players)

### Medium-Risk: F03 (Live Session) + M06 (Interactive Tools)

**Mitigation:**

- Start with WebSocket text chat only (proven to work)
- Add whiteboard as basic canvas drawing (simple, no complex shapes)
- Polls/quizzes use simple REST API (not real-time initially)
- Video streaming is bonus (audio + chat is MVP)

### Medium-Risk: M07 (Multilingual Translation)

**Mitigation:**

- Pre-translate all UI strings manually for English + Hindi
- Use Gemini AI for dynamic content (lecture descriptions, chat)
- Cache all translations in DynamoDB to reduce API calls
- Graceful fallback to English if translation fails

### Language Support Priority:

1. **Phase 1 (Hours 0-8):** English + Hindi UI (hardcoded)
2. **Phase 2 (Hours 8-16):** Add Marathi, Tamil, Bengali UI strings
3. **Phase 3 (Hours 16-20):** Gemini AI translation for dynamic content

## Success Criteria

### Foundation Modules (Must Complete by Hour 4):

- ✅ All 4 foundation modules deployed and accessible via API
- ✅ Each module has working frontend + backend + database integration
- ✅ Each module can be demoed independently in 30 seconds
- ✅ RBAC permissions configured for all 4 roles (admin, teacher, student, parent)

### Core Features (Must Complete by Hour 12):

- ✅ Attendance tracking works end-to-end (teacher marks, admin views reports)
- ✅ Interactive whiteboard allows drawing and sharing
- ✅ Multilingual UI supports at least English + Hindi + 1 regional language
- ✅ Content review system allows teachers to rate/approve resources
- ✅ Parent dashboard shows real-time student progress

### Advanced Features (Target by Hour 20):

- ✅ Video playback with quality selection (low/medium/high)
- ✅ Gamification badges awarded automatically based on performance
- ✅ Digital literacy tutorial guides first-time users
- ✅ All features tested on mobile Chrome browser

### Demo Ready (Hour 24):

- ✅ Complete user journey for each role (admin, teacher, student, parent)
- ✅ Presentation deck with screenshots and architecture diagram
- ✅ 5-minute demo script rehearsed and timed
- ✅ Deployed to production URL, accessible on mobile devices
