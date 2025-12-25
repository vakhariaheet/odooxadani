# Module M08: Event Analytics Dashboard

## Overview

**Estimated Time:** 1hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Low

**Dependencies:** F04 (Event Management)

## Problem Context

Organizers need comprehensive analytics and insights about their hackathon events, including participant engagement, team formation patterns, idea trends, and overall event success metrics. This module provides a powerful analytics dashboard with AI-powered insights.

## Technical Requirements

**Module Type:** Full-stack

### Backend Tasks

- [ ] **Handler File:** Create `handlers/getEventAnalytics.ts` for analytics data
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'analytics', 'read')`

- [ ] **Handler File:** Create `handlers/getParticipantInsights.ts` for participant analytics
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'analytics', 'read')`

- [ ] **Handler File:** Create `handlers/getTeamFormationStats.ts` for team analytics
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'analytics', 'read')`

- [ ] **Handler File:** Create `handlers/generateEventReport.ts` for comprehensive reports
  - Pattern: `baseHandler` function + `export const handler = withRbac(baseHandler, 'analytics', 'read')`

- [ ] **Function Config:** Create corresponding `.yml` files in `functions/` directory

- [ ] **Service Layer:** Business logic in `services/AnalyticsService.ts`
  - **MANDATORY AI Integration:** AI-powered analytics insights and recommendations

- [ ] **AI Features Implementation:**
  - `generateEventInsights()` - AI analysis of event performance
  - `predictEventSuccess()` - AI predictions based on early metrics
  - `recommendImprovements()` - AI suggestions for event optimization
  - `analyzeParticipantBehavior()` - AI insights on participant engagement patterns

### Frontend Tasks

- [ ] **Pages/Components:**
  - `AnalyticsDashboard.tsx` - Main analytics dashboard with charts
  - `EventMetricsCard.tsx` - Key metrics display cards
  - `ParticipantAnalytics.tsx` - Participant engagement analytics
  - `TeamFormationChart.tsx` - Team formation visualization
  - `IdeaTrendsChart.tsx` - Idea category and trend analysis
  - `AIInsightsPanel.tsx` - AI-generated insights and recommendations

- [ ] **Chart Components:** Using recharts or similar library
  - Line charts for time-series data
  - Bar charts for categorical data
  - Pie charts for distribution analysis
  - Heatmaps for engagement patterns

- [ ] **AI Features:**
  - AI-generated insights display
  - Predictive analytics visualization
  - Automated recommendations panel
  - Trend analysis with AI explanations

### Database Schema

```
pk: ANALYTICS#[eventId] | sk: OVERVIEW | gsi1pk: EVENT#[eventId] | gsi1sk: ANALYTICS
- eventId: string
- totalParticipants: number
- totalTeams: number
- totalIdeas: number
- registrationRate: number (registrations per day)
- teamFormationRate: number (teams formed per day)
- ideaSubmissionRate: number (ideas per day)
- engagementScore: number (AI-calculated engagement 1-10)
- successPrediction: number (AI-predicted success score 1-10)
- lastUpdated: string (ISO timestamp)

pk: ANALYTICS#[eventId] | sk: PARTICIPANTS | gsi1pk: EVENT#[eventId] | gsi1SK: PARTICIPANTS
- eventId: string
- participantsBySkill: Record<string, number> (skill distribution)
- participantsByExperience: Record<string, number> (experience levels)
- participantsByLocation: Record<string, number> (geographic distribution)
- dailyRegistrations: DailyMetric[] (registration timeline)
- engagementMetrics: EngagementMetric[] (activity patterns)
- retentionRate: number (percentage still active)

pk: ANALYTICS#[eventId] | sk: TEAMS | gsi1pk: EVENT#[eventId] | gsi1sk: TEAMS
- eventId: string
- teamSizeDistribution: Record<number, number> (team size frequency)
- skillBalanceScores: number[] (AI-calculated team balance scores)
- formationTimeline: DailyMetric[] (teams formed over time)
- averageFormationTime: number (minutes to form team)
- teamCompletionRate: number (percentage of teams that reach max size)
- crossSkillCollaboration: Record<string, string[]> (skill combinations)

pk: ANALYTICS#[eventId] | sk: IDEAS | gsi1pk: EVENT#[eventId] | gsi1sk: IDEAS
- eventId: string
- ideaCategories: Record<string, number> (category distribution)
- averageVotes: number (average votes per idea)
- topVotedIdeas: string[] (idea IDs with most votes)
- ideaComplexityDistribution: Record<string, number> (complexity levels)
- aiQualityScores: number[] (AI-assessed idea quality scores)
- trendingTopics: string[] (AI-identified trending themes)

