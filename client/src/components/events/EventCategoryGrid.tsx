/**
 * EventCategoryGrid Component
 * Category-based browsing with visual grid
 */

import { useState } from 'react';
import { ChevronRight, Calendar, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { useEventsByCategory } from '../../hooks/useEvents';
import { formatEventPrice } from '../../services/eventsApi';
import type { EventCategory } from '../../types/event';
import { EVENT_CATEGORIES } from '../../types/event';

interface EventCategoryGridProps {
  onViewCategory?: (category: EventCategory) => void;
  onViewEvent?: (eventId: string) => void;
  showEventPreviews?: boolean;
  maxEventsPerCategory?: number;
}

export function EventCategoryGrid({
  onViewCategory,
  onViewEvent,
  showEventPreviews = true,
  maxEventsPerCategory = 3,
}: EventCategoryGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);

  const handleCategoryClick = (category: EventCategory) => {
    setSelectedCategory(category);
    onViewCategory?.(category);
  };

  return (
    <div className="space-y-6">
      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EVENT_CATEGORIES.map((category) => (
          <CategoryCard
            key={category.value}
            category={category}
            isSelected={selectedCategory === category.value}
            onClick={() => handleCategoryClick(category.value)}
            onViewEvent={onViewEvent}
            showEventPreviews={showEventPreviews}
            maxEvents={maxEventsPerCategory}
          />
        ))}
      </div>
    </div>
  );
}

interface CategoryCardProps {
  category: { value: EventCategory; label: string };
  isSelected: boolean;
  onClick: () => void;
  onViewEvent?: (eventId: string) => void;
  showEventPreviews: boolean;
  maxEvents: number;
}

function CategoryCard({
  category,
  isSelected,
  onClick,
  onViewEvent,
  showEventPreviews,
  maxEvents,
}: CategoryCardProps) {
  const { data, isLoading, error } = useEventsByCategory(
    category.value,
    maxEvents,
    showEventPreviews
  );

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

  const events = data?.data?.events || [];
  const eventCount = data?.data?.totalCount || 0;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getCategoryIcon(category.value)}</span>
            <div>
              <CardTitle className="text-lg">{category.label}</CardTitle>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-3 w-3" />
                <span>{eventCount} events</span>
              </div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
      </CardHeader>

      {showEventPreviews && (
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-sm text-gray-500 text-center py-4">Failed to load events</div>
          ) : events.length > 0 ? (
            <div className="space-y-2">
              {events.slice(0, 2).map((event) => (
                <div
                  key={event.eventId}
                  className="p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewEvent?.(event.eventId);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{event.title}</h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <span>📍 {event.location.city}</span>
                        <span>•</span>
                        <span>{formatEventPrice(event.price, event.currency || 'USD')}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Users className="h-3 w-3" />
                      <span>
                        {event.currentAttendees}/{event.maxAttendees}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {eventCount > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                  }}
                >
                  View all {eventCount} events
                </Button>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-4">No events in this category</div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
