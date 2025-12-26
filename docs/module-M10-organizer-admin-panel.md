# Module M10: Organizer Admin Panel

## Overview

**Estimated Time:** 1.5hr

**Complexity:** Medium

**Type:** Full-stack

**Risk Level:** Low

**Dependencies:** All previous modules (F01, F02, F03, F04, M05, M06, M07, M08, M09)

## Problem Context

Hackathon organizers need a comprehensive administrative interface to manage the entire platform, moderate content, view analytics, and ensure smooth operation of all features. This module creates a unified admin dashboard that brings together management capabilities for ideas, teams, users, notifications, and judging while providing insights into platform health and engagement.

## Technical Requirements

**Module Type:** Full-stack (Integration module - provides administrative interface for all previous modules)

### Backend Tasks

- [ ] **Handler Files:** Create admin management handlers
  - `handlers/getAdminDashboard.ts` - GET /api/admin/dashboard
  - `handlers/getContentModeration.ts` - GET /api/admin/moderation
  - `handlers/moderateContent.ts` - PUT /api/admin/moderation/:id
  - `handlers/getAnalytics.ts` - GET /api/admin/analytics
  - `handlers/exportData.ts` - GET /api/admin/export
  - `handlers/getSystemHealth.ts` - GET /api/admin/system-health

- [ ] **Function Configs:** Create serverless function configurations
  - `functions/getAdminDashboard.yml` - Admin dashboard data
  - `functions/getContentModeration.yml` - Content moderation queue
  - `functions/moderateContent.yml` - Moderate content items
  - `functions/getAnalytics.yml` - Platform analytics
  - `functions/exportData.yml` - Data export functionality
  - `functions/getSystemHealth.yml` - System health metrics

- [ ] **Service Layer:** Create admin service
  - `services/AdminService.ts` - Administrative operations
  - Cross-module analytics aggregation
  - Content moderation workflows
  - User management and role assignment
  - System health monitoring
  - Data export and reporting

- [ ] **Type Definitions:** Add admin types
  - `AdminDashboardData`, `ModerationQueue`, `PlatformAnalytics`
  - `ContentModerationAction`, `SystemHealthMetrics` interfaces
  - `ExportFormat`, `AnalyticsTimeframe` types

- [ ] **RBAC Verification:** Module already configured in permissions.ts
  - Organizers can access moderation and analytics features
  - Admins have full access to all administrative functions

### Frontend Tasks

- [ ] **Components:** Create admin interface components
  - `components/admin/AdminDashboard.tsx` - Main admin overview
  - `components/admin/ContentModerationPanel.tsx` - Content moderation interface
  - `components/admin/AnalyticsDashboard.tsx` - Platform analytics display
  - `components/admin/UserManagement.tsx` - User administration
  - `components/admin/SystemHealth.tsx` - System monitoring
  - `components/admin/DataExport.tsx` - Export functionality

- [ ] **Enhanced Components:** Extend existing admin components
  - Update existing `AdminDashboard.tsx` with comprehensive features
  - Integrate with all module management interfaces
  - Add cross-module analytics and insights

- [ ] **Pages:** Create admin-focused pages
  - `pages/admin/AdminDashboardPage.tsx` - Main admin interface
  - `pages/admin/ModerationPage.tsx` - Content moderation
  - `pages/admin/AnalyticsPage.tsx` - Detailed analytics
  - `pages/admin/SystemPage.tsx` - System administration

- [ ] **API Integration:** Create admin hooks
  - `hooks/useAdminDashboard.ts` - Admin dashboard data
  - `hooks/useModeration.ts` - Content moderation
  - `hooks/useAnalytics.ts` - Analytics data
  - `services/adminApi.ts` - Admin API service

- [ ] **State Management:** Admin interface state
  - Dashboard data aggregation
  - Moderation queue management
  - Analytics data caching
  - Real-time system health monitoring

### Database Schema Extensions (Single Table)

