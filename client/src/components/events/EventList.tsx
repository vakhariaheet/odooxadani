/**
 * EventList Component
 *
 * List view with filtering and pagination for events
 */

import React, { useState, useMemo } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Search, Filter, SortAsc, SortDesc, Plus, Loader2 } from 'lucide-react';
import { EventCard } from './EventCard';
import { useEvents, useRegisterForEvent } from '../../hooks/useEvents';
import { useDebounce } from '../../hooks/useDebounce';
import type { EventFilters } from '../../types/event';
import { HACKATHON_CATEGORIES, EVENT_STATUS_LABELS } from '../../types/event';

interface EventListProps {
  showCreateButton?: boolean;
  onCreateEvent?: () => void;
  onEditEvent?: (eventId: string) => void;
  onDeleteEvent?: (eventId: string) => void;
  currentUserId?: string;
  organizerId?: string; // Filter by specific organizer
  title?: string;
  description?: string;
}

export const EventList: React.FC<EventListProps> = ({
  showCreateButton = false,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  currentUserId,
  organizerId,
  title = 'Events',
  description = 'Discover and join hackathon events',
}) => {
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    sortBy: 'startDate',
    sortOrder: 'asc',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(filters.search, 300);

  // Build query for API
  const query = useMemo(
    () => ({
      search: debouncedSearch,
      status: filters.status,
      category: filters.category,
      location: filters.location,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      organizerId,
      limit: 20,
    }),
    [debouncedSearch, filters, organizerId]
  );

  const { data, isLoading, error, refetch } = useEvents(query);
  const registerMutation = useRegisterForEvent();

  const handleFilterChange = (key: keyof EventFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegister = (eventId: string) => {
    // For now, register with empty skills - this would be enhanced with a modal
    registerMutation.mutate({
      id: eventId,
      data: { skills: [] },
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      sortBy: 'startDate',
      sortOrder: 'asc',
    });
  };

  const hasActiveFilters = filters.status || filters.category || filters.location || filters.search;

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-destructive mb-4">
              {error instanceof Error ? error.message : 'Failed to load events'}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        {showCreateButton && onCreateEvent && (
          <Button onClick={onCreateEvent}>
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search events..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startDate">Start Date</SelectItem>
                  <SelectItem value="createdAt">Created</SelectItem>
                  <SelectItem value="trendScore">Trending</SelectItem>
                  <SelectItem value="currentParticipants">Participants</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')
                }
              >
                {filters.sortOrder === 'asc' ? (
                  <SortAsc className="w-4 h-4" />
                ) : (
                  <SortDesc className="w-4 h-4" />
                )}
              </Button>

              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="pt-4 border-t">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    {Object.entries(EVENT_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

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
                    {HACKATHON_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Location..."
                  value={filters.location || ''}
                  onChange={(e) => handleFilterChange('location', e.target.value || undefined)}
                />
              </div>

              {hasActiveFilters && (
                <div className="flex items-center justify-between mt-4">
                  <div className="flex flex-wrap gap-2">
                    {filters.status && (
                      <Badge variant="secondary">
                        Status: {EVENT_STATUS_LABELS[filters.status]}
                      </Badge>
                    )}
                    {filters.category && (
                      <Badge variant="secondary">Category: {filters.category}</Badge>
                    )}
                    {filters.location && (
                      <Badge variant="secondary">Location: {filters.location}</Badge>
                    )}
                    {filters.search && (
                      <Badge variant="secondary">Search: "{filters.search}"</Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : !data?.events || data.events.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters ? 'No events match your filters' : 'No events found'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Results Summary */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing {data?.events.length || 0} of {data?.total || 0} events
            </p>
          </div>

          {/* Event Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.events?.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onRegister={handleRegister}
                onEdit={onEditEvent}
                onDelete={onDeleteEvent}
                isOwner={currentUserId === event.organizerId}
              />
            ))}
          </div>

          {/* Load More */}
          {data?.hasMore && (
            <div className="text-center">
              <Button variant="outline">Load More Events</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
