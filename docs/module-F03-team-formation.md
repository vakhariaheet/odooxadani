# Module F03: Team Formation & Matching

## Overview

**Estimated Time:** 1hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Low

**Dependencies:** None

## Problem Context

Solo participants need to find teammates with complementary skills, while existing teams need to discover additional members. This module enables skill-based matching, team requests, and real-time team collaboration to replace chaotic networking at hackathon kickoffs.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler File:** Create `handlers/listTeams.ts` with typed handler
  - Import: `AuthenticatedAPIGatewayEvent`, `withRbac`, `successResponse`, `handleAsyncError`
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'teams', 'read')`
  - Always use try-catch with `handleAsyncError(error)` in catch block

- [ ] **Handler File:** Create `handlers/getTeam.ts` for single team retrieval
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'teams', 'read')`

- [ ] **Handler File:** Create `handlers/createTeam.ts` for team creation
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'teams', 'create')`

- [ ] **Handler File:** Create `handlers/updateTeam.ts` for team editing
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'teams', 'update')`

- [ ] **Handler File:** Create `handlers/joinTeam.ts` for team join requests
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'teams', 'update')`

- [ ] **Handler File:** Create `handlers/leaveTeam.ts` for leaving teams
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'teams', 'update')`

- [ ] **Handler File:** Create `handlers/matchTeams.ts` for AI-powered team recommendations
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'teams', 'read')`

- [ ] **Function Config:** Create corresponding `.yml` files in `functions/` directory
  - Specify handler path: `src/modules/teams/handlers/[action]Team.handler`
  - Define HTTP method and path
  - Add authorizer: `clerkJwtAuthorizer` (for protected routes)

- [ ] **Service Layer:** Business logic in `services/TeamService.ts`
  - Create service class with methods for business logic
  - Instantiate service at module level: `const teamService = new TeamService()`
  - Keep handlers thin - delegate to service methods
  - **MANDATORY AI Integration:** Include AI-powered team matching features

- [ ] **AI Features Implementation:**
  - `findCompatibleTeams()` - AI-powered team recommendations based on skills
  - `analyzeTeamBalance()` - AI assessment of team skill balance
  - `suggestMissingSkills()` - AI recommendations for needed team members
  - `generateTeamDescription()` - AI-enhanced team descriptions

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
  - `TeamList.tsx` - Browse all teams looking for members
  - `TeamForm.tsx` - Create/edit team information
  - `TeamCard.tsx` - Individual team display with join button
  - `TeamDetails.tsx` - Full team view with member management
  - `TeamMatcher.tsx` - AI-powered team recommendations
  - `JoinRequestModal.tsx` - Modal for sending join requests

- [ ] **shadcn Components:** button, form, table, dialog, card, badge, avatar, select, checkbox

- [ ] **API Integration:**
  - GET /api/teams (list teams with filters)
  - GET /api/teams/:id (get single team)
  - POST /api/teams (create new team)
  - PUT /api/teams/:id (update team)
  - POST /api/teams/:id/join (request to join team)
  - POST /api/teams/:id/leave (leave team)
  - GET /api/teams/match (AI-powered team recommendations)

- [ ] **AI Features:**
  - Smart team matching based on user skills
  - Team balance analysis visualization
  - Missing skills recommendations
  - AI-generated team descriptions

- [ ] **State Management:** TanStack Query for server state, local state for form data

- [ ] **Routing:**
  - `/teams` - Teams list page
  - `/teams/new` - Create team page
  - `/teams/:id` - Team details page
  - `/teams/:id/edit` - Edit team page
  - `/teams/match` - AI team matching page

**CRITICAL - NO TESTS:** Do NOT create any test files (.test.tsx, .spec.tsx) - Skip unit tests for hackathon speed

### Database Schema (Single Table)

```
pk: TEAM#[id] | sk: METADATA | gsi1pk: EVENT#[eventId] | gsi1sk: CREATED#[timestamp]
- name: string (team name)
- description: string (team description)
- ideaId: string (associated idea ID, optional)
- leaderId: string (team leader Clerk user ID)
- leaderName: string (leader display name)
- members: TeamMember[] (current team members)
- maxSize: number (maximum team size)
- currentSize: number (current member count)
- skillsNeeded: string[] (skills the team is looking for)
- skillsHave: string[] (skills the team currently has)
- status: string (forming, full, closed)
- isPublic: boolean (whether team is visible to others)
- balanceScore: number (AI-assessed team balance 1-10)
- createdAt: string (ISO timestamp)
- updatedAt: string (ISO timestamp)

