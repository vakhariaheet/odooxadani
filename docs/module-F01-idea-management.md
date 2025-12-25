# Module F01: Idea Management

## Overview

**Estimated Time:** 1hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Low

**Dependencies:** None

## Problem Context

Participants need to pitch their hackathon ideas with multimedia support, receive community votes for validation, and get early feedback from judges. This module enables structured idea submission, voting, and discovery to replace chaotic Slack/Discord channels.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler File:** Create `handlers/listIdeas.ts` with typed handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbac`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'ideas', 'read')`
  - Always use try-catch with `handleAsyncError(error)` in catch block

- [ ] **Handler File:** Create `handlers/getIdea.ts` for single idea retrieval
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'ideas', 'read')`

- [ ] **Handler File:** Create `handlers/createIdea.ts` for idea submission
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'ideas', 'create')`

- [ ] **Handler File:** Create `handlers/updateIdea.ts` for idea editing
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'ideas', 'update')`

- [ ] **Handler File:** Create `handlers/deleteIdea.ts` for idea removal
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'ideas', 'delete')`

- [ ] **Handler File:** Create `handlers/voteIdea.ts` for community voting
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'ideas', 'update')`

- [ ] **Function Config:** Create corresponding `.yml` files in `functions/` directory
  - Specify handler path: `src/modules/ideas/handlers/[action]Idea.handler`
  - Define HTTP method and path
  - Add authorizer: `clerkJwtAuthorizer` (for protected routes)

- [ ] **Service Layer:** Business logic in `services/IdeaService.ts`
  - Create service class with methods for business logic
  - Instantiate service at module level: `const ideaService = new IdeaService()`
  - Keep handlers thin - delegate to service methods
  - **MANDATORY AI Integration:** Include AI-powered idea enhancement features

- [ ] **AI Features Implementation:**
  - `enhanceIdeaDescription()` - AI-powered idea description improvement
  - `generateIdeaTags()` - Automatic skill tag generation from idea content
  - `suggestSimilarIdeas()` - AI recommendations for related ideas
  - `validateIdeaFeasibility()` - AI assessment of technical feasibility

- [ ] **Type Definitions:** Add types to `types.ts` for requests/responses
  - Request query/body types
  - Response data types
  - Service method parameter types

- [ ] **RBAC Verification:** Verify `config/permissions.ts` includes this module
  - Module should already be in `ALL_MODULES` list (configured during planning)
  - Role permissions should already be configured in `ROLE_MODULE_ACCESS`
  - Just verify the module name matches what you're implementing

- [ ] **AWS Service Integration:** **ALWAYS use shared/clients/\* wrappers**
  - **Already Available**: DynamoDB, S3, SES, SQS, Gemini AI clients in `shared/clients/`
  - **For NEW services**: Create new client wrapper following existing patterns
  - **Clerk API**: Direct import OK: `import { createClerkClient } from '@clerk/backend'`
  - **NEVER import @aws-sdk packages directly in handlers or services**

- [ ] **Error Handling:** Use `handleAsyncError()` and `commonErrors.*` consistently

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.ts, .spec.ts) - Skip unit tests for hackathon speed

### Frontend Tasks

- [ ] **Pages/Components:**
  - `IdeaList.tsx` - Browse all submitted ideas with filtering
  - `IdeaForm.tsx` - Create/edit idea submission form
  - `IdeaCard.tsx` - Individual idea display with voting
  - `IdeaDetails.tsx` - Full idea view with comments and votes

- [ ] **shadcn Components:** button, form, table, dialog, card, badge, textarea, select

- [ ] **API Integration:**
  - GET /api/ideas (list ideas with filters)
  - GET /api/ideas/:id (get single idea)
  - POST /api/ideas (create new idea)
  - PUT /api/ideas/:id (update idea)
  - DELETE /api/ideas/:id (delete idea)
  - POST /api/ideas/:id/vote (vote on idea)

- [ ] **AI Features:**
  - Smart idea enhancement suggestions
  - AI-generated skill tags display
  - Similar ideas recommendations
  - Feasibility score visualization

- [ ] **State Management:** TanStack Query for server state, local state for form data

- [ ] **Routing:**
  - `/ideas` - Ideas list page
  - `/ideas/new` - Create idea page
  - `/ideas/:id` - Idea details page
  - `/ideas/:id/edit` - Edit idea page

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.tsx, .spec.tsx) - Skip unit tests for hackathon speed

### Database Schema (Single Table)

```
pk: IDEA#[id] | sk: METADATA | gsi1pk: EVENT#[eventId] | gsi1sk: CREATED#[timestamp]
- title: string (idea title)
- description: string (detailed description)
- skills: string[] (required skills/technologies)
- category: string (web, mobile, ai, blockchain, etc.)
- difficulty: string (beginner, intermediate, advanced)
- teamSize: number (ideal team size)
- authorId: string (Clerk user ID)
- authorName: string (author display name)
- votes: number (community vote count)
- status: string (draft, published, archived)
- tags: string[] (AI-generated tags)
- feasibilityScore: number (AI-assessed feasibility 1-10)
- createdAt: string (ISO timestamp)
- updatedAt: string (ISO timestamp)

