# Module F01: Idea Pitch Management

## Overview

**Estimated Time:** 1hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Low

**Dependencies:** None

## Problem Context

Hackathon participants need a structured way to pitch their ideas, showcase technical requirements, and attract potential teammates. This module provides the core idea management system where participants can create detailed pitches, specify tech stacks, and indicate team size needs.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler Files:** Create CRUD handlers for idea management
  - `handlers/listIdeas.ts` - GET /api/ideas (with filtering/search)
  - `handlers/getIdea.ts` - GET /api/ideas/:id
  - `handlers/createIdea.ts` - POST /api/ideas
  - `handlers/updateIdea.ts` - PUT /api/ideas/:id
  - `handlers/deleteIdea.ts` - DELETE /api/ideas/:id

- [ ] **Function Configs:** Create serverless function configurations
  - `functions/listIdeas.yml` - List ideas with pagination and filters
  - `functions/getIdea.yml` - Get single idea details
  - `functions/createIdea.yml` - Create new idea pitch
  - `functions/updateIdea.yml` - Update existing idea
  - `functions/deleteIdea.yml` - Delete idea (owner only)

- [ ] **Service Layer:** Business logic in `services/IdeaService.ts`
  - Idea CRUD operations with DynamoDB
  - Input validation and sanitization
  - Tech stack parsing and validation
  - Team size validation (1-6 members)

- [ ] **Type Definitions:** Add types to `types.ts`
  - `CreateIdeaRequest`, `UpdateIdeaRequest`
  - `IdeaResponse`, `IdeaListResponse`
  - `TechStack`, `ComplexityLevel` enums

- [ ] **RBAC Verification:** Module already configured in permissions.ts
  - Participants can create/read/update/delete own ideas
  - All users can read any ideas
  - Organizers can moderate (update/delete any)

### Frontend Tasks

- [ ] **Components:** Create idea management UI
  - `components/ideas/IdeaList.tsx` - Grid/list view with search and filters
  - `components/ideas/IdeaCard.tsx` - Idea preview card with key details
  - `components/ideas/IdeaForm.tsx` - Create/edit form with rich text editor
  - `components/ideas/IdeaDetails.tsx` - Full idea view with team requirements

- [ ] **Pages:** Create idea-focused pages
  - `pages/ideas/IdeasListPage.tsx` - Browse all ideas
  - `pages/ideas/IdeaCreatePage.tsx` - Create new idea
  - `pages/ideas/IdeaEditPage.tsx` - Edit existing idea
  - `pages/ideas/IdeaViewPage.tsx` - View idea details

- [ ] **API Integration:** Connect to backend
  - `hooks/useIdeas.ts` - React Query hooks for idea operations
  - `services/ideasApi.ts` - API service functions

- [ ] **State Management:** Local state for forms and filters
  - Form state with react-hook-form
  - Filter state for search and categories
  - Loading states for all operations

- [ ] **Routing:** Add new routes
  - `/ideas` - List all ideas
  - `/ideas/new` - Create idea
  - `/ideas/:id` - View idea
  - `/ideas/:id/edit` - Edit idea

### Database Schema (Single Table)

```
PK: IDEA#[id] | SK: DETAILS | GSI1PK: USER#[creatorId] | GSI1SK: IDEA#[id]
- title: string (required, 3-100 chars)
- description: string (required, 10-2000 chars, markdown supported)
- problemStatement: string (required, 10-500 chars)
- proposedSolution: string (required, 10-1000 chars)
- techStack: string[] (required, 1-10 technologies)
- teamSizeNeeded: number (1-6)
- complexityLevel: 'beginner' | 'intermediate' | 'advanced'
- timeCommitment: 'weekend' | 'week' | 'month'
- creatorId: string (Clerk user ID)
- createdAt: ISO string
- updatedAt: ISO string
- status: 'draft' | 'published' | 'archived'
- tags: string[] (optional, for categorization)
```

## Enhancement Features

### Enhancement Feature: AI-Powered Idea Enhancement

