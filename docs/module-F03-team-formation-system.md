# Module F03: Team Formation System

## Overview

**Estimated Time:** 1hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Low

**Dependencies:** None

## Problem Context

Hackathon participants need an efficient way to form teams based on complementary skills, shared interests, and compatible working styles. This module provides the core team formation functionality where participants can create teams, send join requests, and manage team membership before hackathon events.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler Files:** Create team management handlers
  - `handlers/listTeams.ts` - GET /api/teams (with filtering)
  - `handlers/getTeam.ts` - GET /api/teams/:id
  - `handlers/createTeam.ts` - POST /api/teams
  - `handlers/updateTeam.ts` - PUT /api/teams/:id
  - `handlers/deleteTeam.ts` - DELETE /api/teams/:id
  - `handlers/joinTeam.ts` - POST /api/teams/:id/join
  - `handlers/leaveTeam.ts` - POST /api/teams/:id/leave
  - `handlers/manageMembers.ts` - PUT /api/teams/:id/members

- [ ] **Function Configs:** Create serverless function configurations
  - `functions/listTeams.yml` - List teams with search and filters
  - `functions/getTeam.yml` - Get team details with member info
  - `functions/createTeam.yml` - Create new team
  - `functions/updateTeam.yml` - Update team details
  - `functions/deleteTeam.yml` - Delete team (leader only)
  - `functions/joinTeam.yml` - Send join request or join open team
  - `functions/leaveTeam.yml` - Leave team or cancel request
  - `functions/manageMembers.yml` - Accept/reject join requests

- [ ] **Service Layer:** Business logic in `services/TeamService.ts`
  - Team CRUD operations with DynamoDB
  - Member management and role assignment
  - Join request handling and notifications
  - Team capacity validation (max 6 members)
  - Skill complementarity analysis

- [ ] **Type Definitions:** Add types to `types.ts`
  - `CreateTeamRequest`, `UpdateTeamRequest`, `JoinTeamRequest`
  - `TeamResponse`, `TeamListResponse`, `TeamMemberResponse`
  - `TeamRole`, `TeamStatus`, `JoinRequestStatus` enums

- [ ] **RBAC Verification:** Module already configured in permissions.ts
  - Participants can create/read/update/delete own teams
  - All users can read any teams
  - Team leaders can manage members

### Frontend Tasks

- [ ] **Components:** Create team management UI
  - `components/teams/TeamList.tsx` - Grid view of available teams
  - `components/teams/TeamCard.tsx` - Team preview with member info
  - `components/teams/TeamForm.tsx` - Create/edit team form
  - `components/teams/TeamDetails.tsx` - Full team view with join options
  - `components/teams/MemberList.tsx` - Team member management
  - `components/teams/JoinRequestList.tsx` - Manage join requests

- [ ] **Pages:** Create team-focused pages
  - `pages/teams/TeamsListPage.tsx` - Browse all teams
  - `pages/teams/TeamCreatePage.tsx` - Create new team
  - `pages/teams/TeamEditPage.tsx` - Edit team details
  - `pages/teams/TeamViewPage.tsx` - View team details
  - `pages/teams/MyTeamsPage.tsx` - User's teams and requests

- [ ] **API Integration:** Connect to backend
  - `hooks/useTeams.ts` - React Query hooks for team operations
  - `services/teamsApi.ts` - API service functions

- [ ] **State Management:** Team and member state management
  - Form state for team creation/editing
  - Member management state
  - Join request status tracking

- [ ] **Routing:** Add team routes
  - `/teams` - List all teams
  - `/teams/new` - Create team
  - `/teams/:id` - View team
  - `/teams/:id/edit` - Edit team
  - `/my-teams` - User's teams

### Database Schema (Single Table)

