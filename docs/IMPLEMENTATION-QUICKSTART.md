# Inclusive Virtual Classroom - Implementation Quick Start Guide

## 📋 Overview

This guide provides a step-by-step plan for implementing the Inclusive Virtual Classroom platform during the hackathon. Follow this sequence for maximum efficiency.

## 🎯 Generated Module Files

All module specification files have been created in the `docs/` folder:

### Foundation Modules (F01-F04) - Hours 0-4

1. [`module-F01-class-management.md`](./module-F01-class-management.md) - Class CRUD, scheduling, enrollment
2. [`module-F02-content-library.md`](./module-F02-content-library.md) - File upload, S3 storage, content management
3. [`module-F03-live-session-management.md`](./module-F03-live-session-management.md) - WebSocket live sessions, chat
4. [`module-F04-user-dashboards.md`](./module-F04-user-dashboards.md) - Role-based dashboards for all 4 roles

### Core Feature Modules (M05-M12) - Hours 4-20

5. [`module-M05-attendance-tracking.md`](./module-M05-attendance-tracking.md) - Attendance marking and analytics
6. `module-M06-interactive-tools.md` - Whiteboard, polls, quizzes (to be implemented)
7. [`module-M07-multilingual-support.md`](./module-M07-multilingual-support.md) - i18next + Gemini AI translation
8. `module-M08-gamification.md` - Badges, leaderboards, achievements (to be implemented)
9. `module-M09-parent-monitoring.md` - Parent dashboard enhancements (to be implemented)
10. `module-M10-content-review.md` - Community content review system (to be implemented)
11. `module-M11-adaptive-video.md` - Multi-quality video streaming (to be implemented)
12. `module-M12-digital-literacy.md` - Onboarding tutorial (to be implemented)

### Planning Documents

- [`inclusive-classroom-executive-summary.md`](./inclusive-classroom-executive-summary.md) - Problem, solution, roles identified
- [`inclusive-classroom-module-overview.md`](./inclusive-classroom-module-overview.md) - Module list, dependencies, timeline
- [`RBAC-SETUP-FIRST.md`](./RBAC-SETUP-FIRST.md) - ⚠️ **CRITICAL: Must complete before any coding**

## 🚀 Implementation Sequence

### Hour 0: Setup & Planning (All 4 Developers Together)

**Tasks:**

1. ✅ **Read this guide** - Everyone understands the plan
2. ✅ **Review [`RBAC-SETUP-FIRST.md`](./RBAC-SETUP-FIRST.md)** - One person updates `permissions.ts`
3. ✅ **Assign foundation modules** - Dev 1: F01, Dev 2: F02, Dev 3: F03, Dev 4: F04
4. ✅ **Setup Clerk roles** - Create test users with admin, teacher, student, parent roles
5. ✅ **Verify infrastructure** - Backend deployed, frontend running, database connected

**Deliverable:** RBAC configured, roles assigned, ready to code in parallel

---

### Hours 1-4: Foundation Modules (PARALLEL - No Dependencies)

#### Dev 1: F01 - Class Management System

- Read [`module-F01-class-management.md`](./module-F01-class-management.md)
- Backend: Create class, list classes, join class handlers
- Frontend: ClassList, ClassForm, ClassDetails components
- **Demo:** Teacher creates class → Student joins → View enrollment

#### Dev 2: F02 - Content Library & Upload

- Read [`module-F02-content-library.md`](./module-F02-content-library.md)
- Backend: S3 presigned URLs, content metadata CRUD
- Frontend: File uploader, content grid, video player
- **Demo:** Upload video → Search library → Play video

#### Dev 3: F03 - Live Session Management

- Read [`module-F03-live-session-management.md`](./module-F03-live-session-management.md)
- Backend: WebSocket handlers, session CRUD
- Frontend: Live session room, chat box, participant list
- **Demo:** Start session → Join → Send chat message

#### Dev 4: F04 - User Dashboards

- Read [`module-F04-user-dashboards.md`](./module-F04-user-dashboards.md)
- Backend: Stats endpoints for each role
- Frontend: 4 dashboards (admin, teacher, student, parent)
- **Demo:** Login as each role → See personalized dashboard

**Checkpoint at Hour 4:**

- [ ] All 4 foundation modules deployed
- [ ] Each module tested independently
- [ ] Integration: Classes → Sessions → Content linked
- [ ] 30-second demo ready for each module

---

### Hours 5-12: Core Features (Some Dependencies)

#### Dev 1: M05 - Attendance Tracking

- Read [`module-M05-attendance-tracking.md`](./module-M05-attendance-tracking.md)
- Depends on F01 (classes)
- Backend: Mark attendance, calculate rates
- Frontend: Attendance sheet, analytics charts
- **Demo:** Mark attendance → View report

#### Dev 2: M07 - Multilingual Support

- Read [`module-M07-multilingual-support.md`](./module-M07-multilingual-support.md)
- Setup i18next, create translation files
- Backend: Gemini AI translation API
- Frontend: Language selector, translated UI
- **Demo:** Switch language → UI updates

#### Dev 3: M06 - Interactive Learning Tools

- Read module spec (to be created)
- Whiteboard canvas, poll creation
- Real-time sync via WebSocket
- **Demo:** Draw on whiteboard → Students see in real-time

#### Dev 4: M09 - Parent Monitoring

