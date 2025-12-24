/**
 * PopularEventsPage Component
 * Full page for popular/trending events
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Clock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { EventCard } from '../../components/events/EventCard';
import { Skeleton } from '../../components/ui/skeleton';
import { usePopularEvents } from '../../hooks/useEvents';

export function PopularEventsPage() {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');

  const { data, isLoading, error } = usePopularEvents(timeframe, 50);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleViewEvent = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const events = data?.data?.events || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button onClick={handleBack} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="h-8 w-8 text-orange-500" />
          <h1 className="text-3xl font-bold">Popular Events</h1>
          <Badge variant="secondary" className="ml-2">
            <Clock className="h-3 w-3 mr-1" />
            This {timeframe}
          </Badge>
        </div>
        <p className="text-gray-600">Discover the most popular and trending events in your area.</p>
      </div>

      {/* Timeframe Tabs */}
      <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as 'week' | 'month')}>
        <TabsList className="mb-6">
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
        </TabsList>

        <TabsContent value="week">
          <EventsGrid
            events={events}
            isLoading={isLoading}
            error={error}
            onViewEvent={handleViewEvent}
            timeframe="week"
          />
        </TabsContent>

        <TabsContent value="month">
          <EventsGrid
            events={events}
            isLoading={isLoading}
            error={error}
            onViewEvent={handleViewEvent}
            timeframe="month"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface EventsGridProps {
  events: any[];
  isLoading: boolean;
  error: any;
  onViewEvent: (eventId: string) => void;
  timeframe: 'week' | 'month';
}

function EventsGrid({ events, isLoading, error, onViewEvent, timeframe }: EventsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Failed to load popular events</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No popular events this {timeframe}
        </h3>
        <p className="text-gray-600 mb-4">Check back later for trending events!</p>
        <Button variant="outline" onClick={() => (window.location.href = '/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <EventCard event={event} onViewDetails={onViewEvent} showActions={true} isOwner={false} />
        </div>
      ))}
    </div>
  );
}
