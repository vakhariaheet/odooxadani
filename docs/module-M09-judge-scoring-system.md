# Module M09: Judge Scoring System

## Overview

**Estimated Time:** 1.5hr

**Complexity:** Complex

**Type:** Full-stack

**Risk Level:** Medium

**Dependencies:** F01 (Idea Management), F04 (Event Management)

## Problem Context

Judges need to pre-score submitted ideas, provide constructive feedback, and track their evaluation progress. This module enables structured scoring with criteria-based evaluation, AI-assisted feedback generation, and analytics for organizers to understand judging patterns.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler File:** Create `handlers/listJudgingAssignments.ts` for judge assignments
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'judging', 'read')`

- [ ] **Handler File:** Create `handlers/scoreIdea.ts` for idea scoring
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'judging', 'create')`

- [ ] **Handler File:** Create `handlers/updateScore.ts` for score updates
  - Pattern: `baseHandler` function + `export const handler = withRbacOwn(baseHandler, 'judging', 'update')`

- [ ] **Handler File:** Create `handlers/getJudgingStats.ts` for judge statistics
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'judging', 'read')`

- [ ] **Handler File:** Create `handlers/generateFeedback.ts` for AI-assisted feedback
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'judging', 'create')`

- [ ] **Function Config:** Create corresponding `.yml` files in `functions/` directory

- [ ] **Service Layer:** Business logic in `services/JudgingService.ts`
  - **MANDATORY AI Integration:** AI-powered feedback generation and scoring insights

- [ ] **AI Features Implementation:**
  - `generateConstructiveFeedback()` - AI-powered feedback suggestions
  - `analyzeScoreConsistency()` - AI analysis of judge scoring patterns
  - `suggestImprovements()` - AI recommendations for idea enhancement
  - `rankIdeasByScore()` - AI-assisted ranking with weighted criteria

### Frontend Tasks

- [ ] **Pages/Components:**
  - `JudgingDashboard.tsx` - Judge's main scoring interface
  - `IdeaScoringCard.tsx` - Individual idea scoring component
  - `ScoringCriteria.tsx` - Configurable scoring criteria
  - `FeedbackEditor.tsx` - Rich text feedback editor with AI assistance
  - `JudgingStats.tsx` - Judge performance and consistency metrics
  - `ScoreComparison.tsx` - Compare scores across judges

- [ ] **AI Features:**
  - AI-generated feedback suggestions
  - Scoring consistency analysis
  - Improvement recommendations display
  - Intelligent score validation

### Database Schema

```
pk: JUDGING#[eventId] | sk: ASSIGNMENT#[judgeId] | gsi1pk: JUDGE#[judgeId] | gsi1sk: EVENT#[eventId]
- eventId: string
- judgeId: string
- judgeName: string
- assignedIdeas: string[] (idea IDs assigned to this judge)
- completedScores: number (number of ideas scored)
- totalAssigned: number (total ideas assigned)
- assignedAt: string (ISO timestamp)
- status: string (active, completed, inactive)

pk: SCORE#[ideaId]#[judgeId] | sk: METADATA | gsi1pk: IDEA#[ideaId] | gsi1sk: JUDGE#[judgeId]
- ideaId: string
- judgeId: string
- judgeName: string
- eventId: string
- scores: ScoreCriteria (breakdown by criteria)
- totalScore: number (weighted total score)
- feedback: string (judge's written feedback)
- aiSuggestions: string[] (AI-generated improvement suggestions)
- timeSpent: number (minutes spent scoring)
- scoredAt: string (ISO timestamp)
- updatedAt: string (ISO timestamp)
- status: string (draft, submitted, final)

pk: JUDGING#[eventId] | sk: CRITERIA | gsi1pk: EVENT#[eventId] | gsi1sk: CRITERIA
- eventId: string
- criteria: JudgingCriteria[] (scoring criteria with weights)
- maxScore: number (maximum possible score)
- instructions: string (judging instructions)
- deadline: string (judging deadline)
- createdBy: string (organizer ID)
- createdAt: string (ISO timestamp)

pk: JUDGING#[eventId] | sk: STATS | gsi1pk: EVENT#[eventId] | gsi1sk: STATS
- eventId: string
- totalIdeas: number
- totalJudges: number
- completedScores: number
- averageScore: number
- scoreDistribution: number[] (histogram of scores)
- consistencyScore: number (AI-calculated judge consistency)
- topIdeas: string[] (highest scoring idea IDs)
- lastUpdated: string (ISO timestamp)
```

## Implementation Guide

### Service Layer Implementation

