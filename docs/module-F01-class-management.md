# Module F01: Class Management System

## Overview

**Estimated Time:** 1 hour  
**Complexity:** Medium (CRUD operations with scheduling)  
**Type:** Full-stack  
**Risk Level:** Low  
**Dependencies:** None (Foundation module - zero dependencies)

## Problem Context

Teachers need to create virtual classes, schedule them, and manage enrollments. Students need to discover and join classes. Admins need to monitor all classes across the platform. This module provides the core class entity management that other modules build upon.

## Technical Requirements

### Backend Tasks

- [ ] **Handler: listClasses.ts** - GET /api/classes
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbac`, `successResponse`, `handleAsyncError`
  - Query parameters: `status` (active/scheduled/completed), `teacherId`, `limit`, `lastKey`
  - Teachers see their classes, Students see enrolled/available classes, Admins see all
  - Pattern: `baseHandler` + `export const handler = withRbac(baseHandler, 'classes', 'read')`
  - Use try-catch with `handleAsyncError(error)`

- [ ] **Handler: getClass.ts** - GET /api/classes/:classId
  - Fetch class details by ID from DynamoDB
  - Include enrollment count, teacher details, schedule
  - Validate access: Teachers own class, Students enrolled, Admins view all

- [ ] **Handler: createClass.ts** - POST /api/classes
  - Import: `dynamodb` from `shared/clients/dynamodb`
  - Body: `{ title, description, subject, language, schedule, maxStudents }`
  - Generate classId, set teacherId from JWT claims
  - Store in DynamoDB: `PK: CLASS#${classId}`, `SK: METADATA`
  - **CRITICAL:** Use `dynamodb.put()` wrapper, NEVER import `@aws-sdk/client-dynamodb` directly

- [ ] **Handler: updateClass.ts** - PUT /api/classes/:classId
  - Update class metadata (title, description, schedule)
  - Ownership check: Only class teacher can update
  - Use `withRbacOwn` middleware for ownership validation

- [ ] **Handler: deleteClass.ts** - DELETE /api/classes/:classId
  - Soft delete (set status: 'deleted')
  - Only teacher or admin can delete
  - Batch update enrollments to mark class deleted

- [ ] **Handler: joinClass.ts** - POST /api/classes/:classId/join
  - Student enrollment endpoint
  - Check max capacity, student not already enrolled
  - Create enrollment record in DynamoDB
  - Send confirmation email via SES

- [ ] **Handler: leaveClass.ts** - POST /api/classes/:classId/leave
  - Student un-enrollment
  - Update enrollment status to 'left'

- [ ] **Function Configs** - Create YAML files in `functions/` folder
  - `listClasses.yml`, `getClass.yml`, `createClass.yml`, `updateClass.yml`, `deleteClass.yml`, `joinClass.yml`, `leaveClass.yml`
  - Each specifies handler path, HTTP method/path, authorizer: `clerkJwtAuthorizer`

- [ ] **Service Layer: ClassService.ts**
  - `createClass(data)` - Validate inputs, generate ID, store in DynamoDB
  - `getClassDetails(classId, userId, role)` - Fetch with enrollment count
  - `listClasses(filters, userId, role)` - Query with RBAC filtering
  - `enrollStudent(classId, studentId)` - Handle enrollment logic
  - `updateEnrollmentCount(classId, delta)` - Atomic counter update

- [ ] **Type Definitions: types.ts**

  ```typescript
  export interface Class {
    classId: string;
    teacherId: string;
    title: string;
    description: string;
    subject: string; // Math, Science, English, etc.
    language: string; // en, hi, mr, ta, bn
    schedule: {
      startDate: string;
      endDate: string;
      daysOfWeek: number[]; // [1, 3, 5] for Mon, Wed, Fri
      time: string; // "10:00"
    };
    maxStudents: number;
    enrolledCount: number;
    status: 'draft' | 'active' | 'scheduled' | 'completed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
  }

  export interface Enrollment {
    enrollmentId: string;
    classId: string;
    studentId: string;
    studentName: string;
    status: 'active' | 'left' | 'removed';
    joinedAt: string;
    progress: number; // 0-100
  }

  export interface CreateClassRequest {
    title: string;
    description: string;
    subject: string;
    language: string;
    schedule: Class['schedule'];
    maxStudents: number;
  }

  export interface ListClassesQuery {
    status?: string;
    teacherId?: string;
    subject?: string;
    language?: string;
    limit?: number;
    lastKey?: string;
  }
  ```

