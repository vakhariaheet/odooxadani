/**
 * EventsPage Component
 * Enhanced public events listing page with discovery features
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { EventSearchBar } from '../../components/events/EventSearchBar';
import { EventCategoryGrid } from '../../components/events/EventCategoryGrid';
import { RecommendedEvents } from '../../components/events/RecommendedEvents';
import { PopularEvents } from '../../components/events/PopularEvents';
import { EventList } from '../../components/events/EventList';
import { useEventSearch } from '../../hooks/useEvents';
import type { EventSearchQuery, EventCategory } from '../../types/event';

export function EventsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get initial search query from URL
  const initialQuery: EventSearchQuery = {
    query: searchParams.get('q') || undefined,
    category: (searchParams.get('category') as EventCategory) || undefined,
    city: searchParams.get('city') || undefined,
  };

  const [searchQuery, setSearchQuery] = useState<EventSearchQuery>(initialQuery);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'discover');

  // Search results
  const { data: searchResults, isLoading: isSearching } = useEventSearch(
    searchQuery,
    !!(searchQuery.query || searchQuery.category || searchQuery.city)
  );

  const handleViewEvent = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const handleSearch = (query: EventSearchQuery) => {
    setSearchQuery(query);

    // Update URL params
    const params = new URLSearchParams();
    if (query.query) params.set('q', query.query);
    if (query.category) params.set('category', query.category);
    if (query.city) params.set('city', query.city);
    params.set('tab', 'search');

    setSearchParams(params);
    setActiveTab('search');
  };

  const handleViewCategory = (category: EventCategory) => {
    navigate(`/events/category/${category}`);
  };

  const handleViewRecommended = () => {
    navigate('/events/recommended');
  };

  const handleViewPopular = () => {
    navigate('/events/popular');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    setSearchParams(params);
  };

  const hasSearchQuery = !!(searchQuery.query || searchQuery.category || searchQuery.city);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Discover Events</h1>
        <EventSearchBar
          onSearch={handleSearch}
          initialQuery={initialQuery}
          placeholder="Search events by name, location, or category..."
          showFilters={true}
        />
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="search" disabled={!hasSearchQuery}>
            Search Results
          </TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="all">All Events</TabsTrigger>
        </TabsList>

        {/* Discover Tab */}
        <TabsContent value="discover" className="space-y-8">
          {/* Popular Events */}
          <PopularEvents
            onViewEvent={handleViewEvent}
            onViewAll={handleViewPopular}
            limit={8}
            showHeader={true}
            showTimeframeTabs={true}
          />

          {/* Recommended Events (for authenticated users) */}
          <RecommendedEvents
            onViewEvent={handleViewEvent}
            onViewAll={handleViewRecommended}
            limit={6}
            showHeader={true}
          />

          {/* Category Preview */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Browse by Category</h2>
            <EventCategoryGrid
              onViewCategory={handleViewCategory}
              onViewEvent={handleViewEvent}
              showEventPreviews={true}
              maxEventsPerCategory={2}
            />
          </div>
        </TabsContent>

        {/* Search Results Tab */}
        <TabsContent value="search">
          {hasSearchQuery ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Search Results</h2>
                {searchResults?.data && (
                  <span className="text-gray-600">
                    {searchResults.data.totalCount} events found
                  </span>
                )}
              </div>

              {isSearching ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Searching events...</p>
                </div>
              ) : searchResults?.data?.events ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.data.events.map((event: any) => (
                    <div
                      key={event.eventId}
                      className="cursor-pointer"
                      onClick={() => handleViewEvent(event.eventId)}
                    >
                      {/* Use EventCard component here */}
                      <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-gray-600 text-sm">{event.location.city}</p>
                        <p className="text-blue-600 font-medium">
                          ${event.price === 0 ? 'Free' : event.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No events found matching your search.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Enter a search query to see results.</p>
            </div>
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">All Categories</h2>
            <EventCategoryGrid
              onViewCategory={handleViewCategory}
              onViewEvent={handleViewEvent}
              showEventPreviews={true}
              maxEventsPerCategory={3}
            />
          </div>
        </TabsContent>

        {/* All Events Tab */}
        <TabsContent value="all">
          <EventList
            title="All Events"
            showFilters={true}
            showCreateButton={false}
            onViewEvent={handleViewEvent}
            initialFilters={{ status: 'published' }}
            isPublicView={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