```
# Team Entity
PK: TEAM#[id] | SK: DETAILS | GSI1PK: USER#[leaderId] | GSI1SK: TEAM#[id]
- name: string (required, 3-50 chars)
- description: string (required, 10-500 chars)
- maxMembers: number (2-6, default 4)
- currentMembers: number (calculated)
- requiredSkills: string[] (desired skills for team)
- techStack: string[] (planned technologies)
- lookingFor: string[] (specific roles needed)
- isOpen: boolean (accepting new members)
- leaderId: string (Clerk user ID)
- createdAt: ISO string
- updatedAt: ISO string
- status: 'forming' | 'complete' | 'disbanded'
- hackathonId?: string (optional, for specific events)

# Team Member Entity
PK: TEAM#[teamId] | SK: MEMBER#[userId] | GSI1PK: USER#[userId] | GSI1SK: TEAM#[teamId]
- userId: string (Clerk user ID)
- teamId: string
- role: 'leader' | 'member' | 'pending'
- joinedAt: ISO string
- skills: string[] (member's relevant skills)
- status: 'active' | 'pending' | 'rejected' | 'left'

# Join Request Entity (for pending requests)
PK: TEAM#[teamId] | SK: REQUEST#[userId] | GSI1PK: USER#[userId] | GSI1SK: REQUEST#[teamId]
- userId: string (Clerk user ID)
- teamId: string
- message: string (optional join message)
- requestedAt: ISO string
- status: 'pending' | 'accepted' | 'rejected'
```

## Enhancement Features

### Enhancement Feature: Smart Team Recommendations

**Problem Solved:** Participants struggle to find teams that match their skills and interests, often joining incompatible teams or missing great opportunities.

**Enhancement Type:** Smart Logic - Skill complementarity analysis with optional AI enhancement

**User Trigger:** "Find Recommended Teams" button on teams list page

**Input Requirements:**

- **Required Fields:** User's skill profile (from their profile)
- **Optional Fields:** Preferred tech stack, role preferences, team size preference
- **Validation Rules:** User must have completed profile with at least 3 skills

**Processing Logic:**

1. **Skill Analysis:** Calculate skill complementarity between user and existing teams
2. **Preference Matching:** Match tech stack and role preferences
3. **Team Capacity:** Only recommend teams with available spots
4. **Scoring Algorithm:** Rank teams by compatibility score

**COMPLETE IMPLEMENTATION SPECIFICATION:**

**Types Definition:**

```typescript
// types.ts - Add these exact types
export interface TeamRecommendationRequest {
  userId: string;
  userSkills: string[];
  preferredTechStack?: string[];
  preferredRoles?: string[];
  maxTeamSize?: number;
  minTeamSize?: number;
}

export interface TeamRecommendation {
  team: TeamResponse;
  compatibilityScore: number;
  matchingSkills: string[];
  complementarySkills: string[];
  missingSkills: string[];
  reasons: string[];
  confidence: number;
}

export interface TeamRecommendationResponse {
  recommendations: TeamRecommendation[];
  totalTeams: number;
  userProfile: {
    skills: string[];
    preferences: string[];
  };
}
```

**Frontend Component:**

