# Module M06: Dynamic Landing + Leaderboards

## Overview

**Estimated Time:** 1hr

**Complexity:** Simple

**Type:** Full-stack

**Risk Level:** Low

**Dependencies:** F02 (Platform Landing Page), F01 (Idea Pitch Management)

## Problem Context

Building on the static landing page foundation, this module transforms it into a dynamic showcase that displays real platform activity, top ideas, and community engagement. This creates social proof and excitement for new visitors while providing existing users with a compelling dashboard view of platform activity.

## Technical Requirements

**Module Type:** Full-stack (Integration module - enhances F02 with F01 data)

### Backend Tasks

- [ ] **Handler Files:** Create analytics and public data handlers
  - `handlers/getPublicStats.ts` - GET /api/public/stats
  - `handlers/getTopIdeas.ts` - GET /api/public/top-ideas
  - `handlers/getFeaturedContent.ts` - GET /api/public/featured
  - `handlers/getRecentActivity.ts` - GET /api/public/activity

- [ ] **Function Configs:** Create serverless function configurations
  - `functions/getPublicStats.yml` - Public platform statistics
  - `functions/getTopIdeas.yml` - Top-rated ideas for showcase
  - `functions/getFeaturedContent.yml` - Curated featured content
  - `functions/getRecentActivity.yml` - Recent platform activity feed

- [ ] **Service Layer:** Create analytics service
  - `services/PublicAnalyticsService.ts` - Public-facing analytics
  - Aggregate statistics calculation
  - Featured content curation logic
  - Activity feed generation
  - Caching for performance

- [ ] **Type Definitions:** Add analytics types
  - `PublicStatsResponse`, `TopIdeasResponse`, `ActivityFeedResponse`
  - `PlatformMetrics`, `FeaturedContent`, `ActivityItem` interfaces

- [ ] **RBAC Verification:** Public endpoints (no authentication required)
  - All endpoints are public for landing page display
  - No sensitive data exposed in public APIs

### Frontend Tasks

- [ ] **Enhanced Components:** Extend existing F02 landing components
  - Update `components/landing/StatsSection.tsx` with real data
  - Update `components/landing/HeroSection.tsx` with live metrics
  - Add `components/landing/TopIdeasShowcase.tsx` - Featured ideas carousel
  - Add `components/landing/ActivityFeed.tsx` - Recent platform activity
  - Add `components/landing/LiveLeaderboard.tsx` - Mini leaderboard widget

- [ ] **New Components:** Create dynamic content components
  - `components/landing/RealTimeCounter.tsx` - Animated live counters
  - `components/landing/FeaturedIdea.tsx` - Highlighted idea card
  - `components/landing/CommunityHighlights.tsx` - Success stories
  - `components/landing/TrendingTopics.tsx` - Popular tech stacks/skills

- [ ] **Enhanced Pages:** Update existing F02 pages
  - Update `pages/LandingPage.tsx` with dynamic content sections
  - Update `pages/HowItWorksPage.tsx` with real examples
  - Add live data to testimonials and success metrics

- [ ] **API Integration:** Connect to analytics APIs
  - `hooks/usePublicStats.ts` - Public statistics hook
  - `services/publicApi.ts` - Public API service functions
  - Real-time data fetching with caching

- [ ] **State Management:** Live data state management
  - Auto-refreshing statistics
  - Cached data with smart refresh intervals
  - Loading states for dynamic content

### Database Schema Extensions (Single Table)