```
# Admin Dashboard Cache
PK: ADMIN#DASHBOARD | SK: [date]
- date: string (YYYY-MM-DD)
- totalUsers: number
- totalIdeas: number
- totalTeams: number
- totalVotes: number
- totalNotifications: number
- activeUsers24h: number
- newUsers24h: number
- engagementMetrics: {
  ideasCreated24h: number
  teamsFormed24h: number
  votescast24h: number
  commentsPosted24h: number
}
- moderationQueue: {
  pendingReports: number
  flaggedContent: number
  reviewsNeeded: number
}
- systemHealth: {
  apiResponseTime: number
  errorRate: number
  websocketConnections: number
}
- lastUpdated: ISO string

# Content Moderation Queue
PK: MODERATION#[contentType] | SK: [contentId] | GSI1PK: MODERATION#PENDING | GSI1SK: [reportedAt]
- contentId: string
- contentType: 'idea' | 'comment' | 'team' | 'profile'
- reportedBy: string (user ID)
- reportReason: string
- reportedAt: ISO string
- status: 'pending' | 'approved' | 'rejected' | 'escalated'
- moderatedBy?: string (admin user ID)
- moderatedAt?: ISO string
- moderationAction?: 'approve' | 'hide' | 'delete' | 'warn_user'
- moderationNotes?: string
- contentSnapshot: object (snapshot of content at time of report)
- severity: 'low' | 'medium' | 'high' | 'critical'

# Platform Analytics
PK: ANALYTICS#[metric] | SK: [date]#[hour]
- metric: string (e.g., 'user_activity', 'content_creation', 'engagement')
- date: string (YYYY-MM-DD)
- hour: number (0-23)
- value: number
- metadata: object (additional metric data)
- aggregatedDaily?: number (daily total)
- aggregatedWeekly?: number (weekly total)
- aggregatedMonthly?: number (monthly total)

# System Health Metrics
PK: SYSTEM#HEALTH | SK: [timestamp]
- timestamp: ISO string
- apiMetrics: {
  totalRequests: number
  averageResponseTime: number
  errorRate: number
  slowQueries: number
}
- websocketMetrics: {
  activeConnections: number
  messagesPerSecond: number
  connectionErrors: number
}
- databaseMetrics: {
  readCapacity: number
  writeCapacity: number
  throttledRequests: number
}
- notificationMetrics: {
  sentCount: number
  deliveryRate: number
  failureRate: number
}
```

## Enhancement Features

### Enhancement Feature: Intelligent Content Moderation Assistant

**Problem Solved:** Manual content moderation is time-consuming and inconsistent, while automated systems often lack context and nuance needed for fair community management.

**Enhancement Type:** AI + Smart Logic - Uses Gemini AI for content analysis combined with community reporting and behavioral patterns

**User Trigger:** Automatic analysis of all new content + manual review interface for reported content

**Input Requirements:**

- **Required Fields:** Content to analyze (text, metadata, user context)
- **Optional Fields:** Community reports, user history, content context
- **Validation Rules:** Content must be substantial enough for analysis (minimum length/complexity)

**Processing Logic:**

1. **Content Analysis:** AI analyzes content for policy violations, tone, and appropriateness
2. **Context Assessment:** Consider user history, community standards, and content context
3. **Risk Scoring:** Calculate risk score based on multiple factors
4. **Action Recommendation:** Suggest moderation actions with confidence levels

**COMPLETE IMPLEMENTATION SPECIFICATION:**

**Types Definition:**

```typescript
// types.ts - Add these exact types
export interface ContentModerationRequest {
  contentId: string;
  contentType: 'idea' | 'comment' | 'team' | 'profile';
  content: {
    text: string;
    title?: string;
    metadata?: object;
  };
  author: {
    userId: string;
    name: string;
    accountAge: number; // days
    previousViolations: number;
    communityStanding: 'good' | 'warning' | 'probation';
  };
  context?: {
    parentContent?: string;
    communityReports?: number;
    reportReasons?: string[];
  };
}

export interface ModerationAnalysis {
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  violations: Array<{
    type: string;
    severity: 'minor' | 'moderate' | 'severe';
    confidence: number;
    description: string;
  }>;
  recommendations: {
    action: 'approve' | 'warn' | 'hide' | 'delete' | 'escalate';
    reasoning: string;
    confidence: number;
    alternativeActions?: string[];
  };
  contentAnalysis: {
    tone: 'positive' | 'neutral' | 'negative' | 'hostile';
    topics: string[];
    sentiment: number; // -1 to 1
    appropriateness: number; // 0-100
  };
  flaggedElements: string[];
}

export interface ModerationDashboardData {
  queueStats: {
    pending: number;
    highPriority: number;
    escalated: number;
    avgResponseTime: number; // hours
  };
  recentActions: Array<{
    contentId: string;
    action: string;
    moderator: string;
    timestamp: string;
    reason: string;
  }>;
  contentBreakdown: {
    ideas: number;
    comments: number;
    teams: number;
    profiles: number;
  };
  trends: {
    reportVolume: Array<{ date: string; count: number }>;
    violationTypes: Array<{ type: string; count: number }>;
    moderatorActivity: Array<{ moderator: string; actions: number }>;
  };
}
```

