# Module F04: Participant Profiles

## Overview

**Estimated Time:** 1hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Low

**Dependencies:** None

## Problem Context

Hackathon participants need comprehensive profiles to showcase their skills, experience, and preferences to potential teammates and judges. This module provides the profile management system where participants can highlight their technical abilities, past projects, and what they're looking for in hackathon experiences.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler Files:** Create profile management handlers
  - `handlers/getProfile.ts` - GET /api/profiles/:userId
  - `handlers/updateProfile.ts` - PUT /api/profiles/:userId
  - `handlers/listProfiles.ts` - GET /api/profiles (with search/filter)
  - `handlers/getMyProfile.ts` - GET /api/profiles/me
  - `handlers/uploadAvatar.ts` - POST /api/profiles/avatar

- [ ] **Function Configs:** Create serverless function configurations
  - `functions/getProfile.yml` - Get user profile by ID
  - `functions/updateProfile.yml` - Update own profile
  - `functions/listProfiles.yml` - Browse participant profiles
  - `functions/getMyProfile.yml` - Get current user's profile
  - `functions/uploadAvatar.yml` - Upload profile avatar to S3

- [ ] **Service Layer:** Business logic in `services/ProfileService.ts`
  - Profile CRUD operations with DynamoDB
  - Skill validation and normalization
  - Avatar upload to S3 with image processing
  - Profile completeness scoring
  - Search and filtering logic

- [ ] **Type Definitions:** Add types to `types.ts`
  - `UpdateProfileRequest`, `ProfileResponse`, `ProfileListResponse`
  - `SkillLevel`, `ExperienceLevel`, `AvailabilityStatus` enums
  - `ProfileCompleteness`, `SkillTag` interfaces

- [ ] **RBAC Verification:** Module already configured in permissions.ts
  - Participants can read any profiles, update own profile
  - Organizers can update any profiles
  - All users can read profiles for team formation

### Frontend Tasks

- [ ] **Components:** Create profile management UI
  - `components/profiles/ProfileCard.tsx` - Profile preview card
  - `components/profiles/ProfileForm.tsx` - Edit profile form
  - `components/profiles/ProfileView.tsx` - Full profile display
  - `components/profiles/SkillSelector.tsx` - Multi-select skill picker
  - `components/profiles/AvatarUpload.tsx` - Avatar upload with preview
  - `components/profiles/ProfileList.tsx` - Browse participant profiles

- [ ] **Pages:** Create profile-focused pages
  - `pages/profiles/MyProfilePage.tsx` - Edit own profile
  - `pages/profiles/ProfileViewPage.tsx` - View other user's profile
  - `pages/profiles/ProfilesListPage.tsx` - Browse all profiles
  - `pages/profiles/ProfileSetupPage.tsx` - Initial profile setup

- [ ] **API Integration:** Connect to backend
  - `hooks/useProfile.ts` - React Query hooks for profile operations
  - `services/profilesApi.ts` - API service functions

- [ ] **State Management:** Profile and skill state management
  - Form state for profile editing
  - Skill selection state
  - Avatar upload progress

- [ ] **Routing:** Add profile routes
  - `/profile` - Own profile (edit mode)
  - `/profiles` - Browse all profiles
  - `/profiles/:userId` - View specific profile
  - `/profile/setup` - Initial profile setup

### Database Schema (Single Table)

```
# Profile Entity
PK: USER#[userId] | SK: PROFILE | GSI1PK: SKILL#[skill] | GSI1SK: USER#[userId]
- userId: string (Clerk user ID)
- displayName: string (required, 2-50 chars)
- bio: string (optional, max 500 chars)
- avatar: string (S3 URL, optional)
- skills: SkillTag[] (array of skill objects)
- experience: 'beginner' | 'intermediate' | 'advanced' | 'expert'
- preferredRoles: string[] (e.g., 'Frontend Developer', 'Designer')
- techStack: string[] (preferred technologies)
- githubUrl?: string (optional)
- linkedinUrl?: string (optional)
- portfolioUrl?: string (optional)
- location?: string (city, country)
- timezone?: string (for team coordination)
- availability: 'available' | 'busy' | 'not_looking'
- hackathonExperience: number (number of hackathons attended)
- achievements: string[] (awards, notable projects)
- lookingFor: string[] (what they want from hackathons)
- completenessScore: number (0-100, calculated)
- createdAt: ISO string
- updatedAt: ISO string
- isPublic: boolean (profile visibility)

# Skill Tag Entity (for skill normalization)
PK: SKILL#[skillName] | SK: METADATA
- name: string (normalized skill name)
- category: string (e.g., 'Frontend', 'Backend', 'Design', 'Data')
- popularity: number (how many users have this skill)
- aliases: string[] (alternative names for the skill)
```

