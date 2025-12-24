/**
 * RecommendedEvents Component
 * Personalized recommendations section
 */

import { ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { EventCard } from './EventCard';
import { useRecommendedEvents } from '../../hooks/useEvents';

interface RecommendedEventsProps {
  onViewEvent?: (eventId: string) => void;
  onViewAll?: () => void;
  limit?: number;
  showHeader?: boolean;
}

export function RecommendedEvents({
  onViewEvent,
  onViewAll,
  limit = 6,
  showHeader = true,
}: RecommendedEventsProps) {
  const { data, isLoading, error } = useRecommendedEvents(limit);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <p className="text-gray-500 mb-2">Failed to load recommendations</p>
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
            <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">No recommendations yet</h3>
            <p className="text-gray-500 text-sm mb-4">
              Create or attend some events to get personalized recommendations!
            </p>
            <Button variant="outline" size="sm" onClick={onViewAll}>
              Browse all events
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-semibold">Recommended for You</h2>
          </div>
          {onViewAll && (
            <Button variant="ghost" onClick={onViewAll} className="text-blue-600">
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <EventCard
            key={event.eventId}
            event={event}
            onViewDetails={onViewEvent}
            showActions={true}
            isOwner={false}
          />
        ))}
      </div>

      {/* View All Button (if not in header) */}
      {!showHeader && onViewAll && events.length > 0 && (
        <div className="text-center">
          <Button variant="outline" onClick={onViewAll}>
            View all recommendations
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
