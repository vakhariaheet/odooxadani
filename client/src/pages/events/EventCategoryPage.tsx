/**
 * EventCategoryPage Component
 * Category-specific events listing
 */

import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Tag } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { EventCard } from '../../components/events/EventCard';
import { Skeleton } from '../../components/ui/skeleton';
import { useEventsByCategory } from '../../hooks/useEvents';
import type { EventCategory } from '../../types/event';
import { EVENT_CATEGORIES } from '../../types/event';

export function EventCategoryPage() {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();

  const categoryInfo = EVENT_CATEGORIES.find((c) => c.value === category);
  const { data, isLoading, error } = useEventsByCategory(category as EventCategory, 50);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleViewEvent = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  if (!categoryInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-4">The requested category does not exist.</p>
          <Button onClick={handleBack}>Back to Events</Button>
        </div>
      </div>
    );
  }

  const events = data?.data?.events || [];
  const totalCount = data?.data?.totalCount || 0;

  const getCategoryIcon = (categoryValue: EventCategory) => {
    const icons: Record<EventCategory, string> = {
      music: '🎵',
      sports: '⚽',
      business: '💼',
      technology: '💻',
      arts: '🎨',
      food: '🍽️',
      education: '📚',
      health: '🏥',
      other: '📅',
    };
    return icons[categoryValue] || '📅';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button onClick={handleBack} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Category Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <span className="text-4xl">{getCategoryIcon(category as EventCategory)}</span>
          <div>
            <h1 className="text-3xl font-bold">{categoryInfo.label} Events</h1>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="secondary" className="capitalize">
                <Tag className="h-3 w-3 mr-1" />
                {category}
              </Badge>
              <span className="text-gray-600">
                {isLoading ? 'Loading...' : `${totalCount} events`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Failed to load events</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <EventCard
                key={event.eventId}
                event={event}
                onViewDetails={handleViewEvent}
                showActions={true}
                isOwner={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">
              {getCategoryIcon(category as EventCategory)}
            </span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {categoryInfo.label.toLowerCase()} events yet
            </h3>
            <p className="text-gray-600 mb-4">Be the first to create an event in this category!</p>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
              <Button onClick={() => navigate('/dashboard/events/create')}>Create Event</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
