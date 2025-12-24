/**
 * EventList Component
 * Displays a grid/list of events with filtering and pagination
 */

import { useState } from 'react';
import { Search, Grid, List } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { EventCard } from './EventCard';
import { useEvents, usePublishedEvents } from '../../hooks/useEvents';
import type { EventListQuery } from '../../types/event';
import { EVENT_CATEGORIES } from '../../types/event';

interface EventListProps {
  title?: string;
  showFilters?: boolean;
  showCreateButton?: boolean;
  onCreateEvent?: () => void;
  onViewEvent?: (eventId: string) => void;
  onEditEvent?: (eventId: string) => void;
  initialFilters?: Partial<EventListQuery>;
  isOwnerView?: boolean;
  isPublicView?: boolean;
}

export function EventList({
  title = 'Events',
  showFilters = true,
  showCreateButton = false,
  onCreateEvent,
  onViewEvent,
  onEditEvent,
  initialFilters = {},
  isOwnerView = false,
  isPublicView = false,
}: EventListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<EventListQuery>({
    limit: 20,
    offset: 0,
    ...initialFilters,
  });

  const { data, isLoading, error, refetch } = isPublicView
    ? usePublishedEvents(filters)
    : useEvents(filters);

  const handleFilterChange = (key: keyof EventListQuery, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      offset: 0, // Reset pagination when filters change
    }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Note: Backend doesn't support text search yet, this is for future enhancement
  };

  const handleLoadMore = () => {
    if (data?.data.hasMore) {
      setFilters((prev) => ({
        ...prev,
        offset: (prev.offset || 0) + (prev.limit || 20),
      }));
    }
  };

  const events = data?.data.events || [];
  const hasMore = data?.data.hasMore || false;

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600 mb-4">Failed to load events</p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {showCreateButton && <Button onClick={onCreateEvent}>Create Event</Button>}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select
                value={filters.category || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('category', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {EVENT_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* City Filter */}
              <Input
                placeholder="City"
                value={filters.city || ''}
                onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
              />

              {/* Status Filter (for owner view) */}
              {isOwnerView && (
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('status', value === 'all' ? undefined : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events Grid/List */}
      {isLoading ? (
        <div
          className={`grid gap-6 ${
            viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          }`}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-16 w-full mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 mb-4">No events found</p>
            {showCreateButton && <Button onClick={onCreateEvent}>Create Your First Event</Button>}
          </CardContent>
        </Card>
      ) : (
        <>
          <div
            className={`grid gap-6 ${
              viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
            }`}
          >
            {events.map((event) => (
              <EventCard
                key={event.eventId}
                event={event}
                onViewDetails={onViewEvent}
                onEdit={onEditEvent}
                isOwner={isOwnerView}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center">
              <Button onClick={handleLoadMore} variant="outline" disabled={isLoading}>
                Load More Events
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
