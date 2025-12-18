# Module M05: Attendance & Performance Tracking

## Overview

**Estimated Time:** 1 hour  
**Complexity:** Medium  
**Type:** Full-stack  
**Risk Level:** Low  
**Dependencies:** F01 (Class Management System)

## Problem Context

Teachers need to track student attendance in live sessions and overall class participation. Admins and parents need attendance reports. Students need to see their attendance record. This module enables attendance marking, tracking, and analytics.

## Technical Requirements

### Backend Tasks

- [ ] **Handler: markAttendance.ts** - POST /api/attendance
  - Body: `{ sessionId, studentId, status }`
  - Teacher marks student present/absent/late
  - Create attendance record in DynamoDB
  - Depends on F01 (validates classId exists)

- [ ] **Handler: getAttendance.ts** - GET /api/attendance/:sessionId
  - Fetch attendance records for a session
  - Return list of students with attendance status

- [ ] **Handler: getStudentAttendance.ts** - GET /api/attendance/student/:studentId
  - Query: `classId` (optional filter)
  - Calculate attendance rate
  - Return attendance history

- [ ] **Handler: getAttendanceReport.ts** - GET /api/attendance/report
  - Query: `classId`, `startDate`, `endDate`
  - Generate attendance report with statistics
  - Export option (CSV data)

- [ ] **Service Layer: AttendanceService.ts**
  - `markAttendance(sessionId, studentId, status)`
  - `getSessionAttendance(sessionId)`
  - `calculateAttendanceRate(studentId, classId?)`
  - `generateReport(filters)`

- [ ] **Types:**

  ```typescript
  export interface AttendanceRecord {
    attendanceId: string;
    sessionId: string;
    classId: string;
    studentId: string;
    studentName: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    markedAt: string;
    markedBy: string; // teacherId
  }

  export interface AttendanceStats {
    totalSessions: number;
    attended: number;
    absent: number;
    late: number;
    attendanceRate: number; // percentage
  }
  ```

### Frontend Tasks

- [ ] **Component: AttendanceSheet.tsx** - Mark attendance UI
  - Student list with checkboxes
  - Status selector (present/absent/late)
  - Bulk actions (mark all present)
  - Submit attendance

- [ ] **Component: AttendanceReport.tsx** - Attendance analytics
  - Student-wise attendance table
  - Attendance rate chart (bar or pie)
  - Date range filter
  - Export CSV button

- [ ] **Component: StudentAttendanceCard.tsx** - Student's own view
  - Attendance rate percentage
  - Calendar heatmap showing attendance
  - Recent sessions list

### Database Schema

```
# Attendance Record
PK: SESSION#<sessionId>
SK: ATTENDANCE#<studentId>
classId: string
studentId: string
studentName: string
status: string
markedAt: string
markedBy: string
GSI1PK: STUDENT#<studentId>
GSI1SK: ATTENDANCE#<markedAt>
GSI2PK: CLASS#<classId>
GSI2SK: ATTENDANCE#<markedAt>
```

## Acceptance Criteria

- [ ] Teacher can mark attendance for session
- [ ] Student sees their attendance rate on dashboard
- [ ] Parent sees child's attendance in monitoring view
- [ ] Attendance report generates with statistics
- [ ] Late/absent students highlighted in red

## Related Modules

- **Depends On:** F01 (needs classes and enrollments)
- **Enables:** M08 (gamification uses attendance data)
- **Used By:** F04 (dashboard shows attendance stats)