- [ ] **RBAC Configuration: Update `config/permissions.ts`**
  - Add `'classes'` to `ALL_MODULES` array
  - Add role configurations:

    ```typescript
    export type Role = 'user' | 'admin' | 'teacher' | 'student' | 'parent';

    const USER_MODULE_ACCESS = {
      // ... existing modules
      classes: {
        any: [],
        own: [],
      },
    };
    ```

  - Configure teacher permissions:
    ```typescript
    // Teachers can create, read own, update own, delete own classes
    ac.grant('teacher')
      .createAny('classes')
      .readOwn('classes')
      .updateOwn('classes')
      .deleteOwn('classes');
    ```
  - Students can read and join classes
  - Admins get full access
  - **NOTE:** This is the FIRST module implementation - MUST set up all 4 roles in permissions.ts

### Frontend Tasks

- [ ] **Page: ClassesPage.tsx** - `/classes`
  - List of classes with filters (subject, language, status)
  - shadcn/ui Table component for desktop, Card grid for mobile
  - "Create Class" button for teachers
  - "Join Class" button for students
  - Search and filter functionality

- [ ] **Component: ClassList.tsx**
  - Displays classes in table (desktop) or cards (mobile)
  - Columns: Title, Teacher, Subject, Language, Schedule, Enrolled/Max, Actions
  - Click row to view details
  - Use `useApi` hook for data fetching

- [ ] **Component: ClassForm.tsx** - Create/Edit class modal
  - shadcn/ui Form with react-hook-form + zod validation
  - Fields: Title, Description, Subject dropdown, Language selector, Schedule picker, Max students
  - Multi-language support for form labels
  - Submit via `useApi` POST/PUT
  - Mobile-friendly form layout

- [ ] **Component: ClassDetails.tsx** - Class detail view
  - Show all class metadata
  - Enrollment list (if teacher/admin)
  - Join button (if student and not enrolled)
  - Edit/Delete buttons (if teacher or admin)
  - Schedule calendar view

- [ ] **Component: SchedulePicker.tsx** - Custom schedule selector
  - Select days of week (checkboxes for Mon-Sun)
  - Time picker for class start time
  - Date range picker for course duration
  - Preview of upcoming class dates

- [ ] **shadcn Components Needed:**
  - `button`, `form`, `input`, `textarea`, `select`, `table`, `card`, `dialog`, `calendar`, `checkbox`, `badge`, `alert`

- [ ] **API Integration: services/classesApi.ts**
  - `fetchClasses(filters)` - GET /api/classes
  - `fetchClassDetails(classId)` - GET /api/classes/:classId
  - `createClass(data)` - POST /api/classes
  - `updateClass(classId, data)` - PUT /api/classes/:classId
  - `deleteClass(classId)` - DELETE /api/classes/:classId
  - `joinClass(classId)` - POST /api/classes/:classId/join
  - `leaveClass(classId)` - POST /api/classes/:classId/leave

- [ ] **Hooks: useClasses.ts** - React Query integration
  - `useClasses(filters)` - List with caching
  - `useClassDetails(classId)` - Single class
  - `useCreateClass()` - Mutation hook
  - `useUpdateClass()` - Mutation hook
  - `useJoinClass()` - Mutation hook

- [ ] **State Management:** Local state with React Query for server state

- [ ] **Routing: Update App.tsx**
  - Add route `/classes` → `ClassesPage`
  - Add route `/classes/:classId` → `ClassDetailsPage`
  - Add route `/classes/new` → `CreateClassPage` (teacher only)

### Database Schema (DynamoDB Single Table)

```
# Class Metadata
PK: CLASS#<classId>
SK: METADATA
title: string
teacherId: string
teacherName: string
description: string
subject: string
language: string
schedule: object
maxStudents: number
enrolledCount: number
status: string
createdAt: string
updatedAt: string
GSI1PK: TEACHER#<teacherId>
GSI1SK: CLASS#<createdAt>
GSI2PK: SUBJECT#<subject>
GSI2SK: CLASS#<createdAt>

# Student Enrollment
PK: CLASS#<classId>
SK: ENROLLMENT#<studentId>
studentId: string
studentName: string
status: string (active/left/removed)
joinedAt: string
progress: number
lastAccessAt: string
GSI1PK: STUDENT#<studentId>
GSI1SK: CLASS#<joinedAt>

# Access Patterns:
1. List all classes by teacher → Query GSI1PK = TEACHER#<teacherId>
2. List all classes by subject → Query GSI2PK = SUBJECT#<subject>
3. Get class details → Get PK = CLASS#<classId>, SK = METADATA
4. List enrollments for class → Query PK = CLASS#<classId>, SK begins_with ENROLLMENT#
5. List student's enrolled classes → Query GSI1PK = STUDENT#<studentId>
```