## Enhancement Features

### Enhancement Feature: AI-Powered Profile Optimization

**Problem Solved:** Participants often have incomplete or poorly written profiles that don't effectively showcase their abilities to potential teammates and judges.

**Enhancement Type:** AI - Uses Gemini AI to improve profile content and suggest missing elements

**User Trigger:** "Optimize Profile" button in profile edit form

**Input Requirements:**

- **Required Fields:** Basic profile information (name, bio, skills)
- **Optional Fields:** GitHub URL, portfolio links, experience level
- **Validation Rules:** Bio must be at least 50 characters, minimum 3 skills

**Processing Logic:**

1. **Profile Analysis:** Analyze current profile completeness and quality
2. **AI Enhancement:** Use Gemini to improve bio, suggest skills, recommend additions
3. **Completeness Scoring:** Calculate and display profile strength
4. **Personalized Suggestions:** Provide specific improvement recommendations

**COMPLETE IMPLEMENTATION SPECIFICATION:**

**Types Definition:**

```typescript
// types.ts - Add these exact types
export interface ProfileOptimizationRequest {
  currentProfile: {
    displayName: string;
    bio?: string;
    skills: string[];
    experience?: string;
    preferredRoles?: string[];
    githubUrl?: string;
    portfolioUrl?: string;
  };
  targetAudience?: 'teammates' | 'judges' | 'both';
}

export interface ProfileOptimizationResponse {
  optimizedBio: string;
  suggestedSkills: string[];
  missingElements: string[];
  strengthAreas: string[];
  improvementSuggestions: string[];
  completenessScore: number;
  beforeScore: number;
  confidence: number;
}

export interface SkillTag {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  yearsExperience?: number;
}
```

**Frontend Component:**

