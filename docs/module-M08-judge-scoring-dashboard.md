# Module M08: Judge Scoring Dashboard

## Overview

**Estimated Time:** 1.5hr

**Complexity:** Complex

**Type:** Full-stack

**Risk Level:** Medium

**Dependencies:** F01 (Idea Pitch Management), F04 (Participant Profiles)

## Problem Context

Hackathon judges need a dedicated interface to evaluate ideas before events begin, providing early feedback that helps participants refine their concepts. This module creates a comprehensive judging system where qualified judges can score ideas on multiple criteria, leave detailed feedback, and help surface the most promising concepts for the community.

## Technical Requirements

**Module Type:** Full-stack (Integration module - creates judge-specific interface for F01 data)

### Backend Tasks

- [ ] **Handler Files:** Create judge-specific handlers
  - `handlers/getJudgeIdeas.ts` - GET /api/judges/ideas (ideas assigned to judge)
  - `handlers/scoreIdea.ts` - POST /api/judges/ideas/:id/score
  - `handlers/getIdeaScores.ts` - GET /api/judges/ideas/:id/scores
  - `handlers/updateScore.ts` - PUT /api/judges/scores/:scoreId
  - `handlers/getJudgingStats.ts` - GET /api/judges/stats
  - `handlers/exportScores.ts` - GET /api/judges/export

- [ ] **Function Configs:** Create serverless function configurations
  - `functions/getJudgeIdeas.yml` - Get ideas for judging
  - `functions/scoreIdea.yml` - Submit idea score and feedback
  - `functions/getIdeaScores.yml` - Get all scores for an idea
  - `functions/updateScore.yml` - Update existing score
  - `functions/getJudgingStats.yml` - Judge performance statistics
  - `functions/exportScores.yml` - Export scores for analysis

- [ ] **Service Layer:** Create judging service
  - `services/JudgingService.ts` - Judge-specific operations
  - Scoring algorithm and validation
  - Judge assignment and workload balancing
  - Feedback quality assessment
  - Score aggregation and ranking
  - Bias detection and mitigation

- [ ] **Type Definitions:** Add judging types
  - `JudgeScoreRequest`, `ScoreResponse`, `JudgingCriteria`
  - `ScoreBreakdown`, `JudgeFeedback`, `JudgingStats` interfaces
  - `ScoringRubric`, `JudgeAssignment` types

- [ ] **RBAC Verification:** Module already configured in permissions.ts
  - Judges can score assigned ideas and view scoring interface
  - Organizers can view all scores and manage judge assignments
  - Participants can view aggregated scores (not individual judge scores)

### Frontend Tasks

- [ ] **Components:** Create judge-specific UI
  - `components/judges/JudgeDashboard.tsx` - Main judge interface
  - `components/judges/IdeaScoringCard.tsx` - Individual idea scoring
  - `components/judges/ScoringRubric.tsx` - Scoring criteria display
  - `components/judges/FeedbackForm.tsx` - Detailed feedback input
  - `components/judges/JudgingProgress.tsx` - Progress tracking
  - `components/judges/ScoresSummary.tsx` - Aggregated scores view

- [ ] **Pages:** Create judge-focused pages
  - `pages/judges/JudgeDashboardPage.tsx` - Main judge interface
  - `pages/judges/IdeaScoringPage.tsx` - Score individual idea
  - `pages/judges/JudgingStatsPage.tsx` - Judge performance stats
  - `pages/judges/ScoringHistoryPage.tsx` - Previous scoring history

- [ ] **API Integration:** Create judge-specific hooks
  - `hooks/useJudging.ts` - Judge operations and scoring
  - `services/judgingApi.ts` - Judge API service functions

- [ ] **State Management:** Judging workflow state
  - Scoring form state with validation
  - Progress tracking across multiple ideas
  - Draft score management

