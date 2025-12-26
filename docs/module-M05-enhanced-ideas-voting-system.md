# Module M05: Enhanced Ideas + Voting System

## Overview

**Estimated Time:** 1.5hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Low

**Dependencies:** F01 (Idea Pitch Management)

## Problem Context

Building on the foundation idea management system, this module adds community-driven validation through voting, commenting, and engagement tracking. Participants need to gauge community interest in their ideas before committing to them, and the platform needs to surface the most promising concepts through democratic feedback.

## Technical Requirements

**Module Type:** Full-stack (Integration module - enhances F01)

### Backend Tasks

- [ ] **Handler Files:** Create voting and engagement handlers
  - `handlers/voteIdea.ts` - POST /api/ideas/:id/vote
  - `handlers/unvoteIdea.ts` - DELETE /api/ideas/:id/vote
  - `handlers/getIdeaVotes.ts` - GET /api/ideas/:id/votes
  - `handlers/commentIdea.ts` - POST /api/ideas/:id/comments
  - `handlers/getIdeaComments.ts` - GET /api/ideas/:id/comments
  - `handlers/getLeaderboard.ts` - GET /api/ideas/leaderboard

- [ ] **Function Configs:** Create serverless function configurations
  - `functions/voteIdea.yml` - Vote on an idea (upvote/downvote)
  - `functions/unvoteIdea.yml` - Remove vote from idea
  - `functions/getIdeaVotes.yml` - Get vote details for idea
  - `functions/commentIdea.yml` - Add comment to idea
  - `functions/getIdeaComments.yml` - Get comments for idea
  - `functions/getLeaderboard.yml` - Get top ideas by votes and engagement

- [ ] **Service Layer:** Extend existing IdeaService with voting logic
  - Vote management with duplicate prevention
  - Comment threading and moderation
  - Leaderboard calculation with engagement scoring
  - Real-time vote count updates
  - Notification triggers for vote milestones

- [ ] **Type Definitions:** Add voting types to existing `types.ts`
  - `VoteRequest`, `CommentRequest`, `LeaderboardResponse`
  - `VoteType`, `EngagementMetrics` interfaces
  - `IdeaWithVotes`, `CommentWithReplies` extended types

- [ ] **RBAC Verification:** Module already configured in permissions.ts
  - Participants can vote on any ideas, manage own votes
  - All users can read votes and comments
  - Organizers can moderate comments

### Frontend Tasks

- [ ] **Components:** Create voting and engagement UI
  - `components/ideas/VotingButtons.tsx` - Upvote/downvote with counts
  - `components/ideas/CommentSection.tsx` - Comments with threading
  - `components/ideas/IdeaLeaderboard.tsx` - Top ideas ranking
  - `components/ideas/EngagementMetrics.tsx` - Vote/comment stats
  - `components/ideas/VoteHistory.tsx` - User's voting history

- [ ] **Enhanced Components:** Extend existing F01 components
  - Update `IdeaCard.tsx` to show vote counts and engagement
  - Update `IdeaDetails.tsx` to include voting and comments
  - Update `IdeaList.tsx` to support sorting by votes/engagement

- [ ] **Pages:** Create voting-focused pages
  - `pages/ideas/LeaderboardPage.tsx` - Top ideas by community votes
  - `pages/ideas/TrendingPage.tsx` - Recently popular ideas
  - Update existing idea pages to include voting features

- [ ] **API Integration:** Extend existing hooks
  - Update `hooks/useIdeas.ts` with voting operations
  - Add `hooks/useVoting.ts` for vote management
  - Add `hooks/useComments.ts` for comment operations

- [ ] **State Management:** Voting and engagement state
  - Real-time vote count updates
  - Comment state management
  - Leaderboard data caching

- [ ] **Routing:** Add voting routes
  - `/ideas/leaderboard` - Community top picks
  - `/ideas/trending` - Recently popular ideas
  - Update existing routes with voting features

### Database Schema Extensions (Single Table)