```typescript
// components/profiles/ProfileOptimizer.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileOptimizerProps {
  currentProfile: any;
  onOptimizationApplied: (optimizedData: any) => void;
}

export const ProfileOptimizer = ({ currentProfile, onOptimizationApplied }: ProfileOptimizerProps) => {
  const [optimization, setOptimization] = useState<ProfileOptimizationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasOptimized, setHasOptimized] = useState(false);

  const optimizeProfile = async () => {
    if (!currentProfile.bio || currentProfile.bio.length < 50) {
      toast.error('Please write at least 50 characters in your bio before optimizing');
      return;
    }

    if (!currentProfile.skills || currentProfile.skills.length < 3) {
      toast.error('Please add at least 3 skills before optimizing');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/profiles/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`
        },
        body: JSON.stringify({
          currentProfile: {
            displayName: currentProfile.displayName,
            bio: currentProfile.bio,
            skills: currentProfile.skills,
            experience: currentProfile.experience,
            preferredRoles: currentProfile.preferredRoles,
            githubUrl: currentProfile.githubUrl,
            portfolioUrl: currentProfile.portfolioUrl
          },
          targetAudience: 'both'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Optimization failed');
      }

      const data = await response.json();
      setOptimization(data.data);
      setHasOptimized(true);
    } catch (error) {
      console.error('Profile optimization error:', error);
      toast.error('Profile optimization failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyOptimization = () => {
    if (optimization) {
      onOptimizationApplied({
        bio: optimization.optimizedBio,
        suggestedSkills: optimization.suggestedSkills,
        improvementSuggestions: optimization.improvementSuggestions
      });
      toast.success('Profile optimization applied!');
    }
  };

  const currentScore = calculateProfileScore(currentProfile);

  return (
    <div className="space-y-6">
      {/* Current Profile Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Profile Strength
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Score</span>
              <span className="text-sm font-bold">{currentScore}/100</span>
            </div>
            <Progress value={currentScore} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {currentScore < 60 && "Your profile needs improvement to attract great teammates"}
              {currentScore >= 60 && currentScore < 80 && "Good profile! A few improvements could make it even better"}
              {currentScore >= 80 && "Excellent profile! You're ready to attract top teammates"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Button */}
      <div className="flex justify-center">
        <Button
          onClick={optimizeProfile}
          disabled={isLoading || currentProfile.bio?.length < 50 || currentProfile.skills?.length < 3}
          size="lg"
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Optimizing Profile...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Optimize My Profile
            </>
          )}
        </Button>
      </div>

      {/* Optimization Results */}
      {hasOptimized && optimization && (
        <div className="space-y-4">
          {/* Score Improvement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Optimization Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="font-medium text-green-800">Profile Score Improvement</div>
                  <div className="text-sm text-green-600">
                    {optimization.beforeScore} → {optimization.completenessScore}
                    (+{optimization.completenessScore - optimization.beforeScore} points)
                  </div>
                </div>
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>

              {/* Optimized Bio */}
              <div>
                <div className="text-sm font-medium mb-2">Enhanced Bio:</div>
                <div className="p-3 bg-muted rounded-lg text-sm">
                  {optimization.optimizedBio}
                </div>
              </div>

              {/* Suggested Skills */}
              {optimization.suggestedSkills.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Suggested Additional Skills:</div>
                  <div className="flex flex-wrap gap-2">
                    {optimization.suggestedSkills.map((skill) => (
                      <Badge key={skill} variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Strength Areas */}
              {optimization.strengthAreas.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Your Strengths:
                  </div>
                  <ul className="text-sm space-y-1">
                    {optimization.strengthAreas.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing Elements */}
              {optimization.missingElements.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    Consider Adding:
                  </div>
                  <ul className="text-sm space-y-1">
                    {optimization.missingElements.map((element, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-600">•</span>
                        <span>{element}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvement Suggestions */}
              {optimization.improvementSuggestions.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Improvement Tips:</div>
                  <ul className="text-sm space-y-1">
                    {optimization.improvementSuggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Apply Button */}
              <div className="flex gap-2 pt-2">
                <Button onClick={applyOptimization} className="flex-1">
                  Apply Optimization
                </Button>
                <Button variant="outline" onClick={() => setOptimization(null)}>
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Helper function to calculate profile completeness score
function calculateProfileScore(profile: any): number {
  let score = 0;

  // Basic info (30 points)
  if (profile.displayName) score += 10;
  if (profile.bio && profile.bio.length >= 50) score += 20;

  // Skills (25 points)
  if (profile.skills?.length >= 3) score += 15;
  if (profile.skills?.length >= 5) score += 10;

  // Experience (15 points)
  if (profile.experience) score += 10;
  if (profile.preferredRoles?.length > 0) score += 5;

  // Links (20 points)
  if (profile.githubUrl) score += 10;
  if (profile.portfolioUrl || profile.linkedinUrl) score += 10;

  // Additional info (10 points)
  if (profile.location) score += 5;
  if (profile.hackathonExperience > 0) score += 5;

  return Math.min(100, score);
}
```

**Backend Service Method:**

```typescript
// services/ProfileService.ts - Add this method
async optimizeProfile(params: ProfileOptimizationRequest): Promise<ProfileOptimizationResponse> {
  try {
    // Validate input
    if (!params.currentProfile.bio || params.currentProfile.bio.length < 50) {
      throw new Error('Bio must be at least 50 characters for optimization');
    }

    if (!params.currentProfile.skills || params.currentProfile.skills.length < 3) {
      throw new Error('At least 3 skills required for optimization');
    }

    // Calculate current profile score
    const beforeScore = this.calculateProfileCompleteness(params.currentProfile);

    // Use Gemini AI to optimize the profile
    const prompt = `You are a hackathon mentor helping participants optimize their profiles to attract great teammates and impress judges.

Current Profile:
- Name: ${params.currentProfile.displayName}
- Bio: "${params.currentProfile.bio}"
- Skills: ${params.currentProfile.skills.join(', ')}
- Experience: ${params.currentProfile.experience || 'Not specified'}
- Preferred Roles: ${params.currentProfile.preferredRoles?.join(', ') || 'Not specified'}
- GitHub: ${params.currentProfile.githubUrl || 'Not provided'}
- Portfolio: ${params.currentProfile.portfolioUrl || 'Not provided'}

Target Audience: ${params.targetAudience || 'both teammates and judges'}

Please provide:
1. An optimized bio that's more compelling and professional (keep it authentic but improve clarity and impact)
2. 3-5 additional skills they should consider adding based on their current skills
3. List what elements are missing from their profile
4. Identify their strength areas
5. Provide 3-4 specific improvement suggestions

Return as JSON with this structure:
{
  "optimizedBio": "improved bio here",
  "suggestedSkills": ["React Native", "GraphQL"],
  "missingElements": ["Portfolio link", "Location"],
  "strengthAreas": ["Strong technical skills", "Clear communication"],
  "improvementSuggestions": ["Add specific project examples", "Include hackathon experience"]
}`;

    const response = await geminiClient.generateJSON<{
      optimizedBio: string;
      suggestedSkills: string[];
      missingElements: string[];
      strengthAreas: string[];
      improvementSuggestions: string[];
    }>({
      prompt,
      maxTokens: 1500
    });

    // Calculate projected score with optimizations
    const projectedProfile = {
      ...params.currentProfile,
      bio: response.optimizedBio,
      skills: [...params.currentProfile.skills, ...response.suggestedSkills.slice(0, 3)]
    };
    const projectedScore = this.calculateProfileCompleteness(projectedProfile);

    return {
      optimizedBio: response.optimizedBio,
      suggestedSkills: response.suggestedSkills || [],
      missingElements: response.missingElements || [],
      strengthAreas: response.strengthAreas || [],
      improvementSuggestions: response.improvementSuggestions || [],
      completenessScore: Math.min(100, projectedScore),
      beforeScore,
      confidence: 0.85
    };
  } catch (error) {
    console.error('Profile optimization failed:', error);

    // Fallback to basic optimization
    return this.basicProfileOptimization(params.currentProfile, beforeScore);
  }
}

private calculateProfileCompleteness(profile: any): number {
  let score = 0;

  // Basic info (30 points)
  if (profile.displayName) score += 10;
  if (profile.bio && profile.bio.length >= 50) score += 20;

  // Skills (25 points)
  if (profile.skills?.length >= 3) score += 15;
  if (profile.skills?.length >= 5) score += 10;

  // Experience (15 points)
  if (profile.experience) score += 10;
  if (profile.preferredRoles?.length > 0) score += 5;

  // Links (20 points)
  if (profile.githubUrl) score += 10;
  if (profile.portfolioUrl) score += 10;

  // Additional info (10 points)
  if (profile.location) score += 5;
  if (profile.hackathonExperience > 0) score += 5;

  return Math.min(100, score);
}

private basicProfileOptimization(profile: any, beforeScore: number): ProfileOptimizationResponse {
  // Basic text improvements
  let optimizedBio = profile.bio.trim();

  // Capitalize first letter
  optimizedBio = optimizedBio.charAt(0).toUpperCase() + optimizedBio.slice(1);

  // Add period if missing
  if (!optimizedBio.match(/[.!?]$/)) {
    optimizedBio += '.';
  }

  // Basic structure improvements
  if (!optimizedBio.toLowerCase().includes('passionate') && !optimizedBio.toLowerCase().includes('experienced')) {
    optimizedBio = `Passionate ${profile.experience || 'developer'} with expertise in ${profile.skills.slice(0, 3).join(', ')}. ${optimizedBio}`;
  }

  const commonSkills = ['TypeScript', 'Git', 'Agile', 'Problem Solving', 'Team Collaboration'];
  const suggestedSkills = commonSkills.filter(skill =>
    !profile.skills.includes(skill)
  ).slice(0, 3);

  const missingElements = [];
  if (!profile.githubUrl) missingElements.push('GitHub profile link');
  if (!profile.portfolioUrl) missingElements.push('Portfolio or project showcase');
  if (!profile.location) missingElements.push('Location for team coordination');
  if (!profile.hackathonExperience) missingElements.push('Hackathon experience details');

  return {
    optimizedBio,
    suggestedSkills,
    missingElements,
    strengthAreas: ['Technical skills', 'Clear communication'],
    improvementSuggestions: [
      'Add specific examples of projects you\'ve worked on',
      'Include your hackathon experience and achievements',
      'Mention what you\'re looking to learn or build'
    ],
    completenessScore: Math.min(100, beforeScore + 15),
    beforeScore,
    confidence: 0.70
  };
}
```

**API Handler:**

```typescript
// handlers/optimizeProfile.ts
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { successResponse, errorResponse, handleAsyncError } from '../../../shared/response';
import { profileService } from '../services/ProfileService';
import { ProfileOptimizationRequest } from '../types';

/**
 * @route POST /api/profiles/optimize
 * @description Optimize user profile using AI
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const body: ProfileOptimizationRequest = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!body.currentProfile) {
      return errorResponse(400, 'MISSING_PROFILE', 'Current profile data is required');
    }

    if (!body.currentProfile.bio || body.currentProfile.bio.length < 50) {
      return errorResponse(400, 'BIO_TOO_SHORT', 'Bio must be at least 50 characters');
    }

    if (!body.currentProfile.skills || body.currentProfile.skills.length < 3) {
      return errorResponse(400, 'INSUFFICIENT_SKILLS', 'At least 3 skills are required');
    }

    // Call service
    const result = await profileService.optimizeProfile(body);

    return successResponse(result);
  } catch (error) {
    return handleAsyncError(error);
  }
};

export const handler = withRbac(baseHandler, 'profiles', 'update');
```

**Function Configuration:**

```yaml
# functions/optimizeProfile.yml
optimizeProfile:
  handler: src/modules/profiles/handlers/optimizeProfile.handler
  events:
    - httpApi:
        path: /api/profiles/optimize
        method: post
        authorizer:
          name: clerkJwtAuthorizer
  environment:
    GEMINI_API_KEY: ${env:GEMINI_API_KEY}
  timeout: 30
  memorySize: 512
```

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** Read `guidelines/project-architecture.md` COMPLETELY before writing any code.

### Step 1: Backend Implementation

**File Structure:**

```
backend/src/modules/profiles/
├── handlers/
│   ├── getProfile.ts
│   ├── updateProfile.ts
│   ├── listProfiles.ts
│   ├── getMyProfile.ts
│   ├── uploadAvatar.ts
│   └── optimizeProfile.ts
├── functions/
│   ├── getProfile.yml
│   ├── updateProfile.yml
│   ├── listProfiles.yml
│   ├── getMyProfile.yml
│   ├── uploadAvatar.yml
│   └── optimizeProfile.yml
├── services/
│   └── ProfileService.ts
└── types.ts
```

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── components/profiles/
│   ├── ProfileCard.tsx
│   ├── ProfileForm.tsx
│   ├── ProfileView.tsx
│   ├── SkillSelector.tsx
│   ├── AvatarUpload.tsx
│   ├── ProfileList.tsx
│   └── ProfileOptimizer.tsx
├── pages/profiles/
│   ├── MyProfilePage.tsx
│   ├── ProfileViewPage.tsx
│   ├── ProfilesListPage.tsx
│   └── ProfileSetupPage.tsx
├── hooks/
│   └── useProfile.ts
├── services/
│   └── profilesApi.ts
└── types/
    └── profile.ts
```

### Step 3: Integration

- [ ] **Type Check:** Run `bun run typecheck` in both backend and client
- [ ] **Test API:** Test all profile operations with Postman/curl
- [ ] **Connect Frontend:** Integrate React components with API
- [ ] **Verify Flow:** Test complete profile management workflow

## Acceptance Criteria

- [ ] Participants can create comprehensive profiles with skills, experience, and links
- [ ] Profile browsing works with search and filtering by skills and experience
- [ ] Avatar upload works with S3 integration and proper image handling
- [ ] AI optimization provides meaningful profile improvements and suggestions
- [ ] Profile completeness scoring helps users understand their profile strength
- [ ] Skill selector provides good UX for managing technical skills
- [ ] **Demo Ready:** Can create, optimize, and browse profiles in 30 seconds
- [ ] **Full-Stack Working:** All profile operations work end-to-end with S3 storage
- [ ] **Mobile Responsive:** Profile forms and views work perfectly on mobile

## Testing Checklist

- [ ] **Manual API Testing:**
  - Get profile by ID returns correct data
  - Update profile with valid data works
  - List profiles with search/filter works
  - Avatar upload to S3 functions properly
  - Profile optimization returns structured improvements

- [ ] **Frontend Testing:**
  - Profile form validates all fields correctly
  - Skill selector allows adding/removing skills
  - Avatar upload shows progress and preview
  - Profile optimization displays results clearly
  - Profile browsing and search work smoothly

- [ ] **Integration:** Complete profile management workflow works end-to-end
- [ ] **Edge Cases:** Handle missing profiles, upload failures, optimization errors
- [ ] **Performance:** Profile list loads quickly, optimization completes within 10 seconds

## Deployment Checklist

- [ ] **CRITICAL - Type Check:** Run `bun run typecheck` in both backend and client
- [ ] **Serverless Config:** Add all function imports to serverless.yml
- [ ] **S3 Configuration:** Ensure S3 bucket is configured for avatar uploads
- [ ] **Environment Variables:** Ensure GEMINI_API_KEY and S3 settings are configured
- [ ] **Manual Testing:** Test all profile operations and AI optimization
- [ ] **Types Export:** Export profile types for use in other modules
