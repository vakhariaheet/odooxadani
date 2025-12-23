# Module [ID]: [Module Name]

## Overview
**Estimated Time:** [30min/45min/1hr/1.5hr]
**Complexity:** [Simple CRUD/Medium/Complex]
**Type:** [Backend-heavy/Frontend-heavy/Full-stack/Integration]
**Risk Level:** [Low/Medium/High]
**Dependencies:** [List module IDs or "None"]
**Assigned To:** [Developer Name]
**Status:** [Not Started/In Progress/Testing/Complete]

## Problem Context
[2-3 sentences explaining what this module solves from the original problem statement]

## Technical Requirements

### Backend Tasks
- [ ] **Route:** `[METHOD] /api/[endpoint]` - [Description]
- [ ] **DynamoDB Pattern:** 
  - PK: `[pattern]` (e.g., `USER#${userId}`)
  - SK: `[pattern]` (e.g., `PROFILE` or `BOOK#${bookId}`)
  - GSI: `[if needed]`
- [ ] **Middleware:** [Auth/validation requirements]
- [ ] **External Integration:** [If any - S3, OpenSearch, APIs]

### Frontend Tasks
- [ ] **Pages/Components:** [List specific components to build]
- [ ] **shadcn Components:** [button, form, table, dialog, etc.]
- [ ] **API Integration:** [Which endpoints to call]
- [ ] **State Management:** [Local state, context, or external store]
- [ ] **Routing:** [New routes to add]

### Database Schema (Single Table)
```json
{
  "pk": "[pattern]",
  "sk": "[pattern]", 
  "gsi1pk": "[if needed]",
  "gsi1sk": "[if needed]",
  "[field1]": "[type/description]",
  "[field2]": "[type/description]"
}
```

## External Services (if any)
### [Service Name]
- **Purpose:** [Why needed]
- **Setup Steps:**
  1. [Step 1]
  2. [Step 2]
- **Environment Variables:**
  ```
  SERVICE_API_KEY=your_key_here
  SERVICE_ENDPOINT=https://api.service.com
  ```
- **NPM Package:** `npm install [package-name]`
- **Code Pattern:**
  ```javascript
  // Basic usage example
  ```

## Implementation Guide

### Step 1: Backend Implementation
```javascript
// Express route example
app.get('/api/[endpoint]', requireAuth, async (req, res) => {
  try {
    // Implementation hint
    const result = await dbClient.query({
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: {
        ':pk': `[PK_PATTERN]`
      }
    });
    
    res.json({ success: true, data: result.Items });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Step 2: Frontend Implementation
```jsx
// React component structure
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@clerk/nextjs';