**Frontend Component:**

```typescript
// components/admin/IntelligentModerationPanel.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Brain,
  Clock,
  TrendingUp,
  Users,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

export const IntelligentModerationPanel = () => {
  const [moderationQueue, setModerationQueue] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<ModerationDashboardData | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<ModerationAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadModerationData();
  }, []);

  const loadModerationData = async () => {
    try {
      const [queueRes, dashboardRes] = await Promise.all([
        fetch('/api/admin/moderation', {
          headers: { 'Authorization': `Bearer ${await getToken()}` }
        }),
        fetch('/api/admin/moderation/dashboard', {
          headers: { 'Authorization': `Bearer ${await getToken()}` }
        })
      ]);

      if (queueRes.ok) {
        const queueData = await queueRes.json();
        setModerationQueue(queueData.data.items);
      }

      if (dashboardRes.ok) {
        const dashData = await dashboardRes.json();
        setDashboardData(dashData.data);
      }
    } catch (error) {
      console.error('Failed to load moderation data:', error);
    }
  };

  const analyzeContent = async (item: any) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/admin/moderation/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`
        },
        body: JSON.stringify({
          contentId: item.contentId,
          contentType: item.contentType
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiAnalysis(data.data);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      toast.error('AI analysis unavailable. Proceed with manual review.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const moderateContent = async (
    contentId: string,
    action: string,
    notes?: string
  ) => {
    try {
      const response = await fetch(`/api/admin/moderation/${contentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`
        },
        body: JSON.stringify({
          action,
          notes
        })
      });

      if (response.ok) {
        toast.success(`Content ${action}d successfully`);
        setModerationQueue(prev =>
          prev.filter(item => item.contentId !== contentId)
        );
        setSelectedItem(null);
        setAiAnalysis(null);
      }
    } catch (error) {
      console.error('Moderation action failed:', error);
      toast.error('Failed to moderate content');
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'approve': return 'bg-green-600';
      case 'warn': return 'bg-yellow-600';
      case 'hide': return 'bg-orange-600';
      case 'delete': return 'bg-red-600';
      case 'escalate': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Overview */}
      {dashboardData && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">{dashboardData.queueStats.pending}</div>
                  <div className="text-xs text-muted-foreground">Pending Review</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <div>
                  <div className="text-2xl font-bold">{dashboardData.queueStats.highPriority}</div>
                  <div className="text-xs text-muted-foreground">High Priority</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{dashboardData.queueStats.escalated}</div>
                  <div className="text-xs text-muted-foreground">Escalated</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {dashboardData.queueStats.avgResponseTime.toFixed(1)}h
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Response</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Moderation Queue */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Moderation Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {moderationQueue.map((item) => (
                <div
                  key={item.contentId}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedItem?.contentId === item.contentId
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {item.contentType}
                        </Badge>
                        <Badge className={`text-xs ${getRiskColor(item.severity)}`}>
                          {item.severity}
                        </Badge>
                      </div>

                      <div className="text-sm font-medium mb-1">
                        {item.contentSnapshot.title || 'Content Review Required'}
                      </div>

                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {item.contentSnapshot.description || item.contentSnapshot.content}
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Reported: {new Date(item.reportedAt).toLocaleDateString()}</span>
                        <span>Reason: {item.reportReason}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                        analyzeContent(item);
                      }}
                    >
                      <Brain className="w-3 h-3 mr-1" />
                      Analyze
                    </Button>
                  </div>
                </div>
              ))}

              {moderationQueue.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No items in moderation queue</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content Review Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Content Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedItem ? (
              <div className="space-y-4">
                {/* Content Details */}
                <div>
                  <div className="text-sm font-medium mb-2">Content Details</div>
                  <div className="p-3 bg-muted rounded text-sm">
                    <div className="font-medium mb-1">
                      {selectedItem.contentSnapshot.title}
                    </div>
                    <div className="text-muted-foreground">
                      {selectedItem.contentSnapshot.description || selectedItem.contentSnapshot.content}
                    </div>
                  </div>
                </div>

                {/* AI Analysis */}
                {isAnalyzing ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground">Analyzing content...</div>
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium mb-2">AI Analysis</div>
                      <div className={`p-3 rounded border ${getRiskColor(aiAnalysis.riskLevel)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Risk Level: {aiAnalysis.riskLevel}</span>
                          <span className="text-sm">{aiAnalysis.riskScore}/100</span>
                        </div>
                        <Progress value={aiAnalysis.riskScore} className="h-2" />
                      </div>
                    </div>

                    {aiAnalysis.violations.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2">Potential Violations</div>
                        <div className="space-y-2">
                          {aiAnalysis.violations.map((violation, index) => (
                            <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                              <div className="font-medium text-red-800">{violation.type}</div>
                              <div className="text-red-600 text-xs">{violation.description}</div>
                              <div className="text-xs text-red-500 mt-1">
                                Confidence: {Math.round(violation.confidence * 100)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-sm font-medium mb-2">Recommendation</div>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-xs ${getActionColor(aiAnalysis.recommendations.action)} text-white`}>
                            {aiAnalysis.recommendations.action}
                          </Badge>
                          <span className="text-xs text-blue-600">
                            {Math.round(aiAnalysis.recommendations.confidence * 100)}% confidence
                          </span>
                        </div>
                        <div className="text-sm text-blue-800">
                          {aiAnalysis.recommendations.reasoning}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Button onClick={() => analyzeContent(selectedItem)}>
                      <Brain className="w-4 h-4 mr-2" />
                      Get AI Analysis
                    </Button>
                  </div>
                )}

                {/* Moderation Actions */}
                <div>
                  <div className="text-sm font-medium mb-2">Moderation Actions</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      onClick={() => moderateContent(selectedItem.contentId, 'approve')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approve
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moderateContent(selectedItem.contentId, 'warn')}
                    >
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Warn
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => moderateContent(selectedItem.contentId, 'hide')}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Hide
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => moderateContent(selectedItem.contentId, 'delete')}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Select an item to review</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
```

**Backend Service Method:**

```typescript
// services/AdminService.ts
export class AdminService {
  async getAdminDashboard(): Promise<any> {
    try {
      // Aggregate data from all modules
      const [
        userStats,
        ideaStats,
        teamStats,
        voteStats,
        notificationStats,
        moderationStats,
        systemHealth,
      ] = await Promise.all([
        this.getUserStatistics(),
        this.getIdeaStatistics(),
        this.getTeamStatistics(),
        this.getVoteStatistics(),
        this.getNotificationStatistics(),
        this.getModerationStatistics(),
        this.getSystemHealth(),
      ]);

      return {
        overview: {
          totalUsers: userStats.total,
          totalIdeas: ideaStats.total,
          totalTeams: teamStats.total,
          totalVotes: voteStats.total,
          totalNotifications: notificationStats.total,
        },
        activity: {
          activeUsers24h: userStats.active24h,
          newUsers24h: userStats.new24h,
          ideasCreated24h: ideaStats.created24h,
          teamsFormed24h: teamStats.formed24h,
          votescast24h: voteStats.cast24h,
        },
        moderation: moderationStats,
        systemHealth,
        trends: await this.calculateTrends(),
      };
    } catch (error) {
      console.error('Admin dashboard failed:', error);
      throw new Error('Failed to load admin dashboard');
    }
  }

