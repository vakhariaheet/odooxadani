/**
 * PopularEvents Component
 * Trending events carousel/grid
 */

import { useState } from 'react';
import { TrendingUp, ArrowRight, Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { EventCard } from './EventCard';
import { usePopularEvents } from '../../hooks/useEvents';

interface PopularEventsProps {
  onViewEvent?: (eventId: string) => void;
  onViewAll?: () => void;
  limit?: number;
  showHeader?: boolean;
  showTimeframeTabs?: boolean;
}

export function PopularEvents({
  onViewEvent,
  onViewAll,
  limit = 8,
  showHeader = true,
  showTimeframeTabs = true,
}: PopularEventsProps) {
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');

  const { data, isLoading, error } = usePopularEvents(timeframe, limit);

  const events = data?.data?.events || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {showHeader && (
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-24" />
          </div>
        )}
        {showTimeframeTabs && <Skeleton className="h-10 w-48" />}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-gray-500 mb-2">Failed to load popular events</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">No popular events</h3>
            <p className="text-gray-500 text-sm mb-4">Check back later for trending events!</p>
            <Button variant="outline" size="sm" onClick={onViewAll}>
              Browse all events
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const content = (
    <div className="space-y-4">
      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {events.map((event, index) => (
          <div key={event.eventId} className="relative">
            {/* Trending Badge for top 3 */}
            {index < 3 && (
              <Badge
                variant="secondary"
                className="absolute top-2 left-2 z-10 bg-orange-100 text-orange-800"
              >
                #{index + 1} Trending
              </Badge>
            )}
            <EventCard
              event={event}
              onViewDetails={onViewEvent}
              showActions={true}
              isOwner={false}
            />
          </div>
        ))}
      </div>

      {/* View All Button */}
      {onViewAll && events.length > 0 && (
        <div className="text-center">
          <Button variant="outline" onClick={onViewAll}>
            View all popular events
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-semibold">Popular Events</h2>
            <Badge variant="secondary" className="ml-2">
              <Clock className="h-3 w-3 mr-1" />
              This {timeframe}
            </Badge>
          </div>
          {onViewAll && !showTimeframeTabs && (
            <Button variant="ghost" onClick={onViewAll} className="text-orange-600">
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      )}

      {/* Timeframe Tabs */}
      {showTimeframeTabs ? (
        <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as 'week' | 'month')}>
          <TabsList>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
          <TabsContent value="week" className="mt-4">
            {content}
          </TabsContent>
          <TabsContent value="month" className="mt-4">
            {content}
          </TabsContent>
        </Tabs>
      ) : (
        content
      )}
    </div>
  );
}