**Problem Solved:** Participants often struggle to articulate their ideas clearly or miss important details that would attract teammates and judges.

**Enhancement Type:** AI - Leverages existing Gemini AI client for content improvement

**User Trigger:** "Enhance Description" button in idea creation/edit form

**Input Requirements:**

- **Required Fields:** Basic idea description (minimum 50 characters)
- **Optional Fields:** Target audience, tech preferences, complexity level
- **Validation Rules:** Description must be between 50-1000 characters

**Processing Logic:**

1. **Input Validation:** Check description length and content quality
2. **AI Enhancement:** Use Gemini to improve clarity, add structure, suggest missing elements
3. **Result Generation:** Return enhanced description with suggestions for tech stack and team roles
4. **Error Handling:** Fallback to basic text formatting if AI fails

**COMPLETE IMPLEMENTATION SPECIFICATION:**

**Types Definition:**

```typescript
// types.ts - Add these exact types
export interface EnhanceIdeaRequest {
  description: string;
  problemStatement?: string;
  targetAudience?: string;
  techPreferences?: string[];
  complexityLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface EnhanceIdeaResponse {
  enhancedDescription: string;
  suggestedTechStack: string[];
  recommendedTeamRoles: string[];
  improvementSuggestions: string[];
  confidence: number;
  timestamp: string;
}
```

**Frontend Component:**

