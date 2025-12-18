# Module F04: User Dashboard (Multi-Role)

## Overview

**Estimated Time:** 1 hour  
**Complexity:** Medium (role-based UI rendering)  
**Type:** Frontend-heavy (some backend analytics endpoints)  
**Risk Level:** Low  
**Dependencies:** None (Foundation module - zero dependencies)

## Problem Context

Each user role (admin, teacher, student, parent) needs a personalized dashboard showing relevant information and quick actions. Admins need platform statistics. Teachers need class overview and upcoming sessions. Students need their schedule and progress. Parents need child monitoring widgets. This module provides role-specific landing pages.

## Technical Requirements

### Backend Tasks

- [ ] **Handler: getAdminStats.ts** - GET /api/stats/admin
  - Admin-only endpoint with platform statistics
  - Import: `withRbac` with `'admin'` module check
  - Return: Total users (by role), classes, sessions, content items
  - Query DynamoDB aggregates using GSI scans

- [ ] **Handler: getTeacherStats.ts** - GET /api/stats/teacher
  - Teacher's personal statistics
  - Ownership check: teacherId from JWT
  - Return: My classes count, students count, upcoming sessions, content uploads

- [ ] **Handler: getStudentStats.ts** - GET /api/stats/student
  - Student's personal statistics
  - Return: Enrolled classes, attendance rate, achievements, upcoming sessions

- [ ] **Handler: getParentStats.ts** - GET /api/stats/parent
  - Parent's dashboard data
  - Query parameter: `childId` (student userId)
  - Return: Child's progress, attendance, recent activity
  - Ownership validation: Parent can only access their children

- [ ] **Function Configs** - YAML files
  - `getAdminStats.yml`, `getTeacherStats.yml`, `getStudentStats.yml`, `getParentStats.yml`
  - HTTP API with `clerkJwtAuthorizer`

- [ ] **Service Layer: StatsService.ts**
  - `getAdminStatistics()` - Platform-wide aggregates
  - `getTeacherStatistics(teacherId)` - Teacher metrics
  - `getStudentStatistics(studentId)` - Student progress
  - `getParentStatistics(parentId, childId)` - Child monitoring data
  - Use DynamoDB queries with counting and aggregation

- [ ] **Type Definitions: types.ts**

  ```typescript
  export interface AdminStats {
    totalUsers: {
      admin: number;
      teacher: number;
      student: number;
      parent: number;
    };
    totalClasses: number;
    activeSessions: number;
    totalContent: number;
    recentActivity: Activity[];
  }

  export interface TeacherStats {
    myClasses: number;
    totalStudents: number;
    upcomingSessions: Session[];
    recentContent: Content[];
    averageAttendance: number;
  }

  export interface StudentStats {
    enrolledClasses: number;
    attendanceRate: number;
    achievements: Achievement[];
    upcomingSessions: Session[];
    recentGrades: Grade[];
  }

  export interface ParentStats {
    childName: string;
    childId: string;
    enrolledClasses: number;
    attendanceRate: number;
    recentActivity: Activity[];
    upcomingSessions: Session[];
    alerts: Alert[];
  }

  export interface Activity {
    activityId: string;
    type: 'class_joined' | 'session_attended' | 'content_viewed' | 'achievement_earned';
    description: string;
    timestamp: string;
  }
  ```

- [ ] **RBAC Configuration:**
  - Add `'dashboard'` to `ALL_MODULES`
  - Each role can readOwn('dashboard')
  - Admin can readAny('dashboard')

### Frontend Tasks

- [ ] **Component: AdminDashboard.tsx** - Admin overview
  - Platform statistics cards
  - User count by role (pie chart)
  - Recent user signups table
  - Active sessions count
  - Quick actions: View all users, View all classes
  - Use existing admin components from template as reference

- [ ] **Component: TeacherDashboard.tsx** - Teacher landing page
  - My Classes card with quick links
  - Upcoming Sessions calendar widget
  - Student count badge
  - Recent Content uploads list
  - Quick actions: Create Class, Start Session, Upload Content

- [ ] **Component: StudentDashboard.tsx** - Student home
  - Enrolled Classes grid
  - Upcoming Sessions schedule
  - Attendance percentage badge
  - Achievements/Badges showcase
  - Recent activity feed
  - Quick actions: Browse Classes, View Library

- [ ] **Component: ParentDashboard.tsx** - Parent monitoring
  - Child selector dropdown (if multiple children)
  - Child progress overview card
  - Attendance tracking chart
  - Upcoming sessions for child
  - Recent activity timeline
  - Alert notifications (low attendance, missed sessions)

- [ ] **Component: StatCard.tsx** - Reusable stat widget
  - Large number display
  - Label and icon
  - Optional trend indicator (up/down)
  - Click action
  - Color variants (success, warning, info)

- [ ] **Component: ActivityFeed.tsx** - Recent activity list
  - Timeline-style activity display
  - Activity icons by type
  - Timestamps (relative: "2 hours ago")
  - Click to view details

- [ ] **Component: UpcomingSessionsWidget.tsx** - Session schedule
  - List of next 3-5 sessions
  - Session time, class name, join button
  - Calendar icon with date
  - "View All" link

- [ ] **Component: QuickActions.tsx** - Action buttons
  - Large icon buttons for common actions
  - Role-specific actions
  - Mobile-friendly grid layout

- [ ] **shadcn Components:**
  - `card`, `button`, `badge`, `avatar`, `separator`, `select`, `tabs`, `alert`, `skeleton` (loading state)

- [ ] **API Integration: services/statsApi.ts**
  - `fetchAdminStats()` - GET /api/stats/admin
  - `fetchTeacherStats()` - GET /api/stats/teacher
  - `fetchStudentStats()` - GET /api/stats/student
  - `fetchParentStats(childId)` - GET /api/stats/parent?childId=X