  async analyzeModerationContent(
    contentId: string,
    contentType: string
  ): Promise<ModerationAnalysis> {
    try {
      // Get content details
      const content = await this.getContentForModeration(contentId, contentType);

      // Get author context
      const authorContext = await this.getAuthorContext(content.authorId);

      // Use AI for content analysis
      const aiAnalysis = await this.getAIModerationAnalysis(content, authorContext);

      return aiAnalysis;
    } catch (error) {
      console.error('Moderation analysis failed:', error);
      throw new Error('Failed to analyze content for moderation');
    }
  }

  private async getAIModerationAnalysis(
    content: any,
    authorContext: any
  ): Promise<ModerationAnalysis> {
    try {
      const prompt = `You are an expert content moderator for a hackathon platform. Analyze this content for policy violations and appropriateness:

Content Details:
- Type: ${content.type}
- Title: ${content.title || 'N/A'}
- Content: "${content.text}"
- Author: ${authorContext.name} (Account age: ${authorContext.accountAge} days)
- Previous violations: ${authorContext.previousViolations}
- Community standing: ${authorContext.communityStanding}

Platform Guidelines:
- No harassment, hate speech, or personal attacks
- No spam, self-promotion, or off-topic content
- No inappropriate or offensive language
- Content must be relevant to hackathons and technology
- Respect intellectual property and privacy

Analyze for:
1. Policy violations (harassment, spam, inappropriate content)
2. Tone and sentiment
3. Appropriateness for the platform
4. Risk level assessment

Return analysis in this JSON format:
{
  "riskScore": 25,
  "riskLevel": "low",
  "violations": [
    {
      "type": "Minor language concern",
      "severity": "minor",
      "confidence": 0.7,
      "description": "Contains casual language that may not be professional"
    }
  ],
  "recommendations": {
    "action": "approve",
    "reasoning": "Content is appropriate with minor language concerns",
    "confidence": 0.85,
    "alternativeActions": ["warn"]
  },
  "contentAnalysis": {
    "tone": "neutral",
    "topics": ["technology", "hackathon"],
    "sentiment": 0.1,
    "appropriateness": 85
  },
  "flaggedElements": []
}`;

      const response = await geminiClient.generateJSON<ModerationAnalysis>({
        prompt,
        maxTokens: 1500,
      });

      return response;
    } catch (error) {
      console.error('AI moderation analysis failed:', error);

      // Fallback to basic analysis
      return this.getBasicModerationAnalysis(content, authorContext);
    }
  }