## External Services

### AWS SES (Email)

- **Purpose:** Send enrollment confirmation emails to students
- **Setup Steps:**
  1. Verify sender email in SES console (already done if using template)
  2. Update FROM_EMAIL in environment variables
  3. Use `sesClient` from `shared/clients/ses`
- **Environment Variables:** `FROM_EMAIL`, `AWS_REGION`
- **NPM Package:** Already installed (`@aws-sdk/client-ses`)
- **Code Pattern:**

  ```typescript
  import { ses } from '../../../shared/clients/ses';

  await ses.sendEmail({
    to: studentEmail,
    subject: `You've joined ${className}!`,
    html: `<h1>Welcome to ${className}</h1><p>Class starts on ${startDate}</p>`,
  });
  ```

## Implementation Guide

### Step 0: Study Phase (MANDATORY - 15-20 minutes)

**Review Guidelines:**

```bash
cat guidelines/QUICK_REFERENCE.md      # Quick patterns
cat guidelines/CODING_GUIDELINES.md    # Code standards
cat guidelines/API_DESIGN.md           # API patterns
```

**Study Similar Modules:**

```bash
# Backend patterns:
cat backend/src/modules/users/handlers/listUsers.ts
cat backend/src/modules/users/services/ClerkUserService.ts
cat backend/src/config/permissions.ts

# Frontend patterns:
cat client/src/components/admin/UserManagement.tsx
cat client/src/hooks/useUsers.ts
```

### Step 1: Backend Implementation (Lambda-Compatible)

**File Structure:**

```
backend/src/modules/classes/
├── handlers/
│   ├── listClasses.ts
│   ├── getClass.ts
│   ├── createClass.ts
│   ├── updateClass.ts
│   ├── deleteClass.ts
│   ├── joinClass.ts
│   └── leaveClass.ts
├── functions/
│   ├── listClasses.yml
│   ├── getClass.yml
│   ├── createClass.yml
│   ├── updateClass.yml
│   ├── deleteClass.yml
│   ├── joinClass.yml
│   └── leaveClass.yml
├── services/
│   └── ClassService.ts
└── types.ts
```

**Implementation Order:**

1. Create `types.ts` with all interfaces
2. Update `config/permissions.ts` with 4 roles and class module permissions
3. Implement `ClassService.ts` with business logic
4. Create handlers one by one (start with `createClass`, `listClasses`, `getClass`)
5. Create corresponding YAML configs
6. Test each endpoint with curl/Postman before moving to next

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── components/classes/
│   ├── ClassList.tsx
│   ├── ClassForm.tsx
│   ├── ClassDetails.tsx
│   └── SchedulePicker.tsx
├── pages/classes/
│   ├── ClassesPage.tsx
│   ├── ClassDetailsPage.tsx
│   └── CreateClassPage.tsx
├── hooks/
│   └── useClasses.ts
├── services/
│   └── classesApi.ts
└── types/
    └── class.ts
```

**Implementation Order:**

1. Create `types/class.ts` (copy from backend types)
2. Implement `services/classesApi.ts` with all API calls
3. Create `hooks/useClasses.ts` with React Query
4. Build `ClassList` component (simplest, just display)
5. Build `ClassForm` component (create/edit)
6. Build `ClassDetails` component
7. Create pages and add routes

### Step 3: Integration

- [ ] Test API with Postman - verify all endpoints work
- [ ] Test frontend connected to backend - verify data flows
- [ ] Test RBAC - teacher creates class, student joins, admin views all
- [ ] Test on mobile browser - verify responsive design
- [ ] Verify enrollment email sent via SES

## Acceptance Criteria