pk: ANALYTICS#[eventId] | sk: INSIGHTS#[date] | gsi1pk: EVENT#[eventId] | gsi1sk: INSIGHTS#[date]
- eventId: string
- date: string (YYYY-MM-DD)
- insights: AIInsight[] (AI-generated insights)
- recommendations: string[] (AI recommendations)
- predictions: Prediction[] (AI predictions)
- riskFactors: string[] (potential issues identified)
- successFactors: string[] (positive indicators)
- generatedAt: string (ISO timestamp)
```

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** You MUST read `guidelines/project-architecture.md` COMPLETELY before writing any code.

### Step 1: Backend Implementation (Lambda-Compatible)

**File Structure:**

```
backend/src/modules/analytics/
├── handlers/
│   ├── getEventAnalytics.ts      # GET /api/analytics/events/:id
│   ├── getParticipantInsights.ts # GET /api/analytics/events/:id/participants
│   ├── getTeamFormationStats.ts  # GET /api/analytics/events/:id/teams
│   └── generateEventReport.ts    # GET /api/analytics/events/:id/report
├── functions/
│   ├── getEventAnalytics.yml
│   ├── getParticipantInsights.yml
│   ├── getTeamFormationStats.yml
│   └── generateEventReport.yml
├── services/
│   └── AnalyticsService.ts       # Analytics business logic
└── types.ts                      # Analytics-specific types
```

**Service Layer Implementation:**

```typescript
// services/AnalyticsService.ts
import { geminiClient } from '../../../shared/clients/gemini';
import { dynamodb } from '../../../shared/clients/dynamodb';

export class AnalyticsService {
  async getEventAnalytics(eventId: string): Promise<EventAnalytics> {
    // Aggregate analytics data from multiple sources
    const [participants, teams, ideas] = await Promise.all([
      this.getParticipantStats(eventId),
      this.getTeamStats(eventId),
      this.getIdeaStats(eventId),
    ]);

    const analytics = {
      eventId,
      totalParticipants: participants.total,
      totalTeams: teams.total,
      totalIdeas: ideas.total,
      registrationRate: participants.dailyRate,
      teamFormationRate: teams.dailyRate,
      ideaSubmissionRate: ideas.dailyRate,
      engagementScore: await this.calculateEngagementScore(eventId),
      successPrediction: await this.predictEventSuccess(eventId),
      lastUpdated: new Date().toISOString(),
    };

    // Cache analytics data
    await this.cacheAnalytics(eventId, analytics);

    return analytics;
  }