- [ ] **Routing:** Add judge routes
  - `/judge` - Judge dashboard (protected, judge role only)
  - `/judge/ideas/:id/score` - Score specific idea
  - `/judge/stats` - Judging statistics
  - `/judge/history` - Scoring history

### Database Schema (Single Table)

```
# Judge Score Entity
PK: IDEA#[ideaId] | SK: SCORE#[judgeId] | GSI1PK: JUDGE#[judgeId] | GSI1SK: SCORE#[ideaId]
- scoreId: string (UUID)
- ideaId: string
- judgeId: string (Clerk user ID)
- scoringCriteria: {
  innovation: number (1-10)
  feasibility: number (1-10)
  impact: number (1-10)
  presentation: number (1-10)
  marketPotential: number (1-10)
}
- overallScore: number (calculated average)
- feedback: {
  strengths: string[] (what judge liked)
  improvements: string[] (suggestions for improvement)
  detailedComments: string (optional, max 1000 chars)
}
- confidence: number (1-5, judge's confidence in their score)
- timeSpent: number (minutes spent reviewing)
- scoredAt: ISO string
- updatedAt: ISO string
- isPublic: boolean (whether participant can see this score)
- judgeProfile: { name: string, expertise: string[] } (denormalized)

# Judge Assignment Entity
PK: JUDGE#[judgeId] | SK: ASSIGNMENT#[ideaId]
- judgeId: string
- ideaId: string
- assignedAt: ISO string
- status: 'pending' | 'in_progress' | 'completed' | 'skipped'
- priority: number (1-5, assignment priority)
- deadline?: ISO string (optional scoring deadline)

# Judging Statistics
PK: JUDGE#[judgeId] | SK: STATS#[period]
- judgeId: string
- period: string (e.g., '2024-01', 'all-time')
- ideasScored: number
- averageScore: number
- averageTimePerIdea: number (minutes)
- feedbackQuality: number (1-5, based on feedback length and detail)
- consistencyScore: number (how consistent scores are)
- lastActive: ISO string
```

## Enhancement Features

### Enhancement Feature: AI-Powered Scoring Assistance

**Problem Solved:** Judges may have unconscious bias, inconsistent scoring standards, or miss important aspects of ideas that could affect fair evaluation.

**Enhancement Type:** AI - Uses Gemini AI to provide scoring suggestions and bias detection

**User Trigger:** "Get AI Scoring Assistance" button in idea scoring interface

**Input Requirements:**

- **Required Fields:** Idea details (title, description, tech stack)
- **Optional Fields:** Judge's preliminary scores, specific focus areas
- **Validation Rules:** Idea must have complete description and tech stack

**Processing Logic:**

1. **Idea Analysis:** AI analyzes idea for innovation, feasibility, and impact
2. **Scoring Suggestions:** Provides suggested scores with reasoning
3. **Bias Detection:** Identifies potential bias indicators in scoring
4. **Quality Feedback:** Suggests areas for detailed feedback

**COMPLETE IMPLEMENTATION SPECIFICATION:**

**Types Definition:**

```typescript
// types.ts - Add these exact types
export interface AIJudgingRequest {
  idea: {
    title: string;
    description: string;
    problemStatement: string;
    proposedSolution: string;
    techStack: string[];
    targetAudience?: string;
    marketSize?: string;
  };
  judgeExpertise?: string[];
  preliminaryScores?: {
    innovation?: number;
    feasibility?: number;
    impact?: number;
    presentation?: number;
    marketPotential?: number;
  };
}

export interface AIJudgingResponse {
  suggestedScores: {
    innovation: { score: number; reasoning: string };
    feasibility: { score: number; reasoning: string };
    impact: { score: number; reasoning: string };
    presentation: { score: number; reasoning: string };
    marketPotential: { score: number; reasoning: string };
  };
  overallAssessment: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  biasAlerts: string[];
  confidenceLevel: number;
  focusAreas: string[];
}

export interface JudgeScoreRequest {
  ideaId: string;
  scoringCriteria: {
    innovation: number;
    feasibility: number;
    impact: number;
    presentation: number;
    marketPotential: number;
  };
  feedback: {
    strengths: string[];
    improvements: string[];
    detailedComments?: string;
  };
  confidence: number;
  timeSpent: number;
  isPublic: boolean;
}
```