- [ ] **Teacher can create a class** with title, subject, language, schedule, max students
- [ ] **Teacher can view list of their classes** in a table/card layout
- [ ] **Teacher can edit class details** (title, description, schedule)
- [ ] **Student can browse available classes** filtered by subject and language
- [ ] **Student can join a class** and receive confirmation email
- [ ] **Student can see their enrolled classes** on their dashboard
- [ ] **Admin can view all classes** across all teachers
- [ ] **Enrollment count updates automatically** when students join/leave
- [ ] **Max capacity enforced** - students cannot join full classes
- [ ] **Schedule displays in local time** with clear formatting
- [ ] **Demo Ready:** Can show class creation → student join → dashboard view in 30 seconds
- [ ] **Full-Stack Working:** Frontend connects to backend, backend stores in DynamoDB
- [ ] **Lambda Compatible:** All handlers are stateless Lambda functions
- [ ] **Error Handling:** Graceful failures with user-friendly error messages
- [ ] **Mobile Responsive:** Works on basic Android smartphones

## Testing Checklist

- [ ] **Backend Unit Tests:** SKIP FOR HACKATHON
- [ ] **Manual API Testing:**
  - Create class with valid data → 201 Created
  - Create class with missing fields → 400 Bad Request
  - List classes as teacher → See only own classes
  - List classes as student → See all available classes
  - Join class as student → 200 OK, enrollment created
  - Join full class → 400 Capacity exceeded
  - Update class as different teacher → 403 Forbidden
  - Test with Clerk token in Authorization header

- [ ] **Frontend Testing:**
  - Class form validates required fields
  - Class list shows correct data from API
  - Join button disabled for full classes
  - Mobile layout works on 375px viewport
  - Loading states display correctly
  - Error messages appear for failed API calls

- [ ] **Integration:** Teacher creates → Student joins → Both see updated enrollment count
- [ ] **Edge Cases:**
  - Empty class list shows "No classes found" message
  - Invalid classId returns 404
  - Non-teacher cannot create class (403)
- [ ] **Performance:** Class list loads in <2s on 3G network

## Deployment Checklist

- [ ] **Code Review:** Self-review completed
- [ ] **Serverless Config:** Added function imports to serverless.yml
  ```yaml
  functions:
    # ... existing functions
    - ${file(src/modules/classes/functions/listClasses.yml)}
    - ${file(src/modules/classes/functions/getClass.yml)}
    - ${file(src/modules/classes/functions/createClass.yml)}
    - ${file(src/modules/classes/functions/updateClass.yml)}
    - ${file(src/modules/classes/functions/deleteClass.yml)}
    - ${file(src/modules/classes/functions/joinClass.yml)}
    - ${file(src/modules/classes/functions/leaveClass.yml)}
  ```
- [ ] **RBAC Config:** Updated permissions.ts with all 4 roles (admin, teacher, student, parent)
- [ ] **Types:** Exported types from `types.ts` for frontend import
- [ ] **Environment Variables:** Added FROM_EMAIL for SES notifications
- [ ] **Testing:** Manual testing completed on all endpoints
- [ ] **Routes:** Added class routes to frontend router

## Troubleshooting Guide

### Common Issues

1. **403 Forbidden when creating class**
   - Check Clerk public_metadata has role: "teacher"
   - Verify permissions.ts grants teacher createAny('classes')
   - Check withRbac middleware wraps handler correctly

2. **Enrollment count not updating**
   - Use atomic update with DynamoDB UpdateExpression
   - `SET enrolledCount = enrolledCount + :inc`
   - Check conditional expressions don't prevent update

3. **Email not sending**
   - Verify FROM_EMAIL is verified in SES
   - Check AWS region matches SES verified email region
   - Use ses.sendEmail() wrapper, not raw SDK

4. **Student sees teacher's private classes**
   - Fix list query to filter by status='active'
   - Implement proper RBAC in listClasses handler
   - Query GSI by subject, not return all classes

5. **Schedule picker shows wrong times**
   - Store times in UTC, display in local timezone
   - Use date-fns for timezone conversions
   - Test with multiple timezone users

## Related Modules

- **Depends On:** None (Foundation module)
- **Enables:**
  - M05 - Attendance Tracking (needs class entity)
  - M06 - Interactive Learning Tools (needs live sessions in classes)
  - F03 - Live Session Management (uses class scheduling)
- **Conflicts With:** None

---

**IMPORTANT:** This is a **Foundation Module** (F01) - it MUST be completed first and has ZERO dependencies on other modules. All 4 developers should be able to start their foundation modules simultaneously.
