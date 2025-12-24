/**
 * RecommendedEventsPage Component
 * Full page for personalized event recommendations
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { EventCard } from '../../components/events/EventCard';
import { Skeleton } from '../../components/ui/skeleton';
import { useRecommendedEvents } from '../../hooks/useEvents';

export function RecommendedEventsPage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useRecommendedEvents(20);

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
          <Sparkles className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold">Recommended for You</h1>
        </div>
        <p className="text-gray-600">
          Personalized event recommendations based on your interests and activity.
        </p>
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
            <p className="text-red-600 mb-4">Failed to load recommendations</p>
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
            <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
            <p className="text-gray-600 mb-4">
              Create or attend some events to get personalized recommendations!
            </p>
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
