# Module M05: Advanced Idea Features

## Overview

**Estimated Time:** 1hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Low

**Dependencies:** F01 (Idea Management)

## Problem Context

Building on the basic idea management system, this module adds advanced features like idea collaboration, version history, idea templates, and enhanced AI-powered insights to make idea development more sophisticated and collaborative.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler File:** Create `handlers/collaborateIdea.ts` for idea collaboration
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'ideas', 'update')`

- [ ] **Handler File:** Create `handlers/forkIdea.ts` for idea forking/templating
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'ideas', 'create')`

- [ ] **Handler File:** Create `handlers/getIdeaHistory.ts` for version history
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'ideas', 'read')`

- [ ] **Handler File:** Create `handlers/getIdeaInsights.ts` for AI-powered insights
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'ideas', 'read')`

- [ ] **Function Config:** Create corresponding `.yml` files in `functions/` directory

- [ ] **Service Layer:** Extend `services/IdeaService.ts` with advanced features
  - **MANDATORY AI Integration:** Enhanced AI features for idea development

- [ ] **AI Features Implementation:**
  - `generateIdeaVariations()` - AI-powered idea variations and improvements
  - `analyzeMarketPotential()` - AI assessment of market viability
  - `suggestImplementationPlan()` - AI-generated development roadmap
  - `compareIdeas()` - AI-powered idea comparison and analysis

### Frontend Tasks

- [ ] **Pages/Components:**
  - `IdeaCollaboration.tsx` - Collaborative editing interface
  - `IdeaVersionHistory.tsx` - Version history and diff viewer
  - `IdeaInsights.tsx` - AI-powered insights dashboard
  - `IdeaTemplates.tsx` - Template gallery and creation
  - `IdeaComparison.tsx` - Side-by-side idea comparison

- [ ] **AI Features:**
  - Idea variation suggestions with AI explanations
  - Market potential visualization with AI insights
  - Implementation roadmap with AI-generated milestones
  - Intelligent idea comparison matrix

### Database Schema Extensions

```
pk: IDEA#[id] | sk: VERSION#[timestamp] | gsi1pk: IDEA#[id] | gsi1sk: VERSION#[timestamp]
- ideaId: string
- version: number
- changes: string[] (list of changes made)
- changedBy: string (user ID)
- changedAt: string (ISO timestamp)
- content: IdeaContent (full idea content at this version)

pk: IDEA#[id] | sk: COLLABORATION#[userId] | gsi1pk: USER#[userId] | gsi1sk: COLLABORATED#[timestamp]
- ideaId: string
- userId: string
- userName: string
- role: string (owner, collaborator, viewer)
- permissions: string[] (edit, comment, share)
- invitedAt: string (ISO timestamp)
- acceptedAt: string (ISO timestamp, optional)

pk: IDEA#[id] | sk: INSIGHTS | gsi1pk: IDEA#[id] | gsi1sk: INSIGHTS
- ideaId: string
- marketPotential: number (AI score 1-10)
- implementationComplexity: number (AI score 1-10)
- uniquenessScore: number (AI score 1-10)
- recommendedSkills: string[] (AI-suggested skills)
- implementationPlan: Milestone[] (AI-generated roadmap)
- similarIdeas: string[] (related idea IDs)
- lastAnalyzed: string (ISO timestamp)
```

## Implementation Guide

### Service Layer Extensions