```typescript
// components/teams/TeamRecommendations.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Users, Star, TrendingUp } from 'lucide-react';
import { TeamCard } from './TeamCard';

interface TeamRecommendationsProps {
  onRecommendationClick: (teamId: string) => void;
}

export const TeamRecommendations = ({ onRecommendationClick }: TeamRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<TeamRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const findRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/teams/recommendations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      setRecommendations(data.data.recommendations);
      setHasSearched(true);
    } catch (error) {
      console.error('Recommendation error:', error);
      toast.error('Failed to get team recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent Match';
    if (score >= 0.6) return 'Good Match';
    return 'Potential Match';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Recommended Teams
          </h2>
          <p className="text-muted-foreground">
            Teams that match your skills and preferences
          </p>
        </div>

        <Button
          onClick={findRecommendations}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Finding matches...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              Find My Matches
            </>
          )}
        </Button>
      </div>

      {/* Recommendations */}
      {hasSearched && (
        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No matches found</h3>
                <p className="text-muted-foreground">
                  Try updating your profile with more skills or check back later for new teams.
                </p>
              </CardContent>
            </Card>
          ) : (
            recommendations.map((recommendation) => (
              <Card key={recommendation.team.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">
                        {recommendation.team.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Star className={`w-4 h-4 ${getScoreColor(recommendation.compatibilityScore)}`} />
                        <span className={`text-sm font-medium ${getScoreColor(recommendation.compatibilityScore)}`}>
                          {getScoreLabel(recommendation.compatibilityScore)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({Math.round(recommendation.compatibilityScore * 100)}% match)
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onRecommendationClick(recommendation.team.id)}
                    >
                      View Team
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {recommendation.team.description}
                  </p>

                  {/* Matching Skills */}
                  {recommendation.matchingSkills.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-green-700 mb-1">
                        Your matching skills:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {recommendation.matchingSkills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs bg-green-100 text-green-700">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Complementary Skills */}
                  {recommendation.complementarySkills.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-blue-700 mb-1">
                        Skills they need:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {recommendation.complementarySkills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs border-blue-200 text-blue-700">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reasons */}
                  {recommendation.reasons.length > 0 && (
                    <div>
                      <div className="text-xs font-medium mb-1">Why this team:</div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {recommendation.reasons.slice(0, 2).map((reason, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="text-primary">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Team Info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>
                      {recommendation.team.currentMembers}/{recommendation.team.maxMembers} members
                    </span>
                    <span>
                      Looking for: {recommendation.team.lookingFor?.slice(0, 2).join(', ')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};
```

**Backend Service Method:**