```
# Public Statistics Cache (for performance)
PK: CACHE#PUBLIC_STATS | SK: CURRENT
- totalParticipants: number
- totalIdeas: number
- teamsFormed: number
- successfulProjects: number
- topTechStacks: string[] (most popular technologies)
- topSkills: string[] (most common skills)
- recentSignups: number (last 7 days)
- activeIdeas: number (ideas with recent activity)
- lastUpdated: ISO string
- cacheExpiry: ISO string

# Featured Content
PK: FEATURED#[type] | SK: [id] | GSI1PK: FEATURED#ACTIVE | GSI1SK: [priority]
- type: 'idea' | 'team' | 'success_story'
- contentId: string (reference to actual content)
- title: string
- description: string
- imageUrl?: string
- priority: number (for ordering)
- isActive: boolean
- featuredAt: ISO string
- featuredBy: string (admin user ID)

# Activity Feed Items
PK: ACTIVITY#[date] | SK: [timestamp]#[type] | GSI1PK: ACTIVITY#PUBLIC | GSI1SK: [timestamp]
- type: 'idea_created' | 'team_formed' | 'vote_milestone' | 'user_joined'
- title: string (display title)
- description: string (activity description)
- actorName: string (anonymized user name)
- metadata: object (additional context)
- isPublic: boolean (show on public feed)
- createdAt: ISO string
```

## Enhancement Features

### Enhancement Feature: Real-Time Activity Dashboard

**Problem Solved:** Static landing pages don't convey the vibrant, active community that makes hackathon platforms compelling to join.

**Enhancement Type:** Smart Logic + Real-time Updates - Live activity feed with intelligent content curation

**User Trigger:** Automatic display on landing page with real-time updates every 30 seconds

**Input Requirements:**

- **Required Fields:** Platform activity data from various modules
- **Optional Fields:** User preferences for activity types
- **Validation Rules:** Activities must be public-safe (no sensitive data)

**Processing Logic:**

1. **Activity Aggregation:** Collect activities from all modules (ideas, teams, votes)
2. **Content Curation:** Filter and prioritize interesting activities for public display
3. **Real-time Updates:** Push new activities to landing page visitors
4. **Performance Optimization:** Cache frequently accessed data

**COMPLETE IMPLEMENTATION SPECIFICATION:**

**Types Definition:**

```typescript
// types.ts - Add these exact types
export interface PublicStatsResponse {
  totalParticipants: number;
  totalIdeas: number;
  teamsFormed: number;
  successfulProjects: number;
  topTechStacks: Array<{ name: string; count: number }>;
  topSkills: Array<{ name: string; count: number }>;
  recentActivity: {
    newIdeas: number;
    newTeams: number;
    newUsers: number;
  };
  lastUpdated: string;
}

export interface ActivityItem {
  id: string;
  type: 'idea_created' | 'team_formed' | 'vote_milestone' | 'user_joined';
  title: string;
  description: string;
  actorName: string;
  timestamp: string;
  metadata?: {
    ideaTitle?: string;
    teamName?: string;
    voteCount?: number;
    techStack?: string[];
  };
}

export interface TopIdeasResponse {
  ideas: Array<{
    id: string;
    title: string;
    description: string;
    voteCount: number;
    techStack: string[];
    creatorName: string;
  }>;
  totalIdeas: number;
}

export interface FeaturedContent {
  id: string;
  type: 'idea' | 'team' | 'success_story';
  title: string;
  description: string;
  imageUrl?: string;
  priority: number;
  metadata?: any;
}
```

**Frontend Component:**