- [ ] **Hooks: useStats.ts** - React Query for dashboard data
  - `useAdminStats()` - Admin statistics
  - `useTeacherStats()` - Teacher statistics
  - `useStudentStats()` - Student statistics
  - `useParentStats(childId)` - Parent statistics
  - Auto-refresh every 30 seconds

- [ ] **State Management:** React Query for server state, local state for UI

- [ ] **Routing:**
  - `/dashboard` → Role-based redirect to appropriate dashboard
  - `/admin/dashboard` → AdminDashboard (admin only)
  - `/teacher/dashboard` → TeacherDashboard (teacher only)
  - `/student/dashboard` → StudentDashboard (student only)
  - `/parent/dashboard` → ParentDashboard (parent only)

### Database Schema

```
# Activity Log (for feeds)
PK: USER#<userId>
SK: ACTIVITY#<timestamp>#<activityId>
type: string
description: string
metadata: object
timestamp: string
GSI1PK: ACTIVITY_TYPE#<type>
GSI1SK: ACTIVITY#<timestamp>

# Statistics Cache (optional, for performance)
PK: STATS#<userId>
SK: CACHE#<date>
data: object (cached statistics)
TTL: timestamp + 86400 (24 hour cache)
```

## Implementation Guide

### Step 0: Study Existing Admin Dashboard

```bash
# Review existing admin dashboard patterns
cat client/src/components/admin/AdminDashboard.tsx
cat client/src/components/admin/UserManagement.tsx
cat client/src/hooks/useUsers.ts
```

### Step 1: Backend Implementation

**File Structure:**

```
backend/src/modules/dashboard/
├── handlers/
│   ├── getAdminStats.ts
│   ├── getTeacherStats.ts
│   ├── getStudentStats.ts
│   └── getParentStats.ts
├── functions/
│   └── [YAML configs]
├── services/
│   └── StatsService.ts
└── types.ts
```

**Implementation Tips:**

- Use DynamoDB Query with `Select: 'COUNT'` for efficient counting
- Cache statistics in DynamoDB with TTL for performance
- Use GSI for aggregation queries across different entity types

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── components/dashboard/
│   ├── AdminDashboard.tsx
│   ├── TeacherDashboard.tsx
│   ├── StudentDashboard.tsx
│   ├── ParentDashboard.tsx
│   ├── StatCard.tsx
│   ├── ActivityFeed.tsx
│   ├── UpcomingSessionsWidget.tsx
│   └── QuickActions.tsx
├── pages/
│   └── DashboardPage.tsx (role-based wrapper)
├── hooks/
│   └── useStats.ts
└── services/
    └── statsApi.ts
```

**Implementation Order:**

1. Create StatCard and QuickActions (reusable components)
2. Build StudentDashboard (simplest, fewest widgets)
3. Build TeacherDashboard
4. Build ParentDashboard
5. Build AdminDashboard (most complex)
6. Create DashboardPage wrapper with role routing

### Step 3: Integration

- [ ] Test role-based routing
- [ ] Verify statistics calculated correctly
- [ ] Test auto-refresh functionality
- [ ] Verify mobile responsive layout

## Acceptance Criteria

- [ ] **Admin sees platform statistics** - user counts, class counts, session counts
- [ ] **Teacher sees their classes** and upcoming sessions
- [ ] **Student sees enrolled classes** and personal progress
- [ ] **Parent sees child's progress** and attendance
- [ ] **Quick actions work** - buttons navigate to correct pages
- [ ] **Statistics auto-refresh** every 30 seconds
- [ ] **Role-based access enforced** - students cannot access admin dashboard
- [ ] **Mobile responsive** - dashboard cards stack vertically on mobile
- [ ] **Loading states** - skeleton loaders while fetching data
- [ ] **Empty states** - helpful message when no data (e.g., no classes yet)
- [ ] **Demo Ready:** Login as each role → See personalized dashboard in 10 seconds

## Testing Checklist

- [ ] **Backend Testing:**
  - Admin stats returns correct counts
  - Teacher stats shows only own classes
  - Student stats shows only enrolled classes
  - Parent stats validates child ownership
  - Non-admin cannot access admin stats (403)

- [ ] **Frontend Testing:**
  - Correct dashboard renders based on user role
  - Statistics display with correct formatting
  - Quick actions navigate to correct pages
  - Auto-refresh updates statistics
  - Loading skeleton shows during fetch
  - Error state shows if API fails

- [ ] **Edge Cases:**
  - New user with no data → Empty state message
  - Parent with multiple children → Child selector works
  - Teacher with no classes → Prompt to create first class

## Troubleshooting Guide

1. **Wrong dashboard shows for role**
   - Check Clerk JWT claims include correct role
   - Verify role-based routing logic in DashboardPage
   - Check RBAC permissions for dashboard module

2. **Statistics not updating**
   - Check auto-refresh interval (30s)
   - Verify React Query cache invalidation
   - Check API endpoints returning fresh data

3. **Counts incorrect**
   - Verify DynamoDB query expressions
   - Check GSI configuration for aggregations
   - Test direct DynamoDB query in AWS console

## Related Modules

- **Depends On:** None (Foundation module - uses aggregated data from other modules)
- **Enables:**
  - M12 - Digital Literacy Onboarding (tutorial starts from dashboard)
  - All modules (dashboard provides navigation to all features)
- **Conflicts With:** None

---

**IMPORTANT:** This is a **Foundation Module** (F04) - primarily frontend with simple backend stats endpoints. Focus on clean, role-specific UI design and responsive layout.