pk: IDEA#[id] | sk: VOTE#[userId] | gsi1pk: USER#[userId] | gsi1sk: VOTED#[timestamp]
- ideaId: string
- userId: string
- vote: number (1 for upvote, -1 for downvote)
- votedAt: string (ISO timestamp)
```

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** You MUST read `guidelines/project-architecture.md` COMPLETELY before writing any code.

**MANDATORY Reading (15-20 minutes):**

1. **Read `guidelines/project-architecture.md` COMPLETELY** (REQUIRED)
2. **Study Similar Existing Modules:** Review existing modules in `backend/src/modules/` for patterns
3. **Check Available Clients:** Review `backend/src/shared/clients/` for AWS service clients
4. **Examine Frontend Patterns:** Study `client/src/components/admin/` for UI patterns

### Step 1: Backend Implementation (Lambda-Compatible)

**File Structure:**

```
backend/src/modules/ideas/
├── handlers/
│   ├── listIdeas.ts         # GET /api/ideas
│   ├── getIdea.ts           # GET /api/ideas/:id
│   ├── createIdea.ts        # POST /api/ideas
│   ├── updateIdea.ts        # PUT /api/ideas/:id
│   ├── deleteIdea.ts        # DELETE /api/ideas/:id
│   └── voteIdea.ts          # POST /api/ideas/:id/vote
├── functions/
│   ├── listIdeas.yml
│   ├── getIdea.yml
│   ├── createIdea.yml
│   ├── updateIdea.yml
│   ├── deleteIdea.yml
│   └── voteIdea.yml
├── services/
│   └── IdeaService.ts       # Business logic and AI integration
└── types.ts                 # Domain-specific TypeScript types
```

**Service Layer Example:**

```typescript
// services/IdeaService.ts
import { geminiClient } from '../../../shared/clients/gemini';
import { dynamodb } from '../../../shared/clients/dynamodb';

export class IdeaService {
  async listIdeas(query: ListIdeasQuery): Promise<IdeaListResponse> {
    // Query ideas with filtering and pagination
  }

  async getIdea(id: string): Promise<Idea> {
    // Fetch single idea with vote count
  }

  async createIdea(data: CreateIdeaRequest): Promise<Idea> {
    // Create new idea with AI enhancement
    const enhancedDescription = await this.enhanceIdeaDescription(data.description);
    const aiTags = await this.generateIdeaTags(data.title, enhancedDescription);
    const feasibilityScore = await this.validateIdeaFeasibility(data);

    // Save to DynamoDB with enhanced data
  }

  // MANDATORY: AI-powered idea enhancement
  async enhanceIdeaDescription(description: string): Promise<string> {
    const prompt = `Enhance this hackathon idea description to be more compelling and clear: "${description}"`;

    const response = await geminiClient.generateText({
      prompt,
      maxTokens: 300,
    });

    return response.text;
  }

  // MANDATORY: AI-powered tag generation
  async generateIdeaTags(title: string, description: string): Promise<string[]> {
    const prompt = `Generate 5-8 relevant skill/technology tags for this hackathon idea:
    Title: ${title}
    Description: ${description}
    
    Return only the tags as a comma-separated list.`;

    const response = await geminiClient.generateText({
      prompt,
      maxTokens: 100,
    });

    return response.text.split(',').map((tag) => tag.trim());
  }