```typescript
// components/landing/RealTimeActivityDashboard.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Users,
  Lightbulb,
  UserCheck,
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react';

export const RealTimeActivityDashboard = () => {
  const [stats, setStats] = useState<PublicStatsResponse | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [topIdeas, setTopIdeas] = useState<TopIdeasResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadInitialData, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadInitialData = async () => {
    try {
      const [statsRes, activityRes, ideasRes] = await Promise.all([
        fetch('/api/public/stats'),
        fetch('/api/public/activity'),
        fetch('/api/public/top-ideas')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setActivities(activityData.data.activities || []);
      }

      if (ideasRes.ok) {
        const ideasData = await ideasRes.json();
        setTopIdeas(ideasData.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'idea_created': return <Lightbulb className="w-4 h-4 text-yellow-600" />;
      case 'team_formed': return <UserCheck className="w-4 h-4 text-green-600" />;
      case 'vote_milestone': return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'user_joined': return <Users className="w-4 h-4 text-purple-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-br from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                  <div className="h-8 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            Live Community Activity
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what's happening right now in our hackathon community
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Live Statistics */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Platform Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {stats.totalParticipants.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Participants</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {stats.totalIdeas.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Ideas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {stats.teamsFormed.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Teams</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {stats.successfulProjects.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Projects</div>
                    </div>
                  </div>

                  {/* Recent Activity Summary */}
                  <div className="pt-4 border-t">
                    <div className="text-sm font-medium mb-2">Last 24 hours:</div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>• {stats.recentActivity.newIdeas} new ideas</div>
                      <div>• {stats.recentActivity.newTeams} teams formed</div>
                      <div>• {stats.recentActivity.newUsers} new participants</div>
                    </div>
                  </div>

                  {/* Top Tech Stacks */}
                  {stats.topTechStacks.length > 0 && (
                    <div className="pt-4 border-t">
                      <div className="text-sm font-medium mb-2">Trending Tech:</div>
                      <div className="flex flex-wrap gap-1">
                        {stats.topTechStacks.slice(0, 6).map((tech) => (
                          <Badge key={tech.name} variant="secondary" className="text-xs">
                            {tech.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity Feed */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Live Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activities.slice(0, 10).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium line-clamp-1">
                        {activity.title}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {activity.description}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Ideas Showcase */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Top Ideas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topIdeas?.ideas.slice(0, 5).map((idea, index) => (
                  <div key={idea.id} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-start gap-2">
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                        #{index + 1}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium line-clamp-1">
                          {idea.title}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {idea.description}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-green-600" />
                            <span className="text-xs font-medium">{idea.voteCount} votes</span>
                          </div>
                          {idea.techStack.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {idea.techStack[0]}
                              {idea.techStack.length > 1 && ` +${idea.techStack.length - 1}`}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/ideas/leaderboard">
                    View Full Leaderboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live updates every 30 seconds
          </div>
          <div>
            <Button size="lg" asChild>
              <Link to="/sign-up">
                Join the Community
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
```

**Backend Service Method:**