```typescript
// services/JudgingService.ts
import { geminiClient } from '../../../shared/clients/gemini';
import { dynamodb } from '../../../shared/clients/dynamodb';

export class JudgingService {
  async assignJudgesToIdeas(eventId: string, assignments: JudgeAssignment[]): Promise<void> {
    // Assign judges to specific ideas for scoring
  }

  async scoreIdea(scoreData: IdeaScore): Promise<Score> {
    // Save judge's score with AI-enhanced feedback
    const aiSuggestions = await this.generateConstructiveFeedback(
      scoreData.ideaId,
      scoreData.scores,
      scoreData.feedback
    );

    const score = {
      ...scoreData,
      aiSuggestions,
      scoredAt: new Date().toISOString(),
      status: 'submitted',
    };

    await dynamodb.put({
      PK: `SCORE#${scoreData.ideaId}#${scoreData.judgeId}`,
      SK: 'METADATA',
      GSI1PK: `IDEA#${scoreData.ideaId}`,
      GSI1SK: `JUDGE#${scoreData.judgeId}`,
      ...score,
    });

    // Update judging statistics
    await this.updateJudgingStats(scoreData.eventId);

    return score;
  }

  // MANDATORY: AI-powered feedback generation
  async generateConstructiveFeedback(
    ideaId: string,
    scores: ScoreCriteria,
    existingFeedback: string
  ): Promise<string[]> {
    const idea = await this.getIdeaForJudging(ideaId);

    const prompt = `Generate 3-5 constructive improvement suggestions for this hackathon idea based on the scores:

    Idea: ${idea.title}
    Description: ${idea.description}
    
    Scores (out of 10):
    - Innovation: ${scores.innovation}/10
    - Technical Feasibility: ${scores.feasibility}/10
    - Market Potential: ${scores.marketPotential}/10
    - Presentation: ${scores.presentation}/10
    - Team Fit: ${scores.teamFit}/10
    
    Existing Judge Feedback: ${existingFeedback}
    
    Provide specific, actionable suggestions that would help the team improve their idea and implementation. Focus on areas with lower scores but maintain an encouraging tone.`;

    const response = await geminiClient.generateJSON({
      prompt,
      schema: {
        type: 'object',
        properties: {
          suggestions: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    });

    return response.suggestions;
  }

  // MANDATORY: AI-powered scoring consistency analysis
  async analyzeScoreConsistency(eventId: string): Promise<ConsistencyAnalysis> {
    const allScores = await this.getAllScoresForEvent(eventId);

    const prompt = `Analyze the consistency of judge scoring for this hackathon event:
    
    Scores Data: ${JSON.stringify(
      allScores.map((s) => ({
        ideaId: s.ideaId,
        judgeId: s.judgeId,
        totalScore: s.totalScore,
        criteriaScores: s.scores,
      }))
    )}
    
    Analyze:
    1. Overall consistency score (1-10, where 10 is perfectly consistent)
    2. Judges who are outliers (too harsh or too lenient)
    3. Ideas with high score variance between judges
    4. Criteria where judges disagree most
    5. Recommendations for improving consistency
    
    Provide actionable insights for organizers.`;

    const response = await geminiClient.generateJSON({
      prompt,
      schema: {
        type: 'object',
        properties: {
          consistencyScore: { type: 'number' },
          outlierJudges: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                judgeId: { type: 'string' },
                issue: { type: 'string' },
                recommendation: { type: 'string' },
              },
            },
          },
          controversialIdeas: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                ideaId: { type: 'string' },
                scoreVariance: { type: 'number' },
                reason: { type: 'string' },
              },
            },
          },
          recommendations: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return response;
  }

  // MANDATORY: AI-powered idea ranking
  async rankIdeasByScore(eventId: string, criteria: RankingCriteria): Promise<RankedIdea[]> {
    const scores = await this.getAllScoresForEvent(eventId);

    const prompt = `Rank these hackathon ideas based on their scores and the specified criteria:
    
    Ideas and Scores: ${JSON.stringify(scores)}
    
    Ranking Criteria:
    - Innovation Weight: ${criteria.innovationWeight}%
    - Feasibility Weight: ${criteria.feasibilityWeight}%
    - Market Potential Weight: ${criteria.marketWeight}%
    - Presentation Weight: ${criteria.presentationWeight}%
    - Team Fit Weight: ${criteria.teamFitWeight}%
    
    Consider:
    1. Weighted average scores
    2. Judge consistency (penalize ideas with high variance)
    3. Number of judges who scored each idea
    4. Bonus for unanimous high scores
    
    Return ranked list with explanations.`;

    const response = await geminiClient.generateJSON({
      prompt,
      schema: {
        type: 'object',
        properties: {
          rankedIdeas: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                ideaId: { type: 'string' },
                rank: { type: 'number' },
                weightedScore: { type: 'number' },
                explanation: { type: 'string' },
              },
            },
          },
        },
      },
    });

    return response.rankedIdeas;
  }

  async getJudgingAssignments(judgeId: string): Promise<JudgeAssignment[]> {
    // Get ideas assigned to specific judge
  }

  async updateScore(scoreId: string, updates: Partial<IdeaScore>): Promise<Score> {
    // Update existing score
  }

  async getJudgingStats(eventId: string): Promise<JudgingStats> {
    // Get comprehensive judging statistics
  }
}
```

### Frontend Implementation

```typescript
// components/judging/JudgingDashboard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const JudgingDashboard = () => {
  const { data: assignments, loading } = useApi('/api/judging/assignments');
  const { data: stats } = useApi('/api/judging/stats');

  if (loading) return <div>Loading assignments...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Judging Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.remaining}</div>
              <div className="text-sm text-gray-600">Remaining</div>
            </div>
          </div>
          <Progress value={(stats.completed / stats.total) * 100} className="mb-2" />
          <p className="text-sm text-gray-600">
            {stats.completed} of {stats.total} ideas scored
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <Card key={assignment.ideaId} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium mb-2">{assignment.ideaTitle}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {assignment.ideaDescription}
                  </p>
                  <div className="flex items-center gap-2">
                    {assignment.status === 'completed' ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Scored
                      </Badge>
                    ) : assignment.status === 'in-progress' ? (
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        Draft
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant={assignment.status === 'completed' ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => navigateToScoring(assignment.ideaId)}
                >
                  {assignment.status === 'completed' ? 'Review' : 'Score'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
```

```typescript
// components/judging/IdeaScoringCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Sparkles } from 'lucide-react';

interface IdeaScoringCardProps {
  idea: Idea;
  onSubmitScore: (score: IdeaScore) => void;
}

export const IdeaScoringCard = ({ idea, onSubmitScore }: IdeaScoringCardProps) => {
  const [scores, setScores] = useState({
    innovation: 5,
    feasibility: 5,
    marketPotential: 5,
    presentation: 5,
    teamFit: 5
  });
  const [feedback, setFeedback] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const generateAIFeedback = async () => {
    const response = await fetch(`/api/judging/generate-feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ideaId: idea.id, scores, feedback })
    });
    const data = await response.json();
    setAiSuggestions(data.suggestions);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{idea.title}</span>
          <Badge variant="outline">{idea.category}</Badge>
        </CardTitle>
        <p className="text-gray-600">{idea.description}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scoring Criteria */}
        <div className="grid gap-6">
          {Object.entries(scores).map(([criterion, value]) => (
            <div key={criterion} className="space-y-2">
              <div className="flex justify-between">
                <label className="font-medium capitalize">
                  {criterion.replace(/([A-Z])/g, ' $1')}
                </label>
                <span className="text-sm font-medium">{value}/10</span>
              </div>
              <Slider
                value={[value]}
                onValueChange={([newValue]) =>
                  setScores(prev => ({ ...prev, [criterion]: newValue }))
                }
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          ))}
        </div>

        {/* Feedback Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-medium">Written Feedback</label>
            <Button
              variant="outline"
              size="sm"
              onClick={generateAIFeedback}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              AI Suggestions
            </Button>
          </div>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide constructive feedback to help the team improve their idea..."
            rows={4}
          />
        </div>

        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              AI-Generated Suggestions
            </h4>
            <div className="space-y-2">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className="text-sm">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">Save Draft</Button>
          <Button onClick={() => onSubmitScore({ ...scores, feedback, ideaId: idea.id })}>
            Submit Score
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
```

## Acceptance Criteria

- [ ] Judges can view assigned ideas and scoring criteria
- [ ] Structured scoring system with weighted criteria
- [ ] Rich feedback editor with AI-powered suggestions
- [ ] Progress tracking for judges and organizers
- [ ] **AI Feature Working:** Feedback generation, consistency analysis, and ranking functional
- [ ] **Demo Ready:** Can demonstrate complete judging workflow in 30 seconds
- [ ] **Integration:** Works with F01 (Ideas) and F04 (Events) seamlessly
- [ ] **Analytics:** Comprehensive judging statistics and insights

## Related Modules

- **Depends On:** F01 (Idea Management), F04 (Event Management)
- **Enables:** M12 (Advanced Analytics), M13 (Real-time Dashboard)
- **Conflicts With:** None