```typescript
// components/ideas/IdeaEnhancementButton.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Sparkles, Loader2 } from 'lucide-react';

interface IdeaEnhancementButtonProps {
  description: string;
  onEnhanced: (result: EnhanceIdeaResponse) => void;
  disabled?: boolean;
}

export const IdeaEnhancementButton = ({
  description,
  onEnhanced,
  disabled = false
}: IdeaEnhancementButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EnhanceIdeaResponse | null>(null);

  const handleEnhance = async () => {
    if (!description.trim() || description.length < 50) {
      toast.error('Please write at least 50 characters before enhancing');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/ideas/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`
        },
        body: JSON.stringify({
          description: description.trim(),
          complexityLevel: 'intermediate'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Enhancement failed');
      }

      const data = await response.json();
      setResult(data.data);
    } catch (error) {
      console.error('Enhancement error:', error);
      toast.error('Enhancement failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const acceptEnhancement = () => {
    if (result) {
      onEnhanced(result);
      setResult(null);
      toast.success('Idea enhanced successfully!');
    }
  };

  return (
    <div className="enhancement-section">
      <Button
        onClick={handleEnhance}
        disabled={disabled || isLoading || description.length < 50}
        variant="outline"
        size="sm"
        className="ml-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Enhancing...
          </>
        ) : (
          <>
            <Sparkles className="w-3 h-3 mr-1" />
            Enhance with AI
          </>
        )}
      </Button>

      {result && (
        <div className="mt-4 p-4 bg-muted rounded-lg border">
          <div className="text-sm font-medium mb-2">
            AI Enhancement (confidence: {Math.round(result.confidence * 100)}%)
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Enhanced Description:</div>
              <div className="text-sm p-2 bg-background rounded border">
                {result.enhancedDescription}
              </div>
            </div>

            {result.suggestedTechStack.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Suggested Tech Stack:</div>
                <div className="flex flex-wrap gap-1">
                  {result.suggestedTechStack.map((tech, index) => (
                    <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.recommendedTeamRoles.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Recommended Team Roles:</div>
                <div className="text-sm">
                  {result.recommendedTeamRoles.join(', ')}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={acceptEnhancement}>
              Use Enhancement
            </Button>
            <Button size="sm" variant="outline" onClick={() => setResult(null)}>
              Dismiss
            </Button>
            <Button size="sm" variant="ghost" onClick={handleEnhance}>
              Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
```

**Backend Service Method:**

```typescript
// services/IdeaService.ts - Add this method
async enhanceIdea(params: EnhanceIdeaRequest): Promise<EnhanceIdeaResponse> {
  try {
    // Input validation
    if (!params.description?.trim()) {
      throw new Error('Description is required');
    }

    if (params.description.length < 50) {
      throw new Error('Description must be at least 50 characters');
    }

    if (params.description.length > 2000) {
      throw new Error('Description too long (max 2000 characters)');
    }

    // Use Gemini AI to enhance the idea
    const prompt = `You are a hackathon mentor helping participants improve their project ideas.

Enhance this idea description to be more compelling and complete:

"${params.description}"

${params.problemStatement ? `Problem context: ${params.problemStatement}` : ''}
${params.complexityLevel ? `Target complexity: ${params.complexityLevel}` : ''}
${params.techPreferences?.length ? `Preferred technologies: ${params.techPreferences.join(', ')}` : ''}

Please provide:
1. An enhanced, clearer description (keep the core idea but improve clarity and appeal)
2. Suggest 3-5 relevant technologies for the tech stack
3. Recommend 2-4 team roles needed (e.g., Frontend Developer, Backend Developer, UI/UX Designer, Data Scientist)
4. Brief improvement suggestions

Return as JSON with this structure:
{
  "enhancedDescription": "improved description here",
  "suggestedTechStack": ["React", "Node.js", "PostgreSQL"],
  "recommendedTeamRoles": ["Frontend Developer", "Backend Developer"],
  "improvementSuggestions": ["Add user personas", "Define success metrics"]
}`;

    const response = await geminiClient.generateJSON<{
      enhancedDescription: string;
      suggestedTechStack: string[];
      recommendedTeamRoles: string[];
      improvementSuggestions: string[];
    }>({
      prompt,
      maxTokens: 1000
    });

    return {
      enhancedDescription: response.enhancedDescription,
      suggestedTechStack: response.suggestedTechStack || [],
      recommendedTeamRoles: response.recommendedTeamRoles || [],
      improvementSuggestions: response.improvementSuggestions || [],
      confidence: 0.85,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Idea enhancement failed:', error);

    // Fallback to basic enhancement
    return {
      enhancedDescription: this.basicEnhancement(params.description),
      suggestedTechStack: this.suggestBasicTechStack(params.techPreferences),
      recommendedTeamRoles: ['Frontend Developer', 'Backend Developer'],
      improvementSuggestions: ['Add more technical details', 'Define target users'],
      confidence: 0.60,
      timestamp: new Date().toISOString()
    };
  }
}

private basicEnhancement(description: string): string {
  // Basic text improvements
  let enhanced = description.trim();

  // Capitalize first letter
  enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);

  // Add period if missing
  if (!enhanced.match(/[.!?]$/)) {
    enhanced += '.';
  }

  // Basic structure improvements
  if (!enhanced.includes('problem') && !enhanced.includes('solution')) {
    enhanced = `Problem: ${enhanced}\n\nSolution: This project aims to address the above challenge through innovative technology.`;
  }

  return enhanced;
}

private suggestBasicTechStack(preferences?: string[]): string[] {
  const commonStacks = [
    ['React', 'Node.js', 'MongoDB'],
    ['Vue.js', 'Express', 'PostgreSQL'],
    ['React Native', 'Firebase', 'TypeScript'],
    ['Python', 'Flask', 'SQLite'],
    ['Next.js', 'Prisma', 'Supabase']
  ];

  if (preferences?.length) {
    return preferences.slice(0, 5);
  }

  return commonStacks[Math.floor(Math.random() * commonStacks.length)];
}
```

**API Handler:**

```typescript
// handlers/enhanceIdea.ts
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedAPIGatewayEvent } from '../../../shared/types';
import { withRbac } from '../../../shared/auth/rbacMiddleware';
import { successResponse, errorResponse, handleAsyncError } from '../../../shared/response';
import { ideaService } from '../services/IdeaService';
import { EnhanceIdeaRequest } from '../types';

/**
 * @route POST /api/ideas/enhance
 * @description Enhance idea description using AI
 */
const baseHandler = async (
  event: AuthenticatedAPIGatewayEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const body: EnhanceIdeaRequest = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!body.description) {
      return errorResponse(400, 'MISSING_DESCRIPTION', 'Description is required');
    }

    if (body.description.length < 50) {
      return errorResponse(
        400,
        'DESCRIPTION_TOO_SHORT',
        'Description must be at least 50 characters'
      );
    }

    if (body.description.length > 2000) {
      return errorResponse(
        400,
        'DESCRIPTION_TOO_LONG',
        'Description must be less than 2000 characters'
      );
    }

    // Call service
    const result = await ideaService.enhanceIdea(body);

    return successResponse(result);
  } catch (error) {
    return handleAsyncError(error);
  }
};

export const handler = withRbac(baseHandler, 'ideas', 'create');
```

**Function Configuration:**

```yaml
# functions/enhanceIdea.yml
enhanceIdea:
  handler: src/modules/ideas/handlers/enhanceIdea.handler
  events:
    - httpApi:
        path: /api/ideas/enhance
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
backend/src/modules/ideas/
├── handlers/
│   ├── listIdeas.ts
│   ├── getIdea.ts
│   ├── createIdea.ts
│   ├── updateIdea.ts
│   ├── deleteIdea.ts
│   └── enhanceIdea.ts
├── functions/
│   ├── listIdeas.yml
│   ├── getIdea.yml
│   ├── createIdea.yml
│   ├── updateIdea.yml
│   ├── deleteIdea.yml
│   └── enhanceIdea.yml
├── services/
│   └── IdeaService.ts
└── types.ts
```

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── components/ideas/
│   ├── IdeaList.tsx
│   ├── IdeaCard.tsx
│   ├── IdeaForm.tsx
│   ├── IdeaDetails.tsx
│   └── IdeaEnhancementButton.tsx
├── pages/ideas/
│   ├── IdeasListPage.tsx
│   ├── IdeaCreatePage.tsx
│   ├── IdeaEditPage.tsx
│   └── IdeaViewPage.tsx
├── hooks/
│   └── useIdeas.ts
├── services/
│   └── ideasApi.ts
└── types/
    └── idea.ts
```

### Step 3: Integration

- [ ] **Type Check:** Run `bun run typecheck` in both backend and client
- [ ] **Test API:** Test endpoints with Postman/curl
- [ ] **Connect Frontend:** Integrate React components with API
- [ ] **Verify Flow:** Test complete idea creation and management flow

## Acceptance Criteria

- [ ] Participants can create detailed idea pitches with all required fields
- [ ] Ideas display properly in list and detail views with responsive design
- [ ] Search and filtering work for browsing ideas by tech stack and complexity
- [ ] AI enhancement provides meaningful improvements to idea descriptions
- [ ] Only idea creators can edit/delete their own ideas
- [ ] **Demo Ready:** Can create, enhance, and display ideas in 30 seconds
- [ ] **Full-Stack Working:** Frontend connects to backend, data persists in DynamoDB
- [ ] **Mobile Responsive:** All idea forms and views work on mobile devices

## Testing Checklist

- [ ] **Manual API Testing:**
  - Create idea with valid data returns 201
  - Get idea by ID returns correct data
  - List ideas with pagination works
  - Update idea (owner only) works
  - Delete idea (owner only) works
  - AI enhancement returns structured response

- [ ] **Frontend Testing:**
  - Idea creation form validates all fields
  - Idea list displays with proper formatting
  - Search and filters work correctly
  - AI enhancement button shows loading states
  - Mobile responsive design works

- [ ] **Integration:** Complete idea management flow works end-to-end
- [ ] **Edge Cases:** Handle network errors, validation failures gracefully
- [ ] **Performance:** Idea list loads quickly, AI enhancement completes within 10 seconds

## Deployment Checklist

- [ ] **CRITICAL - Type Check:** Run `bun run typecheck` in both backend and client
- [ ] **Serverless Config:** Add function imports to serverless.yml
- [ ] **Environment Variables:** Ensure GEMINI_API_KEY is configured
- [ ] **Manual Testing:** Test all CRUD operations and AI enhancement
- [ ] **Types Export:** Export idea types for use in other modules