```typescript
// services/PublicAnalyticsService.ts
export class PublicAnalyticsService {
  async getPublicStats(): Promise<PublicStatsResponse> {
    try {
      // Check cache first
      const cached = await this.getCachedStats();
      if (cached && !this.isCacheExpired(cached)) {
        return cached;
      }

      // Calculate fresh statistics
      const stats = await this.calculateFreshStats();

      // Cache the results
      await this.cacheStats(stats);

      return stats;
    } catch (error) {
      console.error('Failed to get public stats:', error);
      throw new Error('Failed to retrieve platform statistics');
    }
  }

  private async calculateFreshStats(): Promise<PublicStatsResponse> {
    // Get participant count
    const participantCount = await this.getParticipantCount();

    // Get idea count
    const ideaCount = await this.getIdeaCount();

    // Get team count
    const teamCount = await this.getTeamCount();

    // Get successful projects (placeholder - could be based on completed hackathons)
    const successfulProjects = Math.floor(teamCount * 0.6); // Estimate

    // Get top tech stacks
    const topTechStacks = await this.getTopTechStacks();

    // Get top skills
    const topSkills = await this.getTopSkills();

    // Get recent activity (last 7 days)
    const recentActivity = await this.getRecentActivity();

    return {
      totalParticipants: participantCount,
      totalIdeas: ideaCount,
      teamsFormed: teamCount,
      successfulProjects,
      topTechStacks,
      topSkills,
      recentActivity,
      lastUpdated: new Date().toISOString(),
    };
  }

  private async getParticipantCount(): Promise<number> {
    // Count unique users with profiles
    const params = {
      TableName: process.env.DYNAMODB_TABLE!,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: {
        ':pk': 'USER#PROFILE',
      },
      Select: 'COUNT',
    };

    const result = await dynamodb.query(params);
    return result.Count || 0;
  }

  private async getIdeaCount(): Promise<number> {
    // Count published ideas
    const params = {
      TableName: process.env.DYNAMODB_TABLE!,
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': 'published',
      },
      Select: 'COUNT',
    };

    const result = await dynamodb.scan(params);
    return result.Count || 0;
  }

  private async getTeamCount(): Promise<number> {
    // Count active teams
    const params = {
      TableName: process.env.DYNAMODB_TABLE!,
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': 'forming',
      },
      Select: 'COUNT',
    };

    const result = await dynamodb.scan(params);
    return result.Count || 0;
  }

  private async getTopTechStacks(): Promise<Array<{ name: string; count: number }>> {
    // Aggregate tech stacks from ideas and profiles
    const techStackCounts = new Map<string, number>();

    // Get tech stacks from ideas
    const ideas = await this.getAllIdeas();
    ideas.forEach((idea) => {
      if (idea.techStack) {
        idea.techStack.forEach((tech) => {
          techStackCounts.set(tech, (techStackCounts.get(tech) || 0) + 1);
        });
      }
    });

    // Get tech stacks from profiles
    const profiles = await this.getAllProfiles();
    profiles.forEach((profile) => {
      if (profile.techStack) {
        profile.techStack.forEach((tech) => {
          techStackCounts.set(tech, (techStackCounts.get(tech) || 0) + 1);
        });
      }
    });

    // Convert to sorted array
    return Array.from(techStackCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private async getRecentActivity(): Promise<{
    newIdeas: number;
    newTeams: number;
    newUsers: number;
  }> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoff = sevenDaysAgo.toISOString();

    // Count new ideas
    const newIdeas = await this.countRecentItems('IDEA#', cutoff);

    // Count new teams
    const newTeams = await this.countRecentItems('TEAM#', cutoff);

    // Count new users
    const newUsers = await this.countRecentItems('USER#', cutoff);

    return { newIdeas, newTeams, newUsers };
  }

  private async countRecentItems(prefix: string, since: string): Promise<number> {
    const params = {
      TableName: process.env.DYNAMODB_TABLE!,
      FilterExpression: 'begins_with(PK, :prefix) AND createdAt >= :since',
      ExpressionAttributeValues: {
        ':prefix': prefix,
        ':since': since,
      },
      Select: 'COUNT',
    };

    const result = await dynamodb.scan(params);
    return result.Count || 0;
  }

  async getRecentActivityFeed(): Promise<ActivityItem[]> {
    try {
      // Get recent activities from the last 24 hours
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const activities: ActivityItem[] = [];

      // Get recent ideas
      const recentIdeas = await this.getRecentIdeas(oneDayAgo);
      activities.push(
        ...recentIdeas.map((idea) => ({
          id: `idea-${idea.id}`,
          type: 'idea_created' as const,
          title: `New idea: ${idea.title}`,
          description: `${idea.creatorName} shared a new hackathon idea`,
          actorName: idea.creatorName,
          timestamp: idea.createdAt,
          metadata: {
            ideaTitle: idea.title,
            techStack: idea.techStack,
          },
        }))
      );

      // Get recent teams
      const recentTeams = await this.getRecentTeams(oneDayAgo);
      activities.push(
        ...recentTeams.map((team) => ({
          id: `team-${team.id}`,
          type: 'team_formed' as const,
          title: `Team formed: ${team.name}`,
          description: `${team.leaderName} created a new team`,
          actorName: team.leaderName,
          timestamp: team.createdAt,
          metadata: {
            teamName: team.name,
          },
        }))
      );

      // Sort by timestamp (most recent first)
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return activities.slice(0, 20); // Return top 20 activities
    } catch (error) {
      console.error('Failed to get activity feed:', error);
      return [];
    }
  }

  async getTopIdeas(): Promise<TopIdeasResponse> {
    try {
      // Get ideas sorted by vote count
      const ideas = await this.getIdeasWithVotes();

      const topIdeas = ideas
        .sort((a, b) => (b.netVotes || 0) - (a.netVotes || 0))
        .slice(0, 10)
        .map((idea) => ({
          id: idea.id,
          title: idea.title,
          description: idea.description,
          voteCount: idea.netVotes || 0,
          techStack: idea.techStack || [],
          creatorName: idea.creatorName || 'Anonymous',
        }));

      return {
        ideas: topIdeas,
        totalIdeas: ideas.length,
      };
    } catch (error) {
      console.error('Failed to get top ideas:', error);
      return { ideas: [], totalIdeas: 0 };
    }
  }

  private async getCachedStats(): Promise<PublicStatsResponse | null> {
    try {
      const params = {
        TableName: process.env.DYNAMODB_TABLE!,
        Key: {
          PK: 'CACHE#PUBLIC_STATS',
          SK: 'CURRENT',
        },
      };

      const result = await dynamodb.get(params);
      return result.Item as PublicStatsResponse | null;
    } catch (error) {
      return null;
    }
  }

  private async cacheStats(stats: PublicStatsResponse): Promise<void> {
    const cacheItem = {
      PK: 'CACHE#PUBLIC_STATS',
      SK: 'CURRENT',
      ...stats,
      cacheExpiry: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
    };

    await dynamodb.put(cacheItem);
  }

  private isCacheExpired(cached: any): boolean {
    return new Date() > new Date(cached.cacheExpiry);
  }
}

export const publicAnalyticsService = new PublicAnalyticsService();
```

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** Read `guidelines/project-architecture.md` and review F02 and F01 implementations.