**Frontend Component:**

```typescript
// components/judges/IdeaScoringInterface.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  Star,
  Lightbulb,
  Target,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface IdeaScoringInterfaceProps {
  idea: any;
  onScoreSubmit: (score: JudgeScoreRequest) => void;
}

export const IdeaScoringInterface = ({ idea, onScoreSubmit }: IdeaScoringInterfaceProps) => {
  const [scores, setScores] = useState({
    innovation: 5,
    feasibility: 5,
    impact: 5,
    presentation: 5,
    marketPotential: 5
  });

  const [feedback, setFeedback] = useState({
    strengths: [] as string[],
    improvements: [] as string[],
    detailedComments: ''
  });

  const [confidence, setConfidence] = useState(3);
  const [aiAssistance, setAiAssistance] = useState<AIJudgingResponse | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [startTime] = useState(Date.now());

  const getAIAssistance = async () => {
    setIsLoadingAI(true);
    try {
      const response = await fetch('/api/judges/ai-assistance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`
        },
        body: JSON.stringify({
          idea: {
            title: idea.title,
            description: idea.description,
            problemStatement: idea.problemStatement,
            proposedSolution: idea.proposedSolution,
            techStack: idea.techStack
          },
          preliminaryScores: scores
        })
      });

      if (!response.ok) {
        throw new Error('AI assistance failed');
      }

      const data = await response.json();
      setAiAssistance(data.data);
    } catch (error) {
      console.error('AI assistance error:', error);
      toast.error('AI assistance unavailable. Continue with manual scoring.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const applySuggestedScore = (criterion: string, suggestedScore: number) => {
    setScores(prev => ({
      ...prev,
      [criterion]: suggestedScore
    }));
  };

  const addFeedbackItem = (type: 'strengths' | 'improvements', item: string) => {
    if (item.trim()) {
      setFeedback(prev => ({
        ...prev,
        [type]: [...prev[type], item.trim()]
      }));
    }
  };

  const removeFeedbackItem = (type: 'strengths' | 'improvements', index: number) => {
    setFeedback(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 60000); // minutes

    onScoreSubmit({
      ideaId: idea.id,
      scoringCriteria: scores,
      feedback,
      confidence,
      timeSpent,
      isPublic: true
    });
  };

  const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / 5;

  const scoringCriteria = [
    {
      key: 'innovation',
      label: 'Innovation',
      icon: Lightbulb,
      description: 'How novel and creative is the idea?'
    },
    {
      key: 'feasibility',
      label: 'Feasibility',
      icon: CheckCircle,
      description: 'How realistic is the implementation?'
    },
    {
      key: 'impact',
      label: 'Impact',
      icon: Target,
      description: 'How significant is the potential impact?'
    },
    {
      key: 'presentation',
      label: 'Presentation',
      icon: Star,
      description: 'How well is the idea communicated?'
    },
    {
      key: 'marketPotential',
      label: 'Market Potential',
      icon: DollarSign,
      description: 'What is the commercial viability?'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Idea Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{idea.title}</span>
            <Badge variant="outline">
              Overall: {overallScore.toFixed(1)}/10
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{idea.description}</p>

          {idea.techStack && (
            <div className="flex flex-wrap gap-2">
              {idea.techStack.map((tech: string) => (
                <Badge key={tech} variant="secondary">{tech}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="scoring" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scoring">Scoring</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="ai-assist">AI Assistance</TabsTrigger>
        </TabsList>

        <TabsContent value="scoring" className="space-y-4">
          {/* Scoring Interface */}
          {scoringCriteria.map((criterion) => {
            const Icon = criterion.icon;
            const aiSuggestion = aiAssistance?.suggestedScores[criterion.key as keyof typeof aiAssistance.suggestedScores];

            return (
              <Card key={criterion.key}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium">{criterion.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {criterion.description}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {scores[criterion.key as keyof typeof scores]}
                      </div>
                      <div className="text-xs text-muted-foreground">/ 10</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Slider
                      value={[scores[criterion.key as keyof typeof scores]]}
                      onValueChange={([value]) =>
                        setScores(prev => ({ ...prev, [criterion.key]: value }))
                      }
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />

                    {aiSuggestion && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-blue-800">
                            AI Suggestion: {aiSuggestion.score}/10
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => applySuggestedScore(criterion.key, aiSuggestion.score)}
                            className="text-xs"
                          >
                            Apply
                          </Button>
                        </div>
                        <div className="text-xs text-blue-700">
                          {aiSuggestion.reasoning}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Confidence Level */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Confidence Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">How confident are you in this scoring?</span>
                  <Badge variant="outline">{confidence}/5</Badge>
                </div>
                <Slider
                  value={[confidence]}
                  onValueChange={([value]) => setConfidence(value)}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground">
                  1 = Very uncertain, 5 = Very confident
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          {/* Feedback Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {feedback.strengths.map((strength, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                    <span className="flex-1 text-sm">{strength}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFeedbackItem('strengths', index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a strength..."
                    className="flex-1 px-3 py-2 border rounded text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addFeedbackItem('strengths', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {feedback.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                    <span className="flex-1 text-sm">{improvement}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFeedbackItem('improvements', index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add an improvement suggestion..."
                    className="flex-1 px-3 py-2 border rounded text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addFeedbackItem('improvements', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Additional detailed feedback for the participant..."
                value={feedback.detailedComments}
                onChange={(e) => setFeedback(prev => ({
                  ...prev,
                  detailedComments: e.target.value
                }))}
                rows={4}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-assist" className="space-y-4">
          {/* AI Assistance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI Scoring Assistance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!aiAssistance ? (
                <div className="text-center py-8">
                  <Button
                    onClick={getAIAssistance}
                    disabled={isLoadingAI}
                    className="flex items-center gap-2"
                  >
                    {isLoadingAI ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Analyzing idea...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" />
                        Get AI Scoring Suggestions
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    AI will analyze the idea and provide scoring suggestions
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Overall Assessment */}
                  <div>
                    <h4 className="font-medium mb-2">Overall Assessment</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-green-700 mb-1">Strengths:</div>
                        <ul className="text-sm space-y-1">
                          {aiAssistance.overallAssessment.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span className="text-green-600">•</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-orange-700 mb-1">Areas to Consider:</div>
                        <ul className="text-sm space-y-1">
                          {aiAssistance.overallAssessment.weaknesses.map((weakness, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span className="text-orange-600">•</span>
                              <span>{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Bias Alerts */}
                  {aiAssistance.biasAlerts.length > 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="text-sm font-medium text-yellow-800 mb-1">
                        Potential Bias Considerations:
                      </div>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {aiAssistance.biasAlerts.map((alert, index) => (
                          <li key={index}>• {alert}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Focus Areas */}
                  <div>
                    <div className="text-sm font-medium mb-2">Recommended Focus Areas:</div>
                    <div className="flex flex-wrap gap-2">
                      {aiAssistance.focusAreas.map((area) => (
                        <Badge key={area} variant="outline">{area}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Time spent: {Math.round((Date.now() - startTime) / 60000)} minutes</span>
        </div>

        <Button
          onClick={handleSubmit}
          size="lg"
          disabled={feedback.strengths.length === 0 && feedback.improvements.length === 0}
        >
          Submit Score & Feedback
        </Button>
      </div>
    </div>
  );
};
```

**Backend Service Method:**

```typescript
// services/JudgingService.ts
export class JudgingService {
  async getAIJudgingAssistance(params: AIJudgingRequest): Promise<AIJudgingResponse> {
    try {
      const prompt = `You are an expert hackathon judge with experience evaluating innovative technology projects. Analyze this idea and provide scoring suggestions:

Idea Details:
- Title: ${params.idea.title}
- Description: ${params.idea.description}
- Problem: ${params.idea.problemStatement}
- Solution: ${params.idea.proposedSolution}
- Tech Stack: ${params.idea.techStack.join(', ')}

Scoring Criteria (1-10 scale):
1. Innovation: How novel and creative is the approach?
2. Feasibility: How realistic is the implementation within hackathon constraints?
3. Impact: How significant is the potential positive impact?
4. Presentation: How well is the idea communicated and structured?
5. Market Potential: What is the commercial viability and scalability?

${params.preliminaryScores ? `Judge's preliminary scores: ${JSON.stringify(params.preliminaryScores)}` : ''}

Provide analysis in this JSON format:
{
  "suggestedScores": {
    "innovation": {"score": 7, "reasoning": "Novel approach but builds on existing concepts"},
    "feasibility": {"score": 8, "reasoning": "Well-defined tech stack with realistic scope"},
    "impact": {"score": 6, "reasoning": "Moderate impact potential in specific domain"},
    "presentation": {"score": 7, "reasoning": "Clear problem statement, could use more detail"},
    "marketPotential": {"score": 5, "reasoning": "Niche market with uncertain demand"}
  },
  "overallAssessment": {
    "strengths": ["Clear problem identification", "Solid technical approach"],
    "weaknesses": ["Limited market research", "Unclear differentiation"],
    "recommendations": ["Add user validation", "Define success metrics"]
  },
  "biasAlerts": ["Consider if technical complexity bias affects feasibility score"],
  "focusAreas": ["Technical implementation", "User experience", "Market validation"]
}`;

      const response = await geminiClient.generateJSON<AIJudgingResponse>({
        prompt,
        maxTokens: 2000,
      });

      return {
        ...response,
        confidenceLevel: 0.85,
      };
    } catch (error) {
      console.error('AI judging assistance failed:', error);
      throw new Error('AI assistance unavailable');
    }
  }

  async submitScore(judgeId: string, scoreData: JudgeScoreRequest): Promise<void> {
    try {
      // Validate score data
      this.validateScoreData(scoreData);

      // Get judge profile for denormalization
      const judgeProfile = await this.getJudgeProfile(judgeId);

      // Calculate overall score
      const overallScore =
        Object.values(scoreData.scoringCriteria).reduce((sum, score) => sum + score, 0) / 5;

      // Create score entity
      const scoreEntity = {
        PK: `IDEA#${scoreData.ideaId}`,
        SK: `SCORE#${judgeId}`,
        GSI1PK: `JUDGE#${judgeId}`,
        GSI1SK: `SCORE#${scoreData.ideaId}`,
        scoreId: generateUUID(),
        ideaId: scoreData.ideaId,
        judgeId,
        scoringCriteria: scoreData.scoringCriteria,
        overallScore,
        feedback: scoreData.feedback,
        confidence: scoreData.confidence,
        timeSpent: scoreData.timeSpent,
        scoredAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublic: scoreData.isPublic,
        judgeProfile: {
          name: judgeProfile.name,
          expertise: judgeProfile.expertise || [],
        },
      };

      // Save score
      await dynamodb.put(scoreEntity);

      // Update idea with aggregated score
      await this.updateIdeaAggregatedScore(scoreData.ideaId);

      // Update judge statistics
      await this.updateJudgeStats(judgeId);
    } catch (error) {
      console.error('Score submission failed:', error);
      throw new Error('Failed to submit score');
    }
  }

  private validateScoreData(scoreData: JudgeScoreRequest): void {
    // Validate scoring criteria
    const criteria = ['innovation', 'feasibility', 'impact', 'presentation', 'marketPotential'];
    for (const criterion of criteria) {
      const score = scoreData.scoringCriteria[criterion as keyof typeof scoreData.scoringCriteria];
      if (!score || score < 1 || score > 10) {
        throw new Error(`Invalid score for ${criterion}: must be between 1 and 10`);
      }
    }

    // Validate confidence
    if (scoreData.confidence < 1 || scoreData.confidence > 5) {
      throw new Error('Confidence must be between 1 and 5');
    }

    // Validate feedback
    if (scoreData.feedback.strengths.length === 0 && scoreData.feedback.improvements.length === 0) {
      throw new Error('At least one strength or improvement must be provided');
    }
  }

  private async updateIdeaAggregatedScore(ideaId: string): Promise<void> {
    // Get all scores for this idea
    const scores = await this.getIdeaScores(ideaId);

    if (scores.length === 0) return;

    // Calculate aggregated metrics
    const avgOverallScore =
      scores.reduce((sum, score) => sum + score.overallScore, 0) / scores.length;
    const avgCriteria = {
      innovation:
        scores.reduce((sum, score) => sum + score.scoringCriteria.innovation, 0) / scores.length,
      feasibility:
        scores.reduce((sum, score) => sum + score.scoringCriteria.feasibility, 0) / scores.length,
      impact: scores.reduce((sum, score) => sum + score.scoringCriteria.impact, 0) / scores.length,
      presentation:
        scores.reduce((sum, score) => sum + score.scoringCriteria.presentation, 0) / scores.length,
      marketPotential:
        scores.reduce((sum, score) => sum + score.scoringCriteria.marketPotential, 0) /
        scores.length,
    };

    // Update idea entity with aggregated scores
    await dynamodb.update(
      { PK: `IDEA#${ideaId}`, SK: 'DETAILS' },
      {
        judgeScore: avgOverallScore,
        judgeScoreBreakdown: avgCriteria,
        judgeCount: scores.length,
        lastJudgedAt: new Date().toISOString(),
      }
    );
  }

  async getJudgeAssignedIdeas(judgeId: string): Promise<any[]> {
    try {
      // Get ideas assigned to this judge
      const assignments = await this.getJudgeAssignments(judgeId);

      // Get idea details for each assignment
      const ideas = await Promise.all(
        assignments.map(async (assignment) => {
          const idea = await this.getIdeaDetails(assignment.ideaId);
          const existingScore = await this.getJudgeScoreForIdea(judgeId, assignment.ideaId);

          return {
            ...idea,
            assignment,
            hasScored: !!existingScore,
            existingScore,
          };
        })
      );

      return ideas;
    } catch (error) {
      console.error('Failed to get judge assigned ideas:', error);
      throw new Error('Failed to retrieve assigned ideas');
    }
  }

  async getJudgingStats(judgeId: string): Promise<any> {
    try {
      const assignments = await this.getJudgeAssignments(judgeId);
      const scores = await this.getJudgeScores(judgeId);

      const totalAssigned = assignments.length;
      const totalScored = scores.length;
      const completionRate = totalAssigned > 0 ? (totalScored / totalAssigned) * 100 : 0;

      const avgScore =
        scores.length > 0
          ? scores.reduce((sum, score) => sum + score.overallScore, 0) / scores.length
          : 0;

      const avgTimePerIdea =
        scores.length > 0
          ? scores.reduce((sum, score) => sum + score.timeSpent, 0) / scores.length
          : 0;

      const avgConfidence =
        scores.length > 0
          ? scores.reduce((sum, score) => sum + score.confidence, 0) / scores.length
          : 0;

      return {
        totalAssigned,
        totalScored,
        completionRate,
        avgScore,
        avgTimePerIdea,
        avgConfidence,
        recentActivity: scores.slice(-5), // Last 5 scores
      };
    } catch (error) {
      console.error('Failed to get judging stats:', error);
      throw new Error('Failed to retrieve judging statistics');
    }
  }
}

export const judgingService = new JudgingService();
```

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** Read `guidelines/project-architecture.md` and review F01 and F04 implementations.

### Step 1: Backend Implementation (New Module)

**File Structure:**

```
backend/src/modules/judges/ (new module)
├── handlers/
│   ├── getJudgeIdeas.ts
│   ├── scoreIdea.ts
│   ├── getIdeaScores.ts
│   ├── updateScore.ts
│   ├── getJudgingStats.ts
│   ├── exportScores.ts
│   └── getAIAssistance.ts
├── functions/
│   ├── getJudgeIdeas.yml
│   ├── scoreIdea.yml
│   ├── getIdeaScores.yml
│   ├── updateScore.yml
│   ├── getJudgingStats.yml
│   ├── exportScores.yml
│   └── getAIAssistance.yml
├── services/
│   └── JudgingService.ts
└── types.ts
```

### Step 2: Frontend Implementation (New Judge Interface)

**File Structure:**

```
client/src/
├── components/judges/
│   ├── JudgeDashboard.tsx
│   ├── IdeaScoringInterface.tsx
│   ├── ScoringRubric.tsx
│   ├── FeedbackForm.tsx
│   ├── JudgingProgress.tsx
│   └── ScoresSummary.tsx
├── pages/judges/
│   ├── JudgeDashboardPage.tsx
│   ├── IdeaScoringPage.tsx
│   ├── JudgingStatsPage.tsx
│   └── ScoringHistoryPage.tsx
├── hooks/
│   └── useJudging.ts
├── services/
│   └── judgingApi.ts
└── types/
    └── judging.ts
```

### Step 3: Integration with F01 and F04

- [ ] **Extend F01 Ideas:** Add judge score display to idea details
- [ ] **Judge Role Setup:** Ensure judge role is properly configured in Clerk
- [ ] **AI Integration:** Implement Gemini AI for scoring assistance
- [ ] **Score Aggregation:** Update idea entities with aggregated judge scores

## Acceptance Criteria

- [ ] Judges can access dedicated dashboard with assigned ideas
- [ ] Scoring interface provides comprehensive evaluation criteria with 1-10 scales
- [ ] AI assistance provides helpful scoring suggestions and bias detection
- [ ] Feedback system allows detailed constructive comments for participants
- [ ] Judge statistics track performance and completion rates
- [ ] Aggregated scores are calculated and displayed on ideas
- [ ] **Demo Ready:** Can score an idea with AI assistance in 2 minutes
- [ ] **Role-Based Access:** Only judges can access scoring interface
- [ ] **Mobile Responsive:** Scoring interface works on tablets and mobile

## Testing Checklist

- [ ] **Manual API Testing:**
  - Judge can retrieve assigned ideas
  - Score submission validates all criteria
  - AI assistance provides relevant suggestions
  - Aggregated scores calculate correctly
  - Judge statistics update properly

- [ ] **Frontend Testing:**
  - Scoring interface validates all inputs
  - AI assistance integrates smoothly
  - Feedback forms work correctly
  - Progress tracking displays accurately
  - Judge dashboard shows relevant information

- [ ] **Role-Based Access:** Only users with judge role can access judge features
- [ ] **AI Performance:** Gemini AI assistance completes within 10 seconds
- [ ] **Score Accuracy:** Aggregated scores reflect individual judge scores correctly

## Deployment Checklist

- [ ] **CRITICAL - Type Check:** Run `bun run typecheck` in both backend and client
- [ ] **Serverless Config:** Add judge function imports to serverless.yml
- [ ] **Environment Variables:** Ensure GEMINI_API_KEY is configured for AI assistance
- [ ] **Role Configuration:** Verify judge role is properly set up in Clerk
- [ ] **Manual Testing:** Test complete judging workflow with AI assistance
- [ ] **F01 Integration:** Verify judge scores display correctly on ideas