export function ComponentName() {
  const { getToken } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Implementation hint
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await getToken("");
      const response = await fetch('/api/[endpoint]', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

### Step 3: Integration
- [ ] Test API endpoint with Postman/curl
- [ ] Connect frontend to backend
- [ ] Verify data flow end-to-end

## LLM Prompts for Implementation

### Backend Prompts
1. **Route Creation:**
   ```
   Create an Express.js route for [specific functionality] using DynamoDB single table design. 
   Use PK pattern: [pattern], SK pattern: [pattern]. 
   Include proper error handling, input validation with Joi/Zod, and Clerk auth middleware.
   Return JSON responses with consistent structure.
   ```

2. **Database Operations:**
   ```
   Write DynamoDB DocumentClient operations for [specific use case] using single table design.
   Handle pagination, filtering, and sorting. Include proper error handling and logging.
   Use AWS SDK v3 syntax.
   ```

3. **Middleware Creation:**
   ```
   Create Express middleware for [specific purpose] that integrates with Clerk authentication.
   Include role-based access control and proper error responses.
   ```

### Frontend Prompts
1. **Component Creation:**
   ```
   Create a React component using shadcn/ui for [specific functionality].
   Include form validation with react-hook-form and zod, loading states, error handling.
   Use TypeScript with proper type definitions. Make it responsive and accessible.
   ```

2. **API Integration:**
   ```
   Create custom React hooks for [specific endpoints] using fetch/axios.
   Include loading states, error handling, caching with React Query if needed.
   Use TypeScript interfaces for API responses.
   ```

3. **State Management:**
   ```
   Create React context/state management for [specific feature].
   Include actions, reducers, and TypeScript types. Handle optimistic updates.
   ```

## Acceptance Criteria
- [ ] [Specific, testable requirement 1]
- [ ] [Specific, testable requirement 2]
- [ ] [Specific, testable requirement 3]
- [ ] **Demo Ready:** Can demonstrate feature in 30 seconds
- [ ] **Error Handling:** Graceful failure modes implemented
- [ ] **Mobile Responsive:** Works on mobile devices (if frontend)
- [ ] **Accessibility:** Basic ARIA labels and keyboard navigation
- [ ] **Performance:** API calls complete in <2 seconds

## Testing Checklist

### Backend Testing
- [ ] **Happy Path:** API returns expected responses for valid inputs
- [ ] **Validation:** Proper error responses for invalid inputs
- [ ] **Authentication:** Protected routes require valid tokens
- [ ] **Authorization:** Role-based access works correctly
- [ ] **Edge Cases:** Handles empty results, large datasets

### Frontend Testing
- [ ] **Rendering:** Component renders without errors
- [ ] **User Interactions:** All buttons, forms, and inputs work
- [ ] **API Integration:** Successful and error states handled
- [ ] **Loading States:** Appropriate feedback during async operations
- [ ] **Responsive Design:** Works on mobile and desktop

### Integration Testing
- [ ] **End-to-End Flow:** Complete user journey works
- [ ] **Data Consistency:** Frontend displays backend data correctly
- [ ] **Error Propagation:** Backend errors shown appropriately in UI
- [ ] **Performance:** Acceptable load times under normal conditions

## Merge Preparation
- [ ] **Code Review:** Self-review completed, code follows team conventions
- [ ] **Conflicts:** Checked for potential merge conflicts with main branch
- [ ] **Documentation:** Updated shared types, interfaces, API documentation
- [ ] **Testing:** All acceptance criteria met and tested
- [ ] **Commit Message:** Clear, descriptive commit following conventional commits
- [ ] **Branch Cleanup:** Removed debug code, console.logs, commented code

## Troubleshooting Guide

### Common Backend Issues
1. **DynamoDB Access Denied**
   - **Symptom:** 403 errors when accessing DynamoDB
   - **Solution:** Check IAM permissions in CDK stack, verify table name environment variable

2. **CORS Issues**
   - **Symptom:** Frontend can't call API from different origin
   - **Solution:** Verify CORS configuration in API Gateway/Express

3. **Authentication Failures**
   - **Symptom:** 401 errors despite valid Clerk token
   - **Solution:** Check Clerk webhook configuration, verify JWT validation

### Common Frontend Issues
1. **Component Not Rendering**
   - **Symptom:** Blank screen or component doesn't appear
   - **Solution:** Check console for errors, verify imports and exports

2. **API Calls Failing**
   - **Symptom:** Network errors or unexpected responses
   - **Solution:** Check API endpoint URLs, verify authentication headers

3. **State Not Updating**
   - **Symptom:** UI doesn't reflect data changes
   - **Solution:** Check state management, verify useEffect dependencies

### Debug Commands
```bash
# Backend debugging
npm run dev
curl -X GET http://localhost:3000/api/[endpoint] -H "Authorization: Bearer [token]"
npm run logs

# Frontend debugging
npm run dev
npm run build  # Check for build errors
npm run type-check  # TypeScript validation

# Database debugging
aws dynamodb scan --table-name [table-name] --region us-east-1
```

## Performance Considerations
- [ ] **Database Queries:** Optimized for single-table design patterns
- [ ] **API Responses:** Paginated for large datasets
- [ ] **Frontend Rendering:** Minimized re-renders and unnecessary API calls
- [ ] **Bundle Size:** No unnecessary dependencies added
- [ ] **Caching:** Appropriate caching strategies implemented

## Security Checklist
- [ ] **Input Validation:** All user inputs validated and sanitized
- [ ] **Authentication:** Protected routes require valid authentication
- [ ] **Authorization:** Users can only access their own data
- [ ] **SQL Injection:** N/A for DynamoDB, but validate all inputs
- [ ] **XSS Prevention:** User content properly escaped in UI

## Related Modules
- **Depends On:** [List modules this depends on with brief explanation]
- **Enables:** [List modules that depend on this with brief explanation]
- **Conflicts With:** [Any modules that might have conflicting changes]
- **Shared Resources:** [Database tables, API routes, components used by multiple modules]

## Notes & Decisions
- **Technical Decisions:** [Record any important technical choices made]
- **Assumptions:** [List any assumptions made during implementation]
- **Future Improvements:** [Ideas for post-hackathon enhancements]
- **Lessons Learned:** [What worked well, what didn't]

---

## Progress Tracking
**Started:** [Timestamp]
**Completed:** [Timestamp]
**Time Taken:** [Actual time vs estimate]
**Blockers Encountered:** [List any issues that caused delays]
**Help Needed:** [Areas where team assistance was required]

---

*Module Template v1.0 | Generated for Hackathon Module System*
*Last Updated: [Date] | Developer: [Name]*