### Step 1: Backend Implementation (Extends F02)

**File Structure:**

```
backend/src/modules/public/ (new module)
├── handlers/
│   ├── getPublicStats.ts
│   ├── getTopIdeas.ts
│   ├── getFeaturedContent.ts
│   └── getRecentActivity.ts
├── functions/
│   ├── getPublicStats.yml
│   ├── getTopIdeas.yml
│   ├── getFeaturedContent.yml
│   └── getRecentActivity.yml
├── services/
│   └── PublicAnalyticsService.ts
└── types.ts
```

### Step 2: Frontend Implementation (Extends F02)

**File Structure:**

```
client/src/
├── components/landing/ (extend existing F02)
│   ├── RealTimeActivityDashboard.tsx
│   ├── TopIdeasShowcase.tsx
│   ├── ActivityFeed.tsx
│   ├── LiveLeaderboard.tsx
│   └── Update existing components with real data
├── hooks/
│   └── usePublicStats.ts
├── services/
│   └── publicApi.ts
└── Update existing F02 pages with dynamic content
```

### Step 3: Integration with F02 and F01

- [ ] **Update F02 Components:** Replace mock data with real API calls
- [ ] **Add Real-time Updates:** Implement auto-refresh for live statistics
- [ ] **Performance Optimization:** Add caching and smart refresh intervals
- [ ] **SEO Enhancement:** Add structured data for better search visibility

## Acceptance Criteria

- [ ] Landing page displays real platform statistics with live updates
- [ ] Top ideas showcase highlights community's best content
- [ ] Activity feed shows recent platform activity in real-time
- [ ] Statistics update automatically every 30 seconds without page refresh
- [ ] Public APIs are performant with proper caching (sub-2 second response)
- [ ] All dynamic content gracefully handles loading and error states
- [ ] **Demo Ready:** Can showcase live platform activity in 30 seconds
- [ ] **Integration Working:** Seamlessly enhances F02 with F01 data
- [ ] **Mobile Responsive:** All dynamic content works perfectly on mobile

## Testing Checklist

- [ ] **Manual API Testing:**
  - Public stats API returns accurate data
  - Top ideas API shows correctly ranked ideas
  - Activity feed API returns recent activities
  - All APIs work without authentication
  - Caching reduces database load

- [ ] **Frontend Testing:**
  - Statistics display with proper formatting
  - Real-time updates work without page refresh
  - Loading states show during data fetching
  - Error states handle API failures gracefully
  - Auto-refresh doesn't interfere with user interactions

- [ ] **Integration:** Dynamic content integrates seamlessly with existing F02 landing page
- [ ] **Performance:** Page loads quickly, real-time updates are smooth
- [ ] **Caching:** Statistics cache properly to reduce server load

## Deployment Checklist

- [ ] **CRITICAL - Type Check:** Run `bun run typecheck` in both backend and client
- [ ] **Serverless Config:** Add public API function imports to serverless.yml
- [ ] **Caching Strategy:** Ensure statistics caching is properly configured
- [ ] **Manual Testing:** Test all public APIs and real-time updates
- [ ] **F02 Integration:** Verify existing landing page functionality with new dynamic features
