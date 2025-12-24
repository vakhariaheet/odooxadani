/**
 * EventSearchPage Component
 * Advanced search results page
 */

import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { EventSearchBar } from '../../components/events/EventSearchBar';
import { EventCard } from '../../components/events/EventCard';
import { Skeleton } from '../../components/ui/skeleton';
import { useEventSearch } from '../../hooks/useEvents';
import type { EventSearchQuery, EventCategory } from '../../types/event';

export function EventSearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse search parameters
  const searchQuery: EventSearchQuery = {
    query: searchParams.get('q') || undefined,
    category: (searchParams.get('category') as EventCategory) || undefined,
    city: searchParams.get('city') || undefined,
    sortBy: (searchParams.get('sortBy') as any) || 'relevance',
    sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
  };

  const { data, isLoading, error } = useEventSearch(searchQuery);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleViewEvent = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const handleSearch = (query: EventSearchQuery) => {
    const params = new URLSearchParams();
    if (query.query) params.set('q', query.query);
    if (query.category) params.set('category', query.category);
    if (query.city) params.set('city', query.city);
    if (query.sortBy) params.set('sortBy', query.sortBy);
    if (query.sortOrder) params.set('sortOrder', query.sortOrder);

    setSearchParams(params);
  };

  const events = data?.data?.events || [];
  const totalCount = data?.data?.totalCount || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button onClick={handleBack} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Search Events</h1>
        <EventSearchBar
          onSearch={handleSearch}
          initialQuery={searchQuery}
          placeholder="Search events by name, location, or category..."
          showFilters={true}
        />
      </div>

      {/* Results */}
      <div className="space-y-6">
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {isLoading ? 'Searching...' : `${totalCount} events found`}
          </h2>
          {/* TODO: Add sorting controls */}
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Failed to search events</p>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or browse all events.
            </p>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
