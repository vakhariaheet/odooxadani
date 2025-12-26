# Module M07: Advanced Team Matching

## Overview

**Estimated Time:** 1.5hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Medium

**Dependencies:** F03 (Team Formation System), F04 (Participant Profiles)

## Problem Context

Building on the basic team formation system, this module adds intelligent matching algorithms that consider skill complementarity, working style compatibility, timezone alignment, and hackathon goals. Participants need more than just skill-based matching - they need teams that work well together and have aligned objectives.

## Technical Requirements

**Module Type:** Full-stack (Integration module - enhances F03 with F04 data)

### Backend Tasks

- [ ] **Handler Files:** Create advanced matching handlers
  - `handlers/getSmartMatches.ts` - GET /api/teams/smart-matches
  - `handlers/getCompatibilityScore.ts` - GET /api/teams/:id/compatibility
  - `handlers/analyzeTeamFit.ts` - POST /api/teams/analyze-fit
  - `handlers/getMatchingInsights.ts` - GET /api/matching/insights
  - `handlers/updateMatchingPreferences.ts` - PUT /api/profiles/matching-preferences

- [ ] **Function Configs:** Create serverless function configurations
  - `functions/getSmartMatches.yml` - AI-powered team recommendations
  - `functions/getCompatibilityScore.yml` - Team compatibility analysis
  - `functions/analyzeTeamFit.yml` - Analyze user fit with specific team
  - `functions/getMatchingInsights.yml` - Matching algorithm insights
  - `functions/updateMatchingPreferences.yml` - Update matching preferences

- [ ] **Service Layer:** Create advanced matching service
  - `services/TeamMatchingService.ts` - Advanced matching algorithms
  - Skill complementarity analysis
  - Personality and working style matching
  - Timezone and availability alignment
  - Goal and experience level compatibility
  - Machine learning-based recommendations

- [ ] **Type Definitions:** Add matching types
  - `SmartMatchRequest`, `CompatibilityAnalysis`, `MatchingInsights`
  - `WorkingStyle`, `MatchingPreferences`, `TeamCompatibility` interfaces
  - `MatchingCriteria`, `CompatibilityFactors` types

- [ ] **RBAC Verification:** Module already configured in permissions.ts
  - Participants can get matches and analyze compatibility
  - All users can read team compatibility scores

### Frontend Tasks

- [ ] **Components:** Create advanced matching UI
  - `components/teams/SmartMatchingWizard.tsx` - Guided matching process
  - `components/teams/CompatibilityMeter.tsx` - Visual compatibility display
  - `components/teams/TeamFitAnalysis.tsx` - Detailed fit analysis
  - `components/teams/MatchingPreferences.tsx` - Preference configuration
  - `components/teams/MatchingInsights.tsx` - Algorithm insights display

- [ ] **Enhanced Components:** Extend existing F03 components
  - Update `TeamRecommendations.tsx` with advanced scoring
  - Update `TeamCard.tsx` to show compatibility scores
  - Update `TeamDetails.tsx` with fit analysis

- [ ] **Pages:** Create matching-focused pages
  - `pages/teams/SmartMatchingPage.tsx` - Advanced matching interface
  - `pages/teams/MatchingPreferencesPage.tsx` - Configure preferences
  - Update existing team pages with advanced features

- [ ] **API Integration:** Extend existing hooks
  - Update `hooks/useTeams.ts` with advanced matching
  - Add `hooks/useMatching.ts` for matching operations
  - Add `hooks/useCompatibility.ts` for compatibility analysis

- [ ] **State Management:** Advanced matching state
  - Matching preferences state
  - Compatibility analysis results
  - Smart recommendation caching

### Database Schema Extensions (Single Table)