```typescript
// services/TeamService.ts - Add this method
async getTeamRecommendations(userId: string): Promise<TeamRecommendationResponse> {
  try {
    // Get user profile and skills
    const userProfile = await this.getUserProfile(userId);
    if (!userProfile.skills || userProfile.skills.length < 3) {
      throw new Error('Please complete your profile with at least 3 skills to get recommendations');
    }

    // Get all open teams (not full, accepting members)
    const openTeams = await this.getOpenTeams();

    // Calculate recommendations
    const recommendations: TeamRecommendation[] = [];

    for (const team of openTeams) {
      // Skip if user is already in this team
      if (await this.isUserInTeam(userId, team.id)) {
        continue;
      }

      const recommendation = await this.calculateTeamCompatibility(userProfile, team);

      // Only include teams with reasonable compatibility (>= 0.3)
      if (recommendation.compatibilityScore >= 0.3) {
        recommendations.push(recommendation);
      }
    }

    // Sort by compatibility score (highest first)
    recommendations.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return {
      recommendations: recommendations.slice(0, 10), // Top 10 recommendations
      totalTeams: openTeams.length,
      userProfile: {
        skills: userProfile.skills,
        preferences: userProfile.preferences || []
      }
    };
  } catch (error) {
    console.error('Team recommendation failed:', error);
    throw new Error(`Failed to get team recommendations: ${error.message}`);
  }
}

private async calculateTeamCompatibility(
  userProfile: UserProfile,
  team: TeamResponse
): Promise<TeamRecommendation> {
  const userSkills = new Set(userProfile.skills);
  const teamNeededSkills = new Set(team.requiredSkills || []);
  const teamTechStack = new Set(team.techStack || []);
  const userTechPrefs = new Set(userProfile.techPreferences || []);

  // Calculate skill matches
  const matchingSkills = Array.from(userSkills).filter(skill =>
    teamNeededSkills.has(skill)
  );

  const complementarySkills = Array.from(teamNeededSkills).filter(skill =>
    userSkills.has(skill)
  );

  const missingSkills = Array.from(teamNeededSkills).filter(skill =>
    !userSkills.has(skill)
  );

  // Calculate tech stack compatibility
  const techMatches = Array.from(userTechPrefs).filter(tech =>
    teamTechStack.has(tech)
  );

  // Scoring algorithm
  let score = 0;
  const reasons: string[] = [];

  // Skill compatibility (40% of score)
  const skillCompatibility = matchingSkills.length / Math.max(teamNeededSkills.size, 1);
  score += skillCompatibility * 0.4;

  if (matchingSkills.length > 0) {
    reasons.push(`You have ${matchingSkills.length} skills they need`);
  }

  // Tech stack compatibility (20% of score)
  const techCompatibility = techMatches.length / Math.max(teamTechStack.size, 1);
  score += techCompatibility * 0.2;

  if (techMatches.length > 0) {
    reasons.push(`Shared interest in ${techMatches.slice(0, 2).join(', ')}`);
  }

  // Team size preference (20% of score)
  const idealSize = userProfile.preferredTeamSize || 4;
  const sizeScore = 1 - Math.abs(team.maxMembers - idealSize) / 6;
  score += Math.max(0, sizeScore) * 0.2;

  // Availability (team not full) (20% of score)
  const availabilityScore = (team.maxMembers - team.currentMembers) / team.maxMembers;
  score += availabilityScore * 0.2;

  if (team.currentMembers < team.maxMembers) {
    const spotsLeft = team.maxMembers - team.currentMembers;
    reasons.push(`${spotsLeft} spot${spotsLeft > 1 ? 's' : ''} available`);
  }

  // Role match bonus
  if (team.lookingFor && userProfile.preferredRoles) {
    const roleMatches = team.lookingFor.some(role =>
      userProfile.preferredRoles?.includes(role)
    );
    if (roleMatches) {
      score += 0.1;
      reasons.push('Looking for your preferred role');
    }
  }

  // Ensure score is between 0 and 1
  score = Math.min(1, Math.max(0, score));

  return {
    team,
    compatibilityScore: score,
    matchingSkills,
    complementarySkills,
    missingSkills,
    reasons: reasons.slice(0, 3), // Top 3 reasons
    confidence: score > 0.7 ? 0.9 : score > 0.5 ? 0.7 : 0.5
  };
}

private async getOpenTeams(): Promise<TeamResponse[]> {
  // Query teams that are open and not full
  const params = {
    TableName: process.env.DYNAMODB_TABLE!,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk',
    FilterExpression: 'isOpen = :isOpen AND currentMembers < maxMembers AND #status = :status',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':pk': 'TEAM#OPEN',
      ':isOpen': true,
      ':status': 'forming'
    }
  };

  const result = await dynamodb.query(params);
  return result.Items as TeamResponse[];
}

private async getUserProfile(userId: string): Promise<UserProfile> {
  // Get user profile from profiles module or user data
  const params = {
    TableName: process.env.DYNAMODB_TABLE!,
    Key: {
      PK: `USER#${userId}`,
      SK: 'PROFILE'
    }
  };

  const result = await dynamodb.get(params);
  if (!result.Item) {
    throw new Error('User profile not found');
  }

  return result.Item as UserProfile;
}

private async isUserInTeam(userId: string, teamId: string): Promise<boolean> {
  const params = {
    TableName: process.env.DYNAMODB_TABLE!,
    Key: {
      PK: `TEAM#${teamId}`,
      SK: `MEMBER#${userId}`
    }
  };

  const result = await dynamodb.get(params);
  return !!result.Item && result.Item.status === 'active';
}
```

**API Handler:**

```typescript
// handlers/getTeamRecommendations.ts
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { successResponse, errorResponse, handleAsyncError } from '../../../shared/response';
import { teamService } from '../services/TeamService';