- Read module spec (to be created)
- Parent dashboard enhancements
- Email notifications via SES
- **Demo:** Parent views child progress

**Checkpoint at Hour 12:**

- [ ] 8 total modules complete (F01-F04 + M05-M08)
- [ ] Multilingual UI working (English + Hindi minimum)
- [ ] Live session with interactive tools functional
- [ ] End-to-end demo ready

---

### Hours 13-20: Advanced Features & Polish

#### All Devs: Integration & Advanced Features

- M08: Gamification (badges, leaderboards)
- M10: Content review system
- M11: Video quality selector (if time permits)
- M12: Digital literacy tutorial

#### Focus Areas:

- **Dev 1:** Backend performance optimization, analytics
- **Dev 2:** Mobile responsiveness, UI polish
- **Dev 3:** WebSocket stability, error handling
- **Dev 4:** Documentation, demo preparation

**Checkpoint at Hour 20:**

- [ ] All critical features complete
- [ ] Mobile testing on Android device
- [ ] Performance acceptable on 3G network
- [ ] Bug fixes completed

---

### Hours 21-24: Final Integration & Demo Prep

#### All Devs Together:

1. **End-to-end testing** - Complete user journeys for all 4 roles
2. **Demo script** - 5-minute presentation with 30-second feature demos
3. **Presentation slides** - Problem, solution, architecture, demo
4. **Deployment** - Production deployment, verify live URLs
5. **Rehearsal** - Practice demo presentation

**Final Deliverables:**

- [ ] Working platform deployed at production URL
- [ ] Presentation deck with screenshots
- [ ] 5-minute demo rehearsed and timed
- [ ] All 4 roles have complete user journeys
- [ ] Mobile-responsive on basic smartphones

---

## 🛠️ Development Commands

### Backend

```bash
cd backend

# Install dependencies
npm install

# Run tests (skip during hackathon)
npm test

# Deploy to dev
./deploy.sh dev-heet

# View logs
npx serverless logs -f functionName --stage dev-heet --tail
```

### Frontend

```bash
cd client

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## 📚 Key Resources

### Study Before Coding (15-20 minutes):

1. [`guidelines/QUICK_REFERENCE.md`](../guidelines/QUICK_REFERENCE.md) - Quick patterns
2. [`guidelines/CODING_GUIDELINES.md`](../guidelines/CODING_GUIDELINES.md) - Code standards
3. [`guidelines/API_DESIGN.md`](../guidelines/API_DESIGN.md) - API patterns

### Example Code to Reference:

- Backend: `backend/src/modules/users/handlers/listUsers.ts`
- Frontend: `client/src/components/admin/UserManagement.tsx`
- WebSocket: `backend/src/modules/websocket/handlers/connect.ts`

## ⚠️ Critical Reminders

### MUST DO:

1. ✅ **Update RBAC first** - See [`RBAC-SETUP-FIRST.md`](./RBAC-SETUP-FIRST.md)
2. ✅ **Use AWS client wrappers** - Never import `@aws-sdk` directly
3. ✅ **Follow Lambda patterns** - One handler per endpoint
4. ✅ **Test on mobile** - Mobile-first design requirement
5. ✅ **Multilingual from start** - Don't retrofit later

### NEVER DO:

1. ❌ **Don't write unit tests** - Hackathon time constraint
2. ❌ **Don't create new docs** - During implementation (Stage 2)
3. ❌ **Don't use raw AWS SDK** - Use shared/clients/\* wrappers
4. ❌ **Don't skip RBAC** - All modules need proper permissions

## 🎯 Success Metrics

By end of hackathon, you should have:

- ✅ **4 user roles working** - Admin, Teacher, Student, Parent
- ✅ **Live class functional** - WebSocket chat, participant list
- ✅ **Multilingual UI** - At least English + Hindi + 1 regional language
- ✅ **Video content** - Upload and playback working
- ✅ **Mobile-responsive** - Works on basic Android smartphones
- ✅ **Complete demo** - End-to-end user journey for each role
- ✅ **5-minute presentation** - Problem, solution, architecture, demo

## 🏆 Bonus Features (If Time Permits)

If you finish early (unlikely but possible):

1. **AI-powered features** - Subtitle generation, content suggestions
2. **Offline mode** - Service worker, cached content
3. **Advanced analytics** - Charts, trends, insights
4. **Real-time collaboration** - Shared whiteboard, co-editing
5. **Accessibility** - Screen reader support, keyboard navigation

## 📞 Need Help?

### During Implementation:

1. **Check existing code first** - Template has many examples
2. **Read module spec carefully** - All patterns documented
3. **Search guidelines folder** - Likely already answered
4. **Test incrementally** - Don't wait until end to test
5. **Ask teammates** - Others may have solved similar issues

### Common Issues:

See troubleshooting sections in each module spec:

- 401 Unauthorized → Check Clerk JWT setup
- 403 Forbidden → Verify RBAC permissions
- CORS errors → Check API Gateway CORS config
- WebSocket won't connect → Verify token in query string

---

## 🚀 Ready to Start?

1. Read [`RBAC-SETUP-FIRST.md`](./RBAC-SETUP-FIRST.md) and update permissions.ts
2. Assign foundation modules to 4 developers
3. Each developer reads their assigned module spec
4. Start coding in parallel - NO DEPENDENCIES!

**Good luck! You've got this! 🎉**