pk: TEAM#[id] | sk: MEMBER#[userId] | gsi1pk: USER#[userId] | gsi1sk: JOINED#[timestamp]
- teamId: string
- userId: string
- userName: string
- role: string (leader, member)
- skills: string[] (member's skills)
- joinedAt: string (ISO timestamp)
- status: string (active, pending, left)

pk: TEAM#[id] | sk: REQUEST#[userId] | gsi1pk: USER#[userId] | gsi1sk: REQUESTED#[timestamp]
- teamId: string
- userId: string
- userName: string
- message: string (join request message)
- skills: string[] (requester's skills)
- status: string (pending, approved, rejected)
- requestedAt: string (ISO timestamp)
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
backend/src/modules/teams/
├── handlers/
│   ├── listTeams.ts         # GET /api/teams
│   ├── getTeam.ts           # GET /api/teams/:id
│   ├── createTeam.ts        # POST /api/teams
│   ├── updateTeam.ts        # PUT /api/teams/:id
│   ├── joinTeam.ts          # POST /api/teams/:id/join
│   ├── leaveTeam.ts         # POST /api/teams/:id/leave
│   └── matchTeams.ts        # GET /api/teams/match
├── functions/
│   ├── listTeams.yml
│   ├── getTeam.yml
│   ├── createTeam.yml
│   ├── updateTeam.yml
│   ├── joinTeam.yml
│   ├── leaveTeam.yml
│   └── matchTeams.yml
├── services/
│   └── TeamService.ts       # Business logic and AI integration
└── types.ts                 # Domain-specific TypeScript types
```

**Service Layer Example:**

```typescript
// services/TeamService.ts
import { geminiClient } from '../../../shared/clients/gemini';
import { dynamodb } from '../../../shared/clients/dynamodb';

export class TeamService {
  async listTeams(query: ListTeamsQuery): Promise<TeamListResponse> {
    // Query teams with filtering and pagination
  }

  async getTeam(id: string): Promise<Team> {
    // Fetch single team with members and requests
  }

  async createTeam(data: CreateTeamRequest): Promise<Team> {
    // Create new team with AI-enhanced description
    const enhancedDescription = await this.generateTeamDescription(data);
    const balanceScore = await this.analyzeTeamBalance(data.skillsHave, data.skillsNeeded);

    // Save to DynamoDB with enhanced data
  }

  // MANDATORY: AI-powered team matching
  async findCompatibleTeams(userSkills: string[], interests: string[]): Promise<Team[]> {
    const allTeams = await this.listTeams({ status: 'forming' });

    const prompt = `Rank these teams by compatibility for a user with skills: ${userSkills.join(', ')}
    and interests: ${interests.join(', ')}.
    
    Teams: ${JSON.stringify(
      allTeams.teams.map((t) => ({
        id: t.id,
        name: t.name,
        skillsNeeded: t.skillsNeeded,
        skillsHave: t.skillsHave,
        description: t.description,
      }))
    )}
    
    Return the team IDs in order of best match, as a JSON array.`;

    const response = await geminiClient.generateJSON({
      prompt,
      schema: {
        type: 'object',
        properties: {
          rankedTeamIds: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    // Return teams in AI-recommended order
    return this.reorderTeamsByIds(allTeams.teams, response.rankedTeamIds);
  }

  // MANDATORY: AI-powered team balance analysis
  async analyzeTeamBalance(skillsHave: string[], skillsNeeded: string[]): Promise<number> {
    const prompt = `Analyze the balance of this team:
    Skills they have: ${skillsHave.join(', ')}
    Skills they need: ${skillsNeeded.join(', ')}
    
    Rate the team balance on a scale of 1-10, considering:
    - Skill diversity
    - Coverage of essential hackathon skills (frontend, backend, design, etc.)
    - Complementary skill sets
    
    Return only the numeric score.`;

    const response = await geminiClient.generateText({
      prompt,
      maxTokens: 10,
    });

    return parseInt(response.text.trim()) || 5;
  }

  // MANDATORY: AI-powered missing skills suggestions
  async suggestMissingSkills(team: Team): Promise<string[]> {
    const prompt = `Suggest 3-5 skills this hackathon team should look for:
    Current skills: ${team.skillsHave.join(', ')}
    Project type: ${team.description}
    
    Consider essential hackathon roles: frontend, backend, design, mobile, AI/ML, DevOps.
    Return only the skill names as a comma-separated list.`;

    const response = await geminiClient.generateText({
      prompt,
      maxTokens: 100,
    });

    return response.text.split(',').map((skill) => skill.trim());
  }

  async joinTeam(teamId: string, userId: string, message: string): Promise<void> {
    // Handle join request logic
  }

  async leaveTeam(teamId: string, userId: string): Promise<void> {
    // Handle leaving team logic
  }
}
```

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── components/teams/
│   ├── TeamList.tsx         # List view with filtering
│   ├── TeamForm.tsx         # Create/edit form
│   ├── TeamCard.tsx         # Individual team card
│   ├── TeamDetails.tsx      # Full team view
│   ├── TeamMatcher.tsx      # AI-powered matching
│   └── JoinRequestModal.tsx # Join request modal
├── pages/teams/
│   ├── TeamsListPage.tsx    # Teams list page
│   ├── TeamCreatePage.tsx   # Create team page
│   ├── TeamDetailsPage.tsx  # Team details page
│   └── TeamMatchPage.tsx    # AI matching page
├── hooks/
│   └── useTeams.ts          # API integration hooks
├── services/
│   └── teamsApi.ts          # API service functions
└── types/
    └── team.ts              # Frontend-specific types
```

**Team Card Example:**

```typescript
// components/teams/TeamCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Star } from 'lucide-react';

interface TeamCardProps {
  team: Team;
  onJoinRequest: (teamId: string) => void;
}

export const TeamCard = ({ team, onJoinRequest }: TeamCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{team.name}</CardTitle>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm">{team.balanceScore}/10</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{team.currentSize}/{team.maxSize} members</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4 line-clamp-2">{team.description}</p>

        <div className="mb-4">
          <h4 className="font-medium mb-2">Looking for:</h4>
          <div className="flex flex-wrap gap-1">
            {team.skillsNeeded.map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-medium mb-2">Team has:</h4>
          <div className="flex flex-wrap gap-1">
            {team.skillsHave.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          onClick={() => onJoinRequest(team.id)}
          disabled={team.currentSize >= team.maxSize}
          className="w-full"
        >
          {team.currentSize >= team.maxSize ? 'Team Full' : 'Request to Join'}
        </Button>
      </CardContent>
    </Card>
  );
};
```

### Step 3: Serverless Configuration

**Update serverless.yml:**

```yaml
functions:
  # ... existing functions ...

  # Import team module functions
  - ${file(src/modules/teams/functions/listTeams.yml)}
  - ${file(src/modules/teams/functions/getTeam.yml)}
  - ${file(src/modules/teams/functions/createTeam.yml)}
  - ${file(src/modules/teams/functions/updateTeam.yml)}
  - ${file(src/modules/teams/functions/joinTeam.yml)}
  - ${file(src/modules/teams/functions/leaveTeam.yml)}
  - ${file(src/modules/teams/functions/matchTeams.yml)}
```

### Step 4: Integration

- [ ] **Type Check:** Run `bun run typecheck` in both backend and client directories
- [ ] Test API endpoints with Postman/curl
- [ ] Connect frontend to backend
- [ ] Verify AI matching features are working
- [ ] Test team join/leave functionality
- [ ] Verify data flow end-to-end

## Acceptance Criteria

- [ ] Participants can create teams with skill requirements and descriptions
- [ ] Team browsing with filtering by skills needed and team size
- [ ] Join request system with approval/rejection workflow
- [ ] **AI Feature Working:** Team matching, balance analysis, and skill suggestions functional
- [ ] **Demo Ready:** Can demonstrate complete team formation flow in 30 seconds
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
- [ ] **RBAC Config:** Verified permissions.ts includes teams module
- [ ] **Types:** Exported types from module's types.ts for frontend use
- [ ] **Testing:** Manual testing completed
- [ ] **AI Integration:** Verified Gemini client integration works

## Related Modules

- **Depends On:** None (Foundation module)
- **Enables:** M07 (Real-time Team Chat), M09 (Team Analytics), M11 (Advanced Team Features)
- **Conflicts With:** None