```
# Matching Preferences (extend Profile entity)
PK: USER#[userId] | SK: MATCHING_PREFERENCES
- workingStyle: 'collaborative' | 'independent' | 'leadership' | 'supportive'
- communicationStyle: 'frequent' | 'structured' | 'minimal' | 'flexible'
- experiencePreference: 'similar' | 'mixed' | 'mentor' | 'learn'
- timezoneFlexibility: 'strict' | 'flexible' | 'any'
- hackathonGoals: string[] ('learning', 'winning', 'networking', 'portfolio')
- teamSizePreference: { min: number, max: number }
- industryInterests: string[] (healthcare, fintech, gaming, etc.)
- availabilityHours: { start: string, end: string, timezone: string }
- previousTeamExperience: 'none' | 'some' | 'extensive'
- leadershipPreference: 'lead' | 'follow' | 'share' | 'no_preference'

# Team Compatibility Cache
PK: TEAM#[teamId] | SK: COMPATIBILITY#[userId]
- teamId: string
- userId: string
- compatibilityScore: number (0-100)
- skillMatch: number (0-100)
- workingStyleMatch: number (0-100)
- goalAlignment: number (0-100)
- timezoneCompatibility: number (0-100)
- experienceBalance: number (0-100)
- calculatedAt: ISO string
- factors: {
  strengths: string[]
  concerns: string[]
  recommendations: string[]
}

# Matching Analytics
PK: ANALYTICS#MATCHING | SK: [date]
- date: string (YYYY-MM-DD)
- totalMatches: number
- successfulJoins: number
- averageCompatibility: number
- topMatchingFactors: string[]
- improvementAreas: string[]
```

## Enhancement Features

### Enhancement Feature: AI-Powered Team Chemistry Analysis

**Problem Solved:** Basic skill matching doesn't account for team dynamics, working styles, and personality compatibility that determine whether a team will actually work well together.

**Enhancement Type:** AI + Smart Logic - Uses Gemini AI for personality analysis combined with algorithmic compatibility scoring

**User Trigger:** "Analyze Team Fit" button when viewing team details or "Find Perfect Match" in smart matching wizard

**Input Requirements:**

- **Required Fields:** User profile with skills, preferences, and working style
- **Optional Fields:** Previous team experience, communication preferences, hackathon goals
- **Validation Rules:** Profile must be at least 70% complete for accurate analysis

**Processing Logic:**

1. **Profile Analysis:** Extract personality traits and working style from profile data
2. **Team Dynamics Assessment:** Analyze existing team composition and dynamics
3. **Compatibility Scoring:** Calculate multi-dimensional compatibility score
4. **AI Enhancement:** Use Gemini to provide insights on team chemistry and recommendations

**COMPLETE IMPLEMENTATION SPECIFICATION:**

**Types Definition:**

```typescript
// types.ts - Add these exact types
export interface TeamChemistryRequest {
  userId: string;
  teamId: string;
  userProfile: {
    skills: string[];
    workingStyle: string;
    communicationStyle: string;
    experienceLevel: string;
    hackathonGoals: string[];
    timezone: string;
    previousExperience: string;
  };
  teamProfile: {
    currentMembers: TeamMember[];
    requiredSkills: string[];
    workingStyle?: string;
    teamGoals: string[];
  };
}

export interface TeamChemistryResponse {
  overallCompatibility: number; // 0-100
  compatibilityFactors: {
    skillMatch: { score: number; analysis: string };
    workingStyleMatch: { score: number; analysis: string };
    communicationFit: { score: number; analysis: string };
    goalAlignment: { score: number; analysis: string };
    experienceBalance: { score: number; analysis: string };
    timezoneCompatibility: { score: number; analysis: string };
  };
  teamDynamics: {
    roleYouWouldFill: string;
    teamStrengths: string[];
    potentialChallenges: string[];
    successPredictors: string[];
  };
  recommendations: {
    forYou: string[];
    forTeam: string[];
    communicationTips: string[];
  };
  confidence: number;
}

export interface SmartMatchingCriteria {
  skillPriority: 'essential' | 'preferred' | 'flexible';
  experiencePreference: 'similar' | 'mixed' | 'mentor_me' | 'i_mentor';
  workingStyleImportance: 'critical' | 'important' | 'flexible';
  timezoneRequirement: 'same' | 'overlap_4h' | 'overlap_2h' | 'flexible';
  teamSizePreference: { min: number; max: number };
  industryFocus?: string[];
  hackathonType?: 'competitive' | 'learning' | 'networking' | 'any';
}
```

**Frontend Component:**