```
# Vote Entity
PK: IDEA#[ideaId] | SK: VOTE#[userId] | GSI1PK: USER#[userId] | GSI1SK: VOTE#[ideaId]
- ideaId: string
- userId: string (Clerk user ID)
- voteType: 'upvote' | 'downvote'
- votedAt: ISO string
- voterProfile: { name: string, avatar?: string } (denormalized for display)

# Comment Entity
PK: IDEA#[ideaId] | SK: COMMENT#[commentId] | GSI1PK: USER#[userId] | GSI1SK: COMMENT#[commentId]
- commentId: string (UUID)
- ideaId: string
- userId: string (Clerk user ID)
- content: string (required, 10-500 chars)
- parentCommentId?: string (for threading)
- createdAt: ISO string
- updatedAt: ISO string
- isEdited: boolean
- authorProfile: { name: string, avatar?: string } (denormalized)

# Engagement Metrics (Updated Idea Entity)
PK: IDEA#[ideaId] | SK: DETAILS (extend existing)
- Add these fields to existing idea entity:
- upvotes: number (calculated count)
- downvotes: number (calculated count)
- netVotes: number (upvotes - downvotes)
- commentCount: number (calculated count)
- engagementScore: number (weighted score for ranking)
- lastActivityAt: ISO string (last vote or comment)
- trendingScore: number (time-weighted engagement)
```

## Enhancement Features

### Enhancement Feature: Smart Engagement Analytics

**Problem Solved:** Simple vote counts don't tell the full story - ideas need sophisticated ranking that considers recency, engagement quality, and momentum to surface truly promising concepts.

**Enhancement Type:** Smart Logic - Advanced scoring algorithm with real-time trend detection

**User Trigger:** Automatic calculation on all vote/comment actions, displayed in leaderboards

**Input Requirements:**

- **Required Fields:** Vote and comment data from database
- **Optional Fields:** Time-based weighting preferences, category filters
- **Validation Rules:** Minimum 3 votes or 1 comment for trending eligibility

**Processing Logic:**

1. **Engagement Scoring:** Calculate weighted score from votes, comments, and recency
2. **Trend Detection:** Identify ideas gaining momentum in recent time windows
3. **Quality Metrics:** Factor in comment quality and voter diversity
4. **Ranking Algorithm:** Combine multiple signals for fair, dynamic ranking

**COMPLETE IMPLEMENTATION SPECIFICATION:**

**Types Definition:**

```typescript
// types.ts - Add these exact types
export interface EngagementMetrics {
  upvotes: number;
  downvotes: number;
  netVotes: number;
  commentCount: number;
  engagementScore: number;
  trendingScore: number;
  lastActivityAt: string;
  voterDiversity: number; // unique voters / total votes
  averageCommentLength: number;
  recentActivity: {
    last24h: { votes: number; comments: number };
    last7d: { votes: number; comments: number };
  };
}

export interface LeaderboardEntry {
  idea: IdeaResponse;
  metrics: EngagementMetrics;
  rank: number;
  rankChange: number; // change from previous period
  trendingReason?: string;
}

export interface LeaderboardResponse {
  topIdeas: LeaderboardEntry[];
  trendingIdeas: LeaderboardEntry[];
  totalIdeas: number;
  lastUpdated: string;
  timeframe: '24h' | '7d' | 'all';
}
```

**Frontend Component:**