  private getBasicModerationAnalysis(content: any, authorContext: any): ModerationAnalysis {
    // Basic rule-based analysis
    let riskScore = 0;
    const violations = [];
    const flaggedElements = [];

    // Check for common issues
    const text = (content.text || '').toLowerCase();

    // Spam indicators
    if (text.includes('http') || text.includes('www.')) {
      riskScore += 30;
      violations.push({
        type: 'Potential spam',
        severity: 'moderate' as const,
        confidence: 0.7,
        description: 'Contains URLs which may indicate spam',
      });
    }

    // Inappropriate language (basic check)
    const inappropriateWords = ['spam', 'scam', 'fake', 'hate'];
    const foundWords = inappropriateWords.filter((word) => text.includes(word));
    if (foundWords.length > 0) {
      riskScore += 20 * foundWords.length;
      flaggedElements.push(...foundWords);
    }

    // Author history
    if (authorContext.previousViolations > 0) {
      riskScore += authorContext.previousViolations * 15;
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (riskScore >= 80) riskLevel = 'critical';
    else if (riskScore >= 60) riskLevel = 'high';
    else if (riskScore >= 40) riskLevel = 'medium';

    // Determine action
    let action: 'approve' | 'warn' | 'hide' | 'delete' | 'escalate' = 'approve';
    if (riskLevel === 'critical') action = 'delete';
    else if (riskLevel === 'high') action = 'hide';
    else if (riskLevel === 'medium') action = 'warn';

    return {
      riskScore: Math.min(100, riskScore),
      riskLevel,
      violations,
      recommendations: {
        action,
        reasoning: `Basic analysis suggests ${action} based on risk score of ${riskScore}`,
        confidence: 0.6,
        alternativeActions: ['escalate'],
      },
      contentAnalysis: {
        tone: 'neutral',
        topics: ['general'],
        sentiment: 0,
        appropriateness: Math.max(0, 100 - riskScore),
      },
      flaggedElements,
    };
  }

  async moderateContent(
    contentId: string,
    action: string,
    moderatorId: string,
    notes?: string
  ): Promise<void> {
    try {
      // Update moderation record
      await dynamodb.update(
        {
          PK: `MODERATION#${contentId}`,
          SK: 'DETAILS',
        },
        {
          status: action === 'approve' ? 'approved' : 'rejected',
          moderatedBy: moderatorId,
          moderatedAt: new Date().toISOString(),
          moderationAction: action,
          moderationNotes: notes,
        }
      );

      // Apply action to content
      await this.applyModerationAction(contentId, action);

      // Log moderation action
      await this.logModerationAction(contentId, action, moderatorId, notes);
    } catch (error) {
      console.error('Content moderation failed:', error);
      throw new Error('Failed to moderate content');
    }
  }

  private async applyModerationAction(contentId: string, action: string): Promise<void> {
    switch (action) {
      case 'hide':
        // Hide content from public view
        await this.hideContent(contentId);
        break;
      case 'delete':
        // Mark content as deleted
        await this.deleteContent(contentId);
        break;
      case 'warn':
        // Send warning to user
        await this.sendUserWarning(contentId);
        break;
      // 'approve' requires no action
    }
  }

  async getAnalytics(timeframe: string = '7d'): Promise<any> {
    try {
      const endDate = new Date();
      const startDate = new Date();

      // Calculate date range
      switch (timeframe) {
        case '24h':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
      }

      // Get analytics data
      const analytics = await this.getAnalyticsData(startDate, endDate);

      return {
        timeframe,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ...analytics,
      };
    } catch (error) {
      console.error('Analytics failed:', error);
      throw new Error('Failed to retrieve analytics');
    }
  }
}

export const adminService = new AdminService();
```

## Implementation Guide

### Step 0: Study Phase (MANDATORY - Do This First)

**CRITICAL:** Read `guidelines/project-architecture.md` and review all previous module implementations.

### Step 1: Backend Implementation (New Module)

**File Structure:**

```
backend/src/modules/admin/ (new module)
├── handlers/
│   ├── getAdminDashboard.ts
│   ├── getContentModeration.ts
│   ├── moderateContent.ts
│   ├── getAnalytics.ts
│   ├── exportData.ts
│   ├── getSystemHealth.ts
│   └── analyzeModerationContent.ts
├── functions/
│   ├── getAdminDashboard.yml
│   ├── getContentModeration.yml
│   ├── moderateContent.yml
│   ├── getAnalytics.yml
│   ├── exportData.yml
│   ├── getSystemHealth.yml
│   └── analyzeModerationContent.yml
├── services/
│   └── AdminService.ts
└── types.ts
```

### Step 2: Frontend Implementation (Comprehensive Admin Interface)

**File Structure:**

```
client/src/
├── components/admin/ (extend existing)
│   ├── IntelligentModerationPanel.tsx
│   ├── AnalyticsDashboard.tsx
│   ├── SystemHealthMonitor.tsx
│   ├── DataExportPanel.tsx
│   └── Update existing AdminDashboard.tsx
├── pages/admin/ (extend existing)
│   ├── ModerationPage.tsx
│   ├── AnalyticsPage.tsx
│   └── SystemPage.tsx
├── hooks/
│   ├── useAdminDashboard.ts
│   ├── useModeration.ts
│   └── useAnalytics.ts
└── services/
    └── adminApi.ts
```

### Step 3: Integration with All Modules

- [ ] **Cross-Module Analytics:** Aggregate data from F01, F03, F04, M05, M08, M09
- [ ] **Content Moderation:** Integrate with all content-creating modules
- [ ] **User Management:** Extend existing user management with role controls
- [ ] **System Monitoring:** Monitor health across all module APIs
- [ ] **AI Integration:** Implement Gemini AI for intelligent moderation

## Acceptance Criteria

- [ ] Admin dashboard provides comprehensive overview of all platform activities
- [ ] Intelligent moderation system analyzes content and suggests appropriate actions
- [ ] Analytics dashboard shows detailed insights across all modules with time-based filtering
- [ ] Content moderation queue efficiently handles reported content with AI assistance
- [ ] System health monitoring tracks performance across all APIs and services
- [ ] Data export functionality allows comprehensive platform data extraction
- [ ] **Demo Ready:** Can moderate content and view analytics across all features
- [ ] **Role-Based Access:** Only organizers and admins can access administrative features
- [ ] **Mobile Responsive:** Admin interface works on tablets and larger mobile devices

## Testing Checklist

- [ ] **Manual API Testing:**
  - Admin dashboard aggregates data from all modules correctly
  - Content moderation actions apply properly across all content types
  - Analytics calculations are accurate and performant
  - AI moderation analysis provides relevant insights
  - System health metrics reflect actual system status

- [ ] **Frontend Testing:**
  - Admin dashboard displays comprehensive platform overview
  - Moderation interface allows efficient content review and action
  - Analytics charts and data visualizations work correctly
  - All admin features integrate seamlessly
  - Real-time updates work for system monitoring

- [ ] **Cross-Module Integration:** Admin features work correctly with all existing modules
- [ ] **AI Performance:** Gemini AI moderation analysis completes within 10 seconds
- [ ] **Data Accuracy:** All analytics and statistics reflect actual platform data

## Deployment Checklist

- [ ] **CRITICAL - Type Check:** Run `bun run typecheck` in both backend and client
- [ ] **Serverless Config:** Add admin function imports to serverless.yml
- [ ] **Environment Variables:** Ensure GEMINI_API_KEY is configured for AI moderation
- [ ] **Role Configuration:** Verify organizer and admin roles are properly configured
- [ ] **Manual Testing:** Test complete admin workflow across all features
- [ ] **Cross-Module Integration:** Verify admin features work with all existing modules
- [ ] **Performance Testing:** Ensure admin dashboard loads quickly with large datasets