  // MANDATORY: AI-powered feasibility assessment
  async validateIdeaFeasibility(idea: CreateIdeaRequest): Promise<number> {
    const prompt = `Rate the technical feasibility of this hackathon idea on a scale of 1-10:
    Title: ${idea.title}
    Description: ${idea.description}
    Skills: ${idea.skills.join(', ')}
    Team Size: ${idea.teamSize}
    
    Consider: complexity, time constraints (24-48 hours), available technologies, team size.
    Return only the numeric score.`;

    const response = await geminiClient.generateText({
      prompt,
      maxTokens: 10,
    });

    return parseInt(response.text.trim()) || 5;
  }

  async voteIdea(ideaId: string, userId: string, vote: number): Promise<void> {
    // Handle voting logic with duplicate prevention
  }
}
```

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── components/ideas/
│   ├── IdeaList.tsx         # List view with filtering
│   ├── IdeaForm.tsx         # Create/edit form
│   ├── IdeaCard.tsx         # Individual idea card
│   └── IdeaDetails.tsx      # Full idea view
├── pages/ideas/
│   ├── IdeasListPage.tsx    # Ideas list page
│   ├── IdeaCreatePage.tsx   # Create idea page
│   └── IdeaDetailsPage.tsx  # Idea details page
├── hooks/
│   └── useIdeas.ts          # API integration hooks
├── services/
│   └── ideasApi.ts          # API service functions
└── types/
    └── idea.ts              # Frontend-specific types
```

### Step 3: Serverless Configuration

**Update serverless.yml:**

```yaml
functions:
  # ... existing functions ...

  # Import idea module functions
  - ${file(src/modules/ideas/functions/listIdeas.yml)}
  - ${file(src/modules/ideas/functions/getIdea.yml)}
  - ${file(src/modules/ideas/functions/createIdea.yml)}
  - ${file(src/modules/ideas/functions/updateIdea.yml)}
  - ${file(src/modules/ideas/functions/deleteIdea.yml)}
  - ${file(src/modules/ideas/functions/voteIdea.yml)}
```

### Step 4: Integration

- [ ] **Type Check:** Run `bun run typecheck` in both backend and client directories
- [ ] Test API endpoints with Postman/curl
- [ ] Connect frontend to backend
- [ ] Verify AI features are working
- [ ] Test voting functionality
- [ ] Verify data flow end-to-end

## Acceptance Criteria

- [ ] Participants can submit ideas with title, description, skills, and category
- [ ] Community voting system works (upvote/downvote with duplicate prevention)
- [ ] Ideas can be filtered by category, skills, and difficulty level
- [ ] **AI Feature Working:** Idea enhancement, tag generation, and feasibility scoring functional
- [ ] **Demo Ready:** Can demonstrate complete idea submission and voting flow in 30 seconds
- [ ] **Full-Stack Working:** Frontend connects to backend, backend connects to database
- [ ] **Lambda Compatible:** Backend code works in serverless environment
- [ ] **Error Handling:** Graceful failure modes implemented
- [ ] **Mobile Responsive:** Works on mobile devices

## Testing Checklist

- [ ] **Manual API Testing:**
  - Test with curl or Postman
  - Verify authentication with Clerk token
  - Check response format matches ApiResponse type
  - Test error cases (401, 403, 404, 500)

- [ ] **Frontend Testing:**
  - Manual testing in browser
  - Test loading states
  - Test error handling
  - Test form validation
  - Test responsive design on mobile
  - Test AI features display

- [ ] **Integration:** End-to-end flow works as expected
- [ ] **Edge Cases:** Error scenarios handled gracefully
- [ ] **Performance:** Acceptable load times (<2s for API calls)

## Deployment Checklist

- [ ] **CRITICAL - Type Check:** Run `bun run typecheck` in both backend and client
- [ ] **Code Review:** Self-review completed
- [ ] **Serverless Config:** Added function imports to serverless.yml
- [ ] **RBAC Config:** Verified permissions.ts includes ideas module
- [ ] **Types:** Exported types from module's types.ts for frontend use
- [ ] **Testing:** Manual testing completed
- [ ] **AI Integration:** Verified Gemini client integration works

## Related Modules

- **Depends On:** None (Foundation module)
- **Enables:** F03 (Team Formation), M05 (Advanced Idea Features), M09 (Judge Scoring)
- **Conflicts With:** None