/**
 * @route GET /api/teams/recommendations
 * @description Get personalized team recommendations for the current user
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const userId = event.auth.claims.userid;

    if (!userId) {
      return errorResponse(401, 'MISSING_USER_ID', 'User ID not found in token');
    }

    // Get team recommendations
    const recommendations = await teamService.getTeamRecommendations(userId);

    return successResponse(recommendations);
  } catch (error) {
    return handleAsyncError(error);
  }
};

export const handler = withRbac(baseHandler, 'teams', 'read');
```

**Function Configuration:**

```yaml
# functions/getTeamRecommendations.yml
getTeamRecommendations:
  handler: src/modules/teams/handlers/getTeamRecommendations.handler
  events:
    - httpApi:
        path: /api/teams/recommendations
        method: get
        authorizer:
          name: clerkJwtAuthorizer
  timeout: 15
  memorySize: 256
```

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** Read `guidelines/project-architecture.md` COMPLETELY before writing any code.

### Step 1: Backend Implementation

**File Structure:**

```
backend/src/modules/teams/
├── handlers/
│   ├── listTeams.ts
│   ├── getTeam.ts
│   ├── createTeam.ts
│   ├── updateTeam.ts
│   ├── deleteTeam.ts
│   ├── joinTeam.ts
│   ├── leaveTeam.ts
│   ├── manageMembers.ts
│   └── getTeamRecommendations.ts
├── functions/
│   ├── listTeams.yml
│   ├── getTeam.yml
│   ├── createTeam.yml
│   ├── updateTeam.yml
│   ├── deleteTeam.yml
│   ├── joinTeam.yml
│   ├── leaveTeam.yml
│   ├── manageMembers.yml
│   └── getTeamRecommendations.yml
├── services/
│   └── TeamService.ts
└── types.ts
```

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── components/teams/
│   ├── TeamList.tsx
│   ├── TeamCard.tsx
│   ├── TeamForm.tsx
│   ├── TeamDetails.tsx
│   ├── MemberList.tsx
│   ├── JoinRequestList.tsx
│   └── TeamRecommendations.tsx
├── pages/teams/
│   ├── TeamsListPage.tsx
│   ├── TeamCreatePage.tsx
│   ├── TeamEditPage.tsx
│   ├── TeamViewPage.tsx
│   └── MyTeamsPage.tsx
├── hooks/
│   └── useTeams.ts
├── services/
│   └── teamsApi.ts
└── types/
    └── team.ts
```

### Step 3: Integration

- [ ] **Type Check:** Run `bun run typecheck` in both backend and client
- [ ] **Test API:** Test all team operations with Postman/curl
- [ ] **Connect Frontend:** Integrate React components with API
- [ ] **Verify Flow:** Test complete team formation workflow

## Acceptance Criteria

- [ ] Participants can create teams with detailed descriptions and requirements
- [ ] Team browsing works with search and filtering by skills/tech stack
- [ ] Join request system works for both open and closed teams
- [ ] Team leaders can manage members and approve/reject requests
- [ ] Smart recommendations provide relevant team matches based on skills
- [ ] Team capacity limits are enforced (max 6 members)
- [ ] **Demo Ready:** Can create team, get recommendations, and join in 30 seconds
- [ ] **Full-Stack Working:** All team operations work end-to-end
- [ ] **Mobile Responsive:** Team browsing and management work on mobile

## Testing Checklist

- [ ] **Manual API Testing:**
  - Create team with valid data returns 201
  - List teams with filters works correctly
  - Join team request system functions properly
  - Team recommendations return relevant results
  - Member management (accept/reject) works
  - Team capacity limits are enforced

- [ ] **Frontend Testing:**
  - Team creation form validates all fields
  - Team list displays with proper filtering
  - Join/leave team buttons work correctly
  - Recommendations show compatibility scores
  - Member management interface functions

- [ ] **Integration:** Complete team formation workflow works end-to-end
- [ ] **Edge Cases:** Handle full teams, duplicate requests, invalid operations
- [ ] **Performance:** Team list loads quickly, recommendations complete within 5 seconds

## Deployment Checklist

- [ ] **CRITICAL - Type Check:** Run `bun run typecheck` in both backend and client
- [ ] **Serverless Config:** Add all function imports to serverless.yml
- [ ] **Manual Testing:** Test all team operations and recommendation system
- [ ] **Types Export:** Export team types for use in other modules
- [ ] **Database Indexes:** Ensure GSI queries are optimized for team lookups