  // MANDATORY: AI-powered event insights
  async generateEventInsights(eventId: string): Promise<AIInsight[]> {
    const analytics = await this.getEventAnalytics(eventId);
    const historicalData = await this.getHistoricalEventData();

    const prompt = `Analyze this hackathon event's performance and generate insights:
    
    Current Event Metrics:
    - Participants: ${analytics.totalParticipants}
    - Teams: ${analytics.totalTeams}
    - Ideas: ${analytics.totalIdeas}
    - Registration Rate: ${analytics.registrationRate} per day
    - Team Formation Rate: ${analytics.teamFormationRate} per day
    - Engagement Score: ${analytics.engagementScore}/10
    
    Historical Benchmark (average):
    - Participants: ${historicalData.avgParticipants}
    - Teams: ${historicalData.avgTeams}
    - Ideas: ${historicalData.avgIdeas}
    
    Generate 5-7 specific insights about:
    1. Performance vs benchmarks
    2. Participant engagement patterns
    3. Team formation effectiveness
    4. Idea quality and diversity
    5. Potential areas for improvement
    6. Success indicators
    
    Each insight should be actionable and specific.`;

    const response = await geminiClient.generateJSON({
      prompt,
      schema: {
        type: 'object',
        properties: {
          insights: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                category: {
                  type: 'string',
                  enum: ['performance', 'engagement', 'teams', 'ideas', 'improvement'],
                },
                impact: { type: 'string', enum: ['high', 'medium', 'low'] },
                recommendation: { type: 'string' },
              },
            },
          },
        },
      },
    });

    // Save insights to database
    await dynamodb.put({
      PK: `ANALYTICS#${eventId}`,
      SK: `INSIGHTS#${new Date().toISOString().split('T')[0]}`,
      GSI1PK: `EVENT#${eventId}`,
      GSI1SK: `INSIGHTS#${new Date().toISOString().split('T')[0]}`,
      insights: response.insights,
      generatedAt: new Date().toISOString(),
    });

    return response.insights;
  }

  // MANDATORY: AI-powered success prediction
  async predictEventSuccess(eventId: string): Promise<number> {
    const analytics = await this.getEventAnalytics(eventId);
    const event = await this.getEventDetails(eventId);

    const prompt = `Predict the success of this hackathon event on a scale of 1-10:
    
    Event Details:
    - Days until event: ${this.getDaysUntilEvent(event.startDate)}
    - Target participants: ${event.maxParticipants}
    - Current participants: ${analytics.totalParticipants}
    - Teams formed: ${analytics.totalTeams}
    - Ideas submitted: ${analytics.totalIdeas}
    - Registration rate: ${analytics.registrationRate} per day
    - Engagement score: ${analytics.engagementScore}/10
    
    Consider:
    1. Registration momentum vs time remaining
    2. Team formation rate and balance
    3. Idea quality and diversity
    4. Participant engagement levels
    5. Historical success patterns
    
    Return only the numeric score (1-10).`;

    const response = await geminiClient.generateText({
      prompt,
      maxTokens: 10,
    });

    return parseInt(response.text.trim()) || 5;
  }

  // MANDATORY: AI-powered improvement recommendations
  async recommendImprovements(eventId: string): Promise<string[]> {
    const analytics = await this.getEventAnalytics(eventId);
    const insights = await this.generateEventInsights(eventId);

    const prompt = `Based on this hackathon's analytics and insights, recommend 5-7 specific improvements:
    
    Current Performance:
    - Engagement Score: ${analytics.engagementScore}/10
    - Success Prediction: ${analytics.successPrediction}/10
    - Registration Rate: ${analytics.registrationRate} per day
    - Team Formation Rate: ${analytics.teamFormationRate} per day
    
    Key Insights: ${JSON.stringify(insights.map((i) => i.title + ': ' + i.description))}
    
    Provide specific, actionable recommendations that the organizer can implement to improve:
    1. Participant engagement
    2. Team formation efficiency
    3. Idea quality and diversity
    4. Overall event success
    
    Each recommendation should be concrete and implementable.`;

    const response = await geminiClient.generateJSON({
      prompt,
      schema: {
        type: 'object',
        properties: {
          recommendations: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return response.recommendations;
  }

  // MANDATORY: AI-powered participant behavior analysis
  async analyzeParticipantBehavior(eventId: string): Promise<BehaviorAnalysis> {
    const participantData = await this.getDetailedParticipantData(eventId);

    const prompt = `Analyze participant behavior patterns for this hackathon:
    
    Participant Data: ${JSON.stringify(participantData)}
    
    Analyze:
    1. Engagement patterns (when are participants most active?)
    2. Skill distribution and gaps
    3. Team formation preferences
    4. Idea submission patterns
    5. Geographic and demographic insights
    6. Retention and dropout patterns
    
    Provide insights that help organizers better understand their audience.`;

    const response = await geminiClient.generateJSON({
      prompt,
      schema: {
        type: 'object',
        properties: {
          engagementPatterns: { type: 'string' },
          skillInsights: { type: 'string' },
          teamPreferences: { type: 'string' },
          ideaPatterns: { type: 'string' },
          demographicInsights: { type: 'string' },
          retentionAnalysis: { type: 'string' },
          recommendations: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return response;
  }

  async getParticipantStats(eventId: string): Promise<ParticipantStats> {
    // Aggregate participant statistics
  }

  async getTeamStats(eventId: string): Promise<TeamStats> {
    // Aggregate team formation statistics
  }

  async getIdeaStats(eventId: string): Promise<IdeaStats> {
    // Aggregate idea submission statistics
  }

  async generateEventReport(eventId: string): Promise<EventReport> {
    // Generate comprehensive event report with all analytics
  }
}
```

### Step 2: Frontend Implementation

**File Structure:**

```
client/src/
├── components/analytics/
│   ├── AnalyticsDashboard.tsx   # Main dashboard
│   ├── EventMetricsCard.tsx     # Metrics cards
│   ├── ParticipantAnalytics.tsx # Participant charts
│   ├── TeamFormationChart.tsx   # Team formation viz
│   ├── IdeaTrendsChart.tsx      # Idea trends
│   ├── AIInsightsPanel.tsx      # AI insights
│   └── AnalyticsCharts.tsx      # Reusable chart components
├── pages/analytics/
│   ├── EventAnalyticsPage.tsx   # Main analytics page
│   └── AnalyticsReportPage.tsx  # Detailed report page
├── hooks/
│   └── useAnalytics.ts          # Analytics data hooks
└── types/
    └── analytics.ts             # Analytics types
```

**Main Dashboard Component:**

```typescript
// components/analytics/AnalyticsDashboard.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventMetricsCard } from './EventMetricsCard';
import { ParticipantAnalytics } from './ParticipantAnalytics';
import { TeamFormationChart } from './TeamFormationChart';
import { IdeaTrendsChart } from './IdeaTrendsChart';
import { AIInsightsPanel } from './AIInsightsPanel';
import { useAnalytics } from '@/hooks/useAnalytics';
import { TrendingUp, Users, Lightbulb, Target, Download } from 'lucide-react';

interface AnalyticsDashboardProps {
  eventId: string;
}

export const AnalyticsDashboard = ({ eventId }: AnalyticsDashboardProps) => {
  const {
    analytics,
    insights,
    loading,
    refreshAnalytics,
    generateReport
  } = useAnalytics(eventId);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Event Analytics</h1>
          <p className="text-gray-600">
            Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshAnalytics}>
            Refresh Data
          </Button>
          <Button onClick={generateReport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EventMetricsCard
          title="Total Participants"
          value={analytics.totalParticipants}
          change={`+${analytics.registrationRate}/day`}
          icon={Users}
          trend="up"
        />
        <EventMetricsCard
          title="Teams Formed"
          value={analytics.totalTeams}
          change={`+${analytics.teamFormationRate}/day`}
          icon={Target}
          trend="up"
        />
        <EventMetricsCard
          title="Ideas Submitted"
          value={analytics.totalIdeas}
          change={`+${analytics.ideaSubmissionRate}/day`}
          icon={Lightbulb}
          trend="up"
        />
        <EventMetricsCard
          title="Success Prediction"
          value={`${analytics.successPrediction}/10`}
          change={`${analytics.engagementScore}/10 engagement`}
          icon={TrendingUp}
          trend={analytics.successPrediction >= 7 ? "up" : analytics.successPrediction >= 4 ? "neutral" : "down"}
        />
      </div>

      {/* AI Insights */}
      <AIInsightsPanel insights={insights} eventId={eventId} />

      {/* Detailed Analytics */}
      <Tabs defaultValue="participants" className="space-y-4">
        <TabsList>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="teams">Team Formation</TabsTrigger>
          <TabsTrigger value="ideas">Ideas & Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="space-y-4">
          <ParticipantAnalytics eventId={eventId} />
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <TeamFormationChart eventId={eventId} />
        </TabsContent>

        <TabsContent value="ideas" className="space-y-4">
          <IdeaTrendsChart eventId={eventId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

**AI Insights Panel:**

```typescript
// components/analytics/AIInsightsPanel.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface AIInsightsPanelProps {
  insights: AIInsight[];
  eventId: string;
}

export const AIInsightsPanel = ({ insights, eventId }: AIInsightsPanelProps) => {
  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'performance': return TrendingUp;
      case 'improvement': return AlertTriangle;
      case 'success': return CheckCircle;
      default: return Sparkles;
    }
  };

  const getInsightColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI-Powered Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {insights.map((insight, index) => {
            const Icon = getInsightIcon(insight.category);
            return (
              <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <h3 className="font-medium">{insight.title}</h3>
                  </div>
                  <Badge variant={getInsightColor(insight.impact)}>
                    {insight.impact} impact
                  </Badge>
                </div>
                <p className="text-gray-600 mb-3">{insight.description}</p>
                {insight.recommendation && (
                  <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                    <p className="text-sm font-medium text-blue-800">Recommendation:</p>
                    <p className="text-sm text-blue-700">{insight.recommendation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
```

### Step 3: Chart Components

```typescript
// components/analytics/AnalyticsCharts.tsx
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const ParticipantGrowthChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="participants" stroke="#8884d8" strokeWidth={2} />
      <Line type="monotone" dataKey="teams" stroke="#82ca9d" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
);

export const SkillDistributionChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="skill" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="count" fill="#8884d8" />
    </BarChart>
  </ResponsiveContainer>
);

export const IdeaCategoryChart = ({ data }: { data: any[] }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};
```

## Acceptance Criteria

- [ ] Comprehensive analytics dashboard with key metrics
- [ ] Real-time data visualization with interactive charts
- [ ] **AI Feature Working:** Event insights, success predictions, and improvement recommendations
- [ ] **Demo Ready:** Can showcase analytics insights in 30 seconds
- [ ] **Integration:** Works seamlessly with F04 (Event Management)
- [ ] **Export Functionality:** Generate and download analytics reports
- [ ] **Mobile Responsive:** Dashboard works on all device sizes
- [ ] **Performance:** Fast loading with efficient data aggregation

## Related Modules

- **Depends On:** F04 (Event Management)
- **Enables:** M12 (Advanced Analytics), M13 (Real-time Dashboard), M16 (Admin Super Dashboard)
- **Conflicts With:** None