```typescript
// components/ideas/IdeaLeaderboard.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, TrendingUp, ArrowUp, ArrowDown, MessageCircle, Users } from 'lucide-react';
import { IdeaCard } from './IdeaCard';

export const IdeaLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | 'all'>('7d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [timeframe]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/ideas/leaderboard?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${await getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.data);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-3 h-3 text-green-600" />;
    if (change < 0) return <ArrowDown className="w-3 h-3 text-red-600" />;
    return <span className="w-3 h-3" />; // No change
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-300';
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-muted text-muted-foreground';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!leaderboard) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No leaderboard data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Community Leaderboard
          </h2>
          <p className="text-muted-foreground">
            Top ideas ranked by community engagement
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-2">
          {(['24h', '7d', 'all'] as const).map((period) => (
            <Button
              key={period}
              variant={timeframe === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(period)}
            >
              {period === '24h' ? '24 Hours' : period === '7d' ? '7 Days' : 'All Time'}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="top" className="space-y-4">
        <TabsList>
          <TabsTrigger value="top">Top Ideas</TabsTrigger>
          <TabsTrigger value="trending">Trending Now</TabsTrigger>
        </TabsList>

        <TabsContent value="top" className="space-y-4">
          {leaderboard.topIdeas.map((entry) => (
            <Card key={entry.idea.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Rank Badge */}
                  <div className="flex flex-col items-center gap-1">
                    <Badge className={`${getRankBadgeColor(entry.rank)} font-bold text-lg px-3 py-1`}>
                      #{entry.rank}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs">
                      {getRankChangeIcon(entry.rankChange)}
                      {entry.rankChange !== 0 && (
                        <span className={entry.rankChange > 0 ? 'text-green-600' : 'text-red-600'}>
                          {Math.abs(entry.rankChange)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Idea Content */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{entry.idea.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {entry.idea.description}
                    </p>

                    {/* Engagement Metrics */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <ArrowUp className="w-4 h-4 text-green-600" />
                        <span className="font-medium">{entry.metrics.upvotes}</span>
                        <span className="text-muted-foreground">upvotes</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{entry.metrics.commentCount}</span>
                        <span className="text-muted-foreground">comments</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">
                          {Math.round(entry.metrics.voterDiversity * 100)}%
                        </span>
                        <span className="text-muted-foreground">diversity</span>
                      </div>

                      <div className="ml-auto">
                        <Badge variant="secondary">
                          Score: {Math.round(entry.metrics.engagementScore)}
                        </Badge>
                      </div>
                    </div>

                    {/* Tech Stack */}
                    {entry.idea.techStack && entry.idea.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {entry.idea.techStack.slice(0, 4).map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {entry.idea.techStack.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{entry.idea.techStack.length - 4} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* View Button */}
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/ideas/${entry.idea.id}`}>
                      View Idea
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          {leaderboard.trendingIdeas.map((entry) => (
            <Card key={entry.idea.id} className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Trending Icon */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Hot
                    </Badge>
                  </div>

                  {/* Idea Content */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{entry.idea.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {entry.idea.description}
                    </p>

                    {/* Trending Reason */}
                    {entry.trendingReason && (
                      <div className="mb-3">
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          {entry.trendingReason}
                        </Badge>
                      </div>
                    )}

                    {/* Recent Activity */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-muted-foreground">
                        Last 24h:
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowUp className="w-3 h-3 text-green-600" />
                        <span>{entry.metrics.recentActivity.last24h.votes} votes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 text-blue-600" />
                        <span>{entry.metrics.recentActivity.last24h.comments} comments</span>
                      </div>
                      <div className="ml-auto">
                        <Badge variant="outline">
                          Trending Score: {Math.round(entry.metrics.trendingScore)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* View Button */}
                  <Button size="sm" asChild>
                    <Link to={`/ideas/${entry.idea.id}`}>
                      View Idea
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Footer Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Total ideas: {leaderboard.totalIdeas}</span>
            <span>Last updated: {new Date(leaderboard.lastUpdated).toLocaleTimeString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

**Backend Service Method:**

```typescript
// services/IdeaService.ts - Add these methods
async getLeaderboard(timeframe: '24h' | '7d' | 'all' = '7d'): Promise<LeaderboardResponse> {
  try {
    // Get all ideas with their engagement metrics
    const ideas = await this.getIdeasWithMetrics();

    // Calculate engagement scores for each idea
    const scoredIdeas = await Promise.all(
      ideas.map(async (idea) => {
        const metrics = await this.calculateEngagementMetrics(idea.id, timeframe);
        return {
          idea,
          metrics,
          rank: 0, // Will be set after sorting
          rankChange: 0 // TODO: Compare with previous period
        };
      })
    );

    // Sort by engagement score for top ideas
    const topIdeas = scoredIdeas
      .sort((a, b) => b.metrics.engagementScore - a.metrics.engagementScore)
      .slice(0, 20)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    // Sort by trending score for trending ideas
    const trendingIdeas = scoredIdeas
      .filter(entry => entry.metrics.trendingScore > 10) // Minimum threshold
      .sort((a, b) => b.metrics.trendingScore - a.metrics.trendingScore)
      .slice(0, 10)
      .map(entry => ({
        ...entry,
        trendingReason: this.getTrendingReason(entry.metrics)
      }));

    return {
      topIdeas,
      trendingIdeas,
      totalIdeas: ideas.length,
      lastUpdated: new Date().toISOString(),
      timeframe
    };
  } catch (error) {
    console.error('Failed to generate leaderboard:', error);
    throw new Error('Failed to generate leaderboard');
  }
}

private async calculateEngagementMetrics(ideaId: string, timeframe: string): Promise<EngagementMetrics> {
  // Get vote counts
  const votes = await this.getIdeaVotes(ideaId);
  const upvotes = votes.filter(v => v.voteType === 'upvote').length;
  const downvotes = votes.filter(v => v.voteType === 'downvote').length;
  const netVotes = upvotes - downvotes;

  // Get comment count and quality
  const comments = await this.getIdeaComments(ideaId);
  const commentCount = comments.length;
  const averageCommentLength = comments.length > 0
    ? comments.reduce((sum, c) => sum + c.content.length, 0) / comments.length
    : 0;

  // Calculate voter diversity (unique voters / total votes)
  const uniqueVoters = new Set(votes.map(v => v.userId)).size;
  const voterDiversity = votes.length > 0 ? uniqueVoters / votes.length : 0;

  // Calculate recent activity
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const recentVotes24h = votes.filter(v => new Date(v.votedAt) > last24h).length;
  const recentComments24h = comments.filter(c => new Date(c.createdAt) > last24h).length;
  const recentVotes7d = votes.filter(v => new Date(v.votedAt) > last7d).length;
  const recentComments7d = comments.filter(c => new Date(c.createdAt) > last7d).length;

  // Calculate engagement score (weighted combination of factors)
  let engagementScore = 0;

  // Vote score (40% of total)
  engagementScore += netVotes * 10; // Base points for net votes
  engagementScore += upvotes * 2; // Bonus for total engagement

  // Comment score (30% of total)
  engagementScore += commentCount * 15; // Comments are valuable
  engagementScore += (averageCommentLength / 50) * 5; // Quality bonus

  // Diversity bonus (20% of total)
  engagementScore += voterDiversity * 20;

  // Recency bonus (10% of total)
  engagementScore += recentVotes24h * 5;
  engagementScore += recentComments24h * 8;

  // Calculate trending score (emphasizes recent activity)
  let trendingScore = 0;
  trendingScore += recentVotes24h * 15;
  trendingScore += recentComments24h * 25;
  trendingScore += recentVotes7d * 3;
  trendingScore += recentComments7d * 5;

  // Boost for sustained engagement
  if (recentVotes24h > 0 && recentComments24h > 0) {
    trendingScore *= 1.5; // Combo bonus
  }

  const lastActivityAt = Math.max(
    ...votes.map(v => new Date(v.votedAt).getTime()),
    ...comments.map(c => new Date(c.createdAt).getTime()),
    0
  );

  return {
    upvotes,
    downvotes,
    netVotes,
    commentCount,
    engagementScore: Math.max(0, engagementScore),
    trendingScore: Math.max(0, trendingScore),
    lastActivityAt: new Date(lastActivityAt).toISOString(),
    voterDiversity,
    averageCommentLength,
    recentActivity: {
      last24h: { votes: recentVotes24h, comments: recentComments24h },
      last7d: { votes: recentVotes7d, comments: recentComments7d }
    }
  };
}

private getTrendingReason(metrics: EngagementMetrics): string {
  const { recentActivity } = metrics;

  if (recentActivity.last24h.votes >= 5 && recentActivity.last24h.comments >= 3) {
    return 'High engagement in last 24h';
  }

  if (recentActivity.last24h.votes >= 10) {
    return 'Lots of votes recently';
  }

  if (recentActivity.last24h.comments >= 5) {
    return 'Active discussion';
  }

  if (metrics.voterDiversity > 0.8) {
    return 'Broad community appeal';
  }

  return 'Rising popularity';
}

async voteOnIdea(ideaId: string, userId: string, voteType: 'upvote' | 'downvote'): Promise<void> {
  try {
    // Check if user already voted
    const existingVote = await this.getUserVoteOnIdea(ideaId, userId);

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Same vote type - remove vote
        await this.removeVote(ideaId, userId);
      } else {
        // Different vote type - update vote
        await this.updateVote(ideaId, userId, voteType);
      }
    } else {
      // New vote
      await this.addVote(ideaId, userId, voteType);
    }

    // Update idea vote counts
    await this.updateIdeaVoteCounts(ideaId);

    // TODO: Send notification to idea creator for milestone votes

  } catch (error) {
    console.error('Vote operation failed:', error);
    throw new Error('Failed to process vote');
  }
}

private async addVote(ideaId: string, userId: string, voteType: 'upvote' | 'downvote'): Promise<void> {
  const vote = {
    PK: `IDEA#${ideaId}`,
    SK: `VOTE#${userId}`,
    GSI1PK: `USER#${userId}`,
    GSI1SK: `VOTE#${ideaId}`,
    ideaId,
    userId,
    voteType,
    votedAt: new Date().toISOString(),
    voterProfile: await this.getUserProfile(userId) // Denormalize for display
  };

  await dynamodb.put(vote);
}

private async updateIdeaVoteCounts(ideaId: string): Promise<void> {
  const votes = await this.getIdeaVotes(ideaId);
  const upvotes = votes.filter(v => v.voteType === 'upvote').length;
  const downvotes = votes.filter(v => v.voteType === 'downvote').length;
  const netVotes = upvotes - downvotes;

  await dynamodb.update(
    { PK: `IDEA#${ideaId}`, SK: 'DETAILS' },
    {
      upvotes,
      downvotes,
      netVotes,
      lastActivityAt: new Date().toISOString()
    }
  );
}
```

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** Read `guidelines/project-architecture.md` and review F01 module implementation.

### Step 1: Backend Implementation (Extends F01)

**File Structure:**

```
backend/src/modules/ideas/ (extend existing)
├── handlers/ (add to existing)
│   ├── voteIdea.ts
│   ├── unvoteIdea.ts
│   ├── getIdeaVotes.ts
│   ├── commentIdea.ts
│   ├── getIdeaComments.ts
│   └── getLeaderboard.ts
├── functions/ (add to existing)
│   ├── voteIdea.yml
│   ├── unvoteIdea.yml
│   ├── getIdeaVotes.yml
│   ├── commentIdea.yml
│   ├── getIdeaComments.yml
│   └── getLeaderboard.yml
├── services/ (extend existing)
│   └── IdeaService.ts (add voting methods)
└── types.ts (extend existing)
```

### Step 2: Frontend Implementation (Extends F01)

**File Structure:**

```
client/src/
├── components/ideas/ (extend existing)
│   ├── VotingButtons.tsx
│   ├── CommentSection.tsx
│   ├── IdeaLeaderboard.tsx
│   ├── EngagementMetrics.tsx
│   └── VoteHistory.tsx
├── pages/ideas/ (add to existing)
│   ├── LeaderboardPage.tsx
│   └── TrendingPage.tsx
├── hooks/ (extend existing)
│   ├── useVoting.ts
│   └── useComments.ts
└── Update existing components with voting features
```

### Step 3: Integration with F01

- [ ] **Extend F01 Components:** Add voting buttons and engagement metrics to existing idea components
- [ ] **Update API Hooks:** Extend useIdeas hook with voting operations
- [ ] **Database Migration:** Add vote and comment entities to existing idea schema
- [ ] **Real-time Updates:** Implement vote count updates without page refresh

## Acceptance Criteria

- [ ] Participants can upvote/downvote ideas with immediate visual feedback
- [ ] Vote counts update in real-time across all users viewing the same idea
- [ ] Comment system allows threaded discussions on ideas
- [ ] Leaderboard shows top ideas by engagement with fair ranking algorithm
- [ ] Trending section highlights ideas gaining recent momentum
- [ ] Voting prevents duplicates and allows vote changes
- [ ] **Demo Ready:** Can vote, comment, and view leaderboard in 30 seconds
- [ ] **Integration Working:** Seamlessly extends F01 functionality
- [ ] **Mobile Responsive:** Voting and commenting work perfectly on mobile

## Testing Checklist

- [ ] **Manual API Testing:**
  - Vote on idea works and prevents duplicates
  - Vote counts update correctly in database
  - Comments can be added and retrieved
  - Leaderboard calculates engagement scores properly
  - Trending algorithm identifies rising ideas

- [ ] **Frontend Testing:**
  - Voting buttons show correct state (voted/not voted)
  - Vote counts update immediately after voting
  - Comment form validates and submits properly
  - Leaderboard displays with correct ranking
  - Real-time updates work across browser tabs

- [ ] **Integration:** Voting features integrate seamlessly with existing F01 idea management
- [ ] **Edge Cases:** Handle rapid voting, comment spam, network failures
- [ ] **Performance:** Leaderboard loads quickly, voting responds instantly

## Deployment Checklist

- [ ] **CRITICAL - Type Check:** Run `bun run typecheck` in both backend and client
- [ ] **Serverless Config:** Add new function imports to serverless.yml
- [ ] **Database Schema:** Ensure vote and comment entities are properly indexed
- [ ] **Manual Testing:** Test all voting and commenting operations
- [ ] **F01 Integration:** Verify existing idea functionality still works with new features
