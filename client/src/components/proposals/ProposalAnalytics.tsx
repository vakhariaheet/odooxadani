import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { useQuery } from '@tanstack/react-query';
import { proposalsApi } from '../../services/proposalsApi';
import { Clock, Eye, MessageCircle, TrendingUp } from 'lucide-react';

interface ProposalAnalyticsProps {
  proposalId: string;
}

interface ViewEvent {
  timestamp: string;
  section?: string;
  timeSpent: number;
}

interface AnalyticsData {
  totalViews: number;
  uniqueViews: number;
  timeSpentViewing: number;
  engagementScore: number;
  responseTime?: number;
  viewsBySection: Record<string, number>;
  viewTimeline: ViewEvent[];
}

export const ProposalAnalytics: React.FC<ProposalAnalyticsProps> = ({ proposalId }) => {
  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery<AnalyticsData>({
    queryKey: ['proposal-analytics', proposalId],
    queryFn: () => proposalsApi.getAnalytics(proposalId),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-red-600">Failed to load analytics</p>
        </CardContent>
      </Card>
    );
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalViews || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.uniqueViews || 0} unique viewers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.engagementScore || 0}%</div>
            <Progress value={analytics?.engagementScore || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(analytics?.timeSpentViewing || 0)}</div>
            <p className="text-xs text-muted-foreground">Total viewing time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.responseTime ? `${analytics.responseTime}h` : 'Pending'}
            </div>
            <p className="text-xs text-muted-foreground">Time to response</p>
          </CardContent>
        </Card>
      </div>

      {/* Section Views */}
      {analytics?.viewsBySection && Object.keys(analytics.viewsBySection).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Section Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.viewsBySection).map(([section, views]) => {
                const viewCount = Number(views);
                const maxViews = Math.max(...Object.values(analytics.viewsBySection).map(Number));
                const percentage = Math.min(100, (viewCount / maxViews) * 100);

                return (
                  <div key={section} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{section}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground">{viewCount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Views Timeline */}
      {analytics?.viewTimeline && analytics.viewTimeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.viewTimeline.slice(0, 5).map((view, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{view.section ? `Viewed ${view.section}` : 'Viewed proposal'}</span>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <span>{formatTime(view.timeSpent)}</span>
                    <span>•</span>
                    <span>{new Date(view.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