```typescript
// components/teams/TeamChemistryAnalyzer.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Users,
  MessageCircle,
  Target,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';

interface TeamChemistryAnalyzerProps {
  teamId: string;
  teamData: any;
  onAnalysisComplete?: (analysis: TeamChemistryResponse) => void;
}

export const TeamChemistryAnalyzer = ({
  teamId,
  teamData,
  onAnalysisComplete
}: TeamChemistryAnalyzerProps) => {
  const [analysis, setAnalysis] = useState<TeamChemistryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const analyzeTeamFit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/teams/analyze-fit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`
        },
        body: JSON.stringify({
          teamId,
          includePersonalityAnalysis: true,
          includeRecommendations: true
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Analysis failed');
      }

      const data = await response.json();
      setAnalysis(data.data);
      setHasAnalyzed(true);
      onAnalysisComplete?.(data.data);
    } catch (error) {
      console.error('Team chemistry analysis error:', error);
      toast.error('Failed to analyze team fit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Fit';
    if (score >= 60) return 'Good Fit';
    if (score >= 40) return 'Moderate Fit';
    return 'Poor Fit';
  };

  return (
    <div className="space-y-6">
      {/* Analysis Trigger */}
      {!hasAnalyzed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Team Chemistry Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Get AI-powered insights on how well you'd fit with this team based on skills,
              working styles, and team dynamics.
            </p>
            <Button
              onClick={analyzeTeamFit}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Analyzing Team Fit...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Analyze My Fit with This Team
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {hasAnalyzed && analysis && (
        <div className="space-y-6">
          {/* Overall Compatibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Overall Compatibility
                </span>
                <Badge className={`${getScoreColor(analysis.overallCompatibility)} bg-transparent border-current`}>
                  {analysis.overallCompatibility}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Compatibility Score</span>
                    <span className={`text-sm font-bold ${getScoreColor(analysis.overallCompatibility)}`}>
                      {getScoreLabel(analysis.overallCompatibility)}
                    </span>
                  </div>
                  <Progress
                    value={analysis.overallCompatibility}
                    className="h-3"
                  />
                </div>

                <div className="text-sm text-muted-foreground">
                  Confidence: {Math.round(analysis.confidence * 100)}%
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compatibility Factors */}
          <Card>
            <CardHeader>
              <CardTitle>Compatibility Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(analysis.compatibilityFactors).map(([factor, data]) => {
                  const icons = {
                    skillMatch: Users,
                    workingStyleMatch: MessageCircle,
                    communicationFit: MessageCircle,
                    goalAlignment: Target,
                    experienceBalance: TrendingUp,
                    timezoneCompatibility: Clock
                  };

                  const Icon = icons[factor as keyof typeof icons] || Users;

                  return (
                    <div key={factor} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium capitalize">
                          {factor.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {data.score}%
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {data.analysis}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Team Dynamics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Dynamics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">Your Role in This Team:</div>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {analysis.teamDynamics.roleYouWouldFill}
                </Badge>
              </div>

              <div>
                <div className="text-sm font-medium mb-2 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Team Strengths:
                </div>
                <ul className="text-sm space-y-1">
                  {analysis.teamDynamics.teamStrengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {analysis.teamDynamics.potentialChallenges.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    Potential Challenges:
                  </div>
                  <ul className="text-sm space-y-1">
                    {analysis.teamDynamics.potentialChallenges.map((challenge, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-600">•</span>
                        <span>{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <div className="text-sm font-medium mb-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Success Predictors:
                </div>
                <ul className="text-sm space-y-1">
                  {analysis.teamDynamics.successPredictors.map((predictor, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>{predictor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">For You:</div>
                <ul className="text-sm space-y-1">
                  {analysis.recommendations.forYou.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">For the Team:</div>
                <ul className="text-sm space-y-1">
                  {analysis.recommendations.forTeam.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {analysis.recommendations.communicationTips.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Communication Tips:</div>
                  <ul className="text-sm space-y-1">
                    {analysis.recommendations.communicationTips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={analyzeTeamFit}
              variant="outline"
              size="sm"
            >
              Re-analyze
            </Button>
            {analysis.overallCompatibility >= 60 && (
              <Button size="sm" asChild>
                <Link to={`/teams/${teamId}/join`}>
                  Request to Join Team
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
```

**Backend Service Method:**

```typescript
// services/TeamMatchingService.ts
export class TeamMatchingService {
  async analyzeTeamChemistry(params: TeamChemistryRequest): Promise<TeamChemistryResponse> {
    try {
      // Get detailed user and team profiles
      const userProfile = await this.getDetailedUserProfile(params.userId);
      const teamProfile = await this.getDetailedTeamProfile(params.teamId);

      // Calculate compatibility factors
      const compatibilityFactors = await this.calculateCompatibilityFactors(
        userProfile,
        teamProfile
      );

      // Use AI to analyze team dynamics and provide insights
      const aiInsights = await this.getAITeamInsights(
        userProfile,
        teamProfile,
        compatibilityFactors
      );

      // Calculate overall compatibility score
      const overallCompatibility = this.calculateOverallCompatibility(compatibilityFactors);

      return {
        overallCompatibility,
        compatibilityFactors,
        teamDynamics: aiInsights.teamDynamics,
        recommendations: aiInsights.recommendations,
        confidence: aiInsights.confidence,
      };
    } catch (error) {
      console.error('Team chemistry analysis failed:', error);
      throw new Error('Failed to analyze team chemistry');
    }
  }

  private async calculateCompatibilityFactors(
    userProfile: any,
    teamProfile: any
  ): Promise<TeamChemistryResponse['compatibilityFactors']> {
    // Skill Match Analysis
    const skillMatch = this.analyzeSkillMatch(userProfile.skills, teamProfile.requiredSkills);

    // Working Style Compatibility
    const workingStyleMatch = this.analyzeWorkingStyleMatch(
      userProfile.workingStyle,
      teamProfile.workingStyle
    );

    // Communication Fit
    const communicationFit = this.analyzeCommunicationFit(
      userProfile.communicationStyle,
      teamProfile.communicationPreferences
    );

    // Goal Alignment
    const goalAlignment = this.analyzeGoalAlignment(
      userProfile.hackathonGoals,
      teamProfile.teamGoals
    );

    // Experience Balance
    const experienceBalance = this.analyzeExperienceBalance(
      userProfile.experienceLevel,
      teamProfile.currentMembers
    );

    // Timezone Compatibility
    const timezoneCompatibility = this.analyzeTimezoneCompatibility(
      userProfile.timezone,
      teamProfile.memberTimezones
    );

    return {
      skillMatch,
      workingStyleMatch,
      communicationFit,
      goalAlignment,
      experienceBalance,
      timezoneCompatibility,
    };
  }

  private analyzeSkillMatch(
    userSkills: string[],
    requiredSkills: string[]
  ): { score: number; analysis: string } {
    const userSkillSet = new Set(userSkills.map((s) => s.toLowerCase()));
    const requiredSkillSet = new Set(requiredSkills.map((s) => s.toLowerCase()));

    const matchingSkills = Array.from(requiredSkillSet).filter((skill) => userSkillSet.has(skill));

    const score =
      requiredSkills.length > 0
        ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
        : 50; // Neutral if no specific requirements

    let analysis = '';
    if (score >= 80) {
      analysis = `Excellent match! You have ${matchingSkills.length} of ${requiredSkills.length} required skills.`;
    } else if (score >= 60) {
      analysis = `Good match with ${matchingSkills.length} matching skills. Some learning opportunities.`;
    } else if (score >= 40) {
      analysis = `Moderate match. You could contribute while learning new skills.`;
    } else {
      analysis = `Limited skill overlap, but could bring fresh perspective.`;
    }

    return { score, analysis };
  }

  private analyzeWorkingStyleMatch(
    userStyle: string,
    teamStyle?: string
  ): { score: number; analysis: string } {
    if (!teamStyle) {
      return {
        score: 75,
        analysis: 'Team working style not specified, likely adaptable.',
      };
    }

    const styleCompatibility = {
      collaborative: { collaborative: 100, supportive: 90, leadership: 70, independent: 50 },
      independent: { independent: 100, leadership: 80, collaborative: 60, supportive: 70 },
      leadership: { leadership: 90, supportive: 95, collaborative: 80, independent: 70 },
      supportive: { supportive: 100, collaborative: 95, leadership: 85, independent: 60 },
    };

    const score =
      styleCompatibility[userStyle as keyof typeof styleCompatibility]?.[
        teamStyle as keyof (typeof styleCompatibility)[typeof userStyle]
      ] || 50;

    let analysis = '';
    if (score >= 90) {
      analysis = "Excellent working style alignment. You'll fit right in!";
    } else if (score >= 70) {
      analysis = 'Good working style compatibility with minor adjustments needed.';
    } else if (score >= 50) {
      analysis = 'Different working styles could create productive tension.';
    } else {
      analysis = 'Working style differences may require extra communication.';
    }

    return { score, analysis };
  }

  private async getAITeamInsights(
    userProfile: any,
    teamProfile: any,
    compatibilityFactors: any
  ): Promise<{
    teamDynamics: TeamChemistryResponse['teamDynamics'];
    recommendations: TeamChemistryResponse['recommendations'];
    confidence: number;
  }> {
    try {
      const prompt = `You are an expert team dynamics analyst for hackathon teams. Analyze this potential team member fit:

User Profile:
- Skills: ${userProfile.skills.join(', ')}
- Working Style: ${userProfile.workingStyle}
- Experience: ${userProfile.experienceLevel}
- Goals: ${userProfile.hackathonGoals.join(', ')}
- Communication: ${userProfile.communicationStyle}

Team Profile:
- Current Members: ${teamProfile.currentMembers.length}
- Required Skills: ${teamProfile.requiredSkills.join(', ')}
- Team Goals: ${teamProfile.teamGoals.join(', ')}
- Existing Skills: ${teamProfile.existingSkills.join(', ')}

Compatibility Scores:
- Skill Match: ${compatibilityFactors.skillMatch.score}%
- Working Style: ${compatibilityFactors.workingStyleMatch.score}%
- Goal Alignment: ${compatibilityFactors.goalAlignment.score}%

Provide analysis in this JSON format:
{
  "teamDynamics": {
    "roleYouWouldFill": "specific role like 'Frontend Developer & UI/UX Contributor'",
    "teamStrengths": ["strength 1", "strength 2", "strength 3"],
    "potentialChallenges": ["challenge 1", "challenge 2"],
    "successPredictors": ["predictor 1", "predictor 2", "predictor 3"]
  },
  "recommendations": {
    "forYou": ["recommendation 1", "recommendation 2"],
    "forTeam": ["team recommendation 1", "team recommendation 2"],
    "communicationTips": ["tip 1", "tip 2"]
  }
}`;

      const response = await geminiClient.generateJSON<{
        teamDynamics: TeamChemistryResponse['teamDynamics'];
        recommendations: TeamChemistryResponse['recommendations'];
      }>({
        prompt,
        maxTokens: 1500,
      });

      return {
        teamDynamics: response.teamDynamics,
        recommendations: response.recommendations,
        confidence: 0.85,
      };
    } catch (error) {
      console.error('AI team insights failed:', error);

      // Fallback to basic insights
      return this.generateBasicInsights(userProfile, teamProfile, compatibilityFactors);
    }
  }

  private calculateOverallCompatibility(factors: any): number {
    // Weighted average of compatibility factors
    const weights = {
      skillMatch: 0.25,
      workingStyleMatch: 0.2,
      communicationFit: 0.15,
      goalAlignment: 0.2,
      experienceBalance: 0.1,
      timezoneCompatibility: 0.1,
    };

    let weightedSum = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([factor, weight]) => {
      if (factors[factor]) {
        weightedSum += factors[factor].score * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 50;
  }

  async getSmartMatches(
    userId: string,
    criteria: SmartMatchingCriteria
  ): Promise<Array<{ team: any; compatibility: TeamChemistryResponse }>> {
    try {
      // Get user profile
      const userProfile = await this.getDetailedUserProfile(userId);

      // Get available teams based on criteria
      const availableTeams = await this.getAvailableTeams(criteria);

      // Analyze compatibility with each team
      const matches = await Promise.all(
        availableTeams.map(async (team) => {
          const compatibility = await this.analyzeTeamChemistry({
            userId,
            teamId: team.id,
            userProfile,
            teamProfile: team,
          });

          return { team, compatibility };
        })
      );

      // Sort by compatibility score and return top matches
      return matches
        .filter((match) => match.compatibility.overallCompatibility >= 40) // Minimum threshold
        .sort((a, b) => b.compatibility.overallCompatibility - a.compatibility.overallCompatibility)
        .slice(0, 10); // Top 10 matches
    } catch (error) {
      console.error('Smart matching failed:', error);
      throw new Error('Failed to find smart matches');
    }
  }
}

export const teamMatchingService = new TeamMatchingService();
```

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** Read `guidelines/project-architecture.md` and review F03 and F04 implementations.

### Step 1: Backend Implementation (Extends F03)

**File Structure:**

```
backend/src/modules/teams/ (extend existing)
├── handlers/ (add to existing)
│   ├── getSmartMatches.ts
│   ├── getCompatibilityScore.ts
│   ├── analyzeTeamFit.ts
│   ├── getMatchingInsights.ts
│   └── updateMatchingPreferences.ts
├── functions/ (add to existing)
│   ├── getSmartMatches.yml
│   ├── getCompatibilityScore.yml
│   ├── analyzeTeamFit.yml
│   ├── getMatchingInsights.yml
│   └── updateMatchingPreferences.yml
├── services/ (add to existing)
│   └── TeamMatchingService.ts
└── types.ts (extend existing)
```

### Step 2: Frontend Implementation (Extends F03)

**File Structure:**

```
client/src/
├── components/teams/ (extend existing)
│   ├── SmartMatchingWizard.tsx
│   ├── CompatibilityMeter.tsx
│   ├── TeamChemistryAnalyzer.tsx
│   ├── MatchingPreferences.tsx
│   └── MatchingInsights.tsx
├── pages/teams/ (add to existing)
│   ├── SmartMatchingPage.tsx
│   └── MatchingPreferencesPage.tsx
├── hooks/ (extend existing)
│   ├── useMatching.ts
│   └── useCompatibility.ts
└── Update existing F03 components with advanced features
```

### Step 3: Integration with F03 and F04

- [ ] **Extend F03 Components:** Add compatibility scoring to existing team components
- [ ] **Integrate F04 Data:** Use profile data for advanced matching algorithms
- [ ] **AI Enhancement:** Implement Gemini AI for team chemistry insights
- [ ] **Performance Optimization:** Cache compatibility scores for frequently accessed teams

## Acceptance Criteria

- [ ] Smart matching provides highly relevant team recommendations based on multiple factors
- [ ] Team chemistry analysis gives detailed insights on compatibility and team dynamics
- [ ] Compatibility scoring considers skills, working styles, goals, and timezone alignment
- [ ] AI-powered insights provide actionable recommendations for team success
- [ ] Matching preferences allow users to customize their matching criteria
- [ ] Advanced matching integrates seamlessly with existing team formation workflow
- [ ] **Demo Ready:** Can get smart matches and analyze team fit in 30 seconds
- [ ] **Integration Working:** Seamlessly enhances F03 with F04 profile data
- [ ] **Mobile Responsive:** All advanced matching features work on mobile

## Testing Checklist

- [ ] **Manual API Testing:**
  - Smart matches return relevant teams with high compatibility scores
  - Team chemistry analysis provides detailed compatibility breakdown
  - Compatibility scoring algorithm produces consistent results
  - AI insights provide meaningful team dynamics analysis
  - Matching preferences update correctly

- [ ] **Frontend Testing:**
  - Smart matching wizard guides users through preference selection
  - Compatibility meter displays scores with clear visual indicators
  - Team chemistry analyzer shows detailed analysis results
  - Matching preferences form validates and saves correctly
  - All advanced features integrate with existing team components

- [ ] **Integration:** Advanced matching enhances existing F03 functionality without breaking it
- [ ] **AI Performance:** Gemini AI analysis completes within 15 seconds
- [ ] **Algorithm Accuracy:** Compatibility scores correlate with successful team formations

## Deployment Checklist

- [ ] **CRITICAL - Type Check:** Run `bun run typecheck` in both backend and client
- [ ] **Serverless Config:** Add advanced matching function imports to serverless.yml
- [ ] **Environment Variables:** Ensure GEMINI_API_KEY is configured for AI analysis
- [ ] **Manual Testing:** Test all advanced matching and compatibility analysis features
- [ ] **F03/F04 Integration:** Verify existing team and profile functionality works with enhancements