```typescript
// Extend services/IdeaService.ts
export class IdeaService {
  // ... existing methods ...

  // MANDATORY: AI-powered idea variations
  async generateIdeaVariations(ideaId: string): Promise<IdeaVariation[]> {
    const idea = await this.getIdea(ideaId);

    const prompt = `Generate 3 creative variations of this hackathon idea:
    
    Original Idea: ${idea.title}
    Description: ${idea.description}
    Skills: ${idea.skills.join(', ')}
    
    For each variation, provide:
    1. A new title
    2. Modified description highlighting the key difference
    3. Additional skills that might be needed
    4. Brief explanation of what makes this variation unique
    
    Focus on different approaches, target audiences, or technical implementations.`;

    const response = await geminiClient.generateJSON({
      prompt,
      schema: {
        type: 'object',
        properties: {
          variations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                additionalSkills: { type: 'array', items: { type: 'string' } },
                uniqueAspect: { type: 'string' },
              },
            },
          },
        },
      },
    });

    return response.variations;
  }

  // MANDATORY: AI-powered market analysis
  async analyzeMarketPotential(ideaId: string): Promise<MarketAnalysis> {
    const idea = await this.getIdea(ideaId);

    const prompt = `Analyze the market potential of this hackathon idea:
    
    Idea: ${idea.title}
    Description: ${idea.description}
    Category: ${idea.category}
    
    Provide analysis on:
    1. Market size and opportunity (score 1-10)
    2. Competition level (score 1-10, where 10 is highly competitive)
    3. Technical feasibility (score 1-10)
    4. Monetization potential (score 1-10)
    5. Target audience size (score 1-10)
    
    Also provide brief explanations for each score.`;

    const response = await geminiClient.generateJSON({
      prompt,
      schema: {
        type: 'object',
        properties: {
          marketSize: { type: 'number' },
          competition: { type: 'number' },
          feasibility: { type: 'number' },
          monetization: { type: 'number' },
          audienceSize: { type: 'number' },
          explanations: {
            type: 'object',
            properties: {
              marketSize: { type: 'string' },
              competition: { type: 'string' },
              feasibility: { type: 'string' },
              monetization: { type: 'string' },
              audienceSize: { type: 'string' },
            },
          },
        },
      },
    });

    return response;
  }

  // MANDATORY: AI-powered implementation planning
  async suggestImplementationPlan(ideaId: string): Promise<ImplementationPlan> {
    const idea = await this.getIdea(ideaId);

    const prompt = `Create a detailed implementation plan for this hackathon idea:
    
    Idea: ${idea.title}
    Description: ${idea.description}
    Skills Available: ${idea.skills.join(', ')}
    Team Size: ${idea.teamSize}
    
    Create a plan with:
    1. 6-8 milestones for a 24-48 hour hackathon
    2. Each milestone should have: title, description, estimated hours, required skills
    3. Prioritize MVP features first, then enhancements
    4. Consider team size and skill distribution
    
    Focus on achievable goals within hackathon timeframe.`;

    const response = await geminiClient.generateJSON({
      prompt,
      schema: {
        type: 'object',
        properties: {
          milestones: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                estimatedHours: { type: 'number' },
                requiredSkills: { type: 'array', items: { type: 'string' } },
                priority: { type: 'string' },
              },
            },
          },
          totalEstimatedHours: { type: 'number' },
          riskFactors: { type: 'array', items: { type: 'string' } },
          successTips: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return response;
  }

  async addCollaborator(ideaId: string, userId: string, role: string): Promise<void> {
    // Add collaborator to idea with permissions
  }

  async forkIdea(ideaId: string, userId: string, modifications: IdeaModifications): Promise<Idea> {
    // Create new idea based on existing one
  }

  async getIdeaHistory(ideaId: string): Promise<IdeaVersion[]> {
    // Retrieve version history for idea
  }
}
```

### Frontend Implementation

```typescript
// components/ideas/IdeaInsights.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, DollarSign, Zap } from 'lucide-react';

interface IdeaInsightsProps {
  ideaId: string;
}

export const IdeaInsights = ({ ideaId }: IdeaInsightsProps) => {
  const { data: insights, loading } = useApi(`/api/ideas/${ideaId}/insights`);

  if (loading) return <div>Loading insights...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Market Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Market Size</span>
                <span>{insights.marketSize}/10</span>
              </div>
              <Progress value={insights.marketSize * 10} />
              <p className="text-sm text-gray-600 mt-1">{insights.explanations.marketSize}</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span>Monetization</span>
                <span>{insights.monetization}/10</span>
              </div>
              <Progress value={insights.monetization * 10} />
              <p className="text-sm text-gray-600 mt-1">{insights.explanations.monetization}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Implementation Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.implementationPlan.milestones.map((milestone, index) => (
              <div key={index} className="border-l-2 border-blue-500 pl-4">
                <h4 className="font-medium">{milestone.title}</h4>
                <p className="text-sm text-gray-600">{milestone.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{milestone.estimatedHours}h</Badge>
                  <Badge variant="secondary">{milestone.priority}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

## Acceptance Criteria

- [ ] Idea collaboration system allows multiple users to edit and comment
- [ ] Version history tracks all changes with diff visualization
- [ ] AI-powered idea variations provide creative alternatives
- [ ] Market analysis gives actionable insights on viability
- [ ] Implementation planning provides realistic hackathon roadmap
- [ ] **AI Feature Working:** All AI-powered insights and recommendations functional
- [ ] **Demo Ready:** Can demonstrate advanced idea development workflow in 30 seconds
- [ ] **Integration:** Seamlessly extends F01 (Idea Management) functionality

## Related Modules

- **Depends On:** F01 (Idea Management)
- **Enables:** M09 (Judge Scoring), M11 (Cross-Platform Integration)
- **Conflicts With:** None
