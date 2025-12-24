/**
 * EventCard Component
 * Displays individual event information in a card format
 */

import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { Event } from '../../types/event';
import {
  formatEventDateRange,
  formatEventPrice,
  getEventStatusColor,
} from '../../services/eventsApi';

interface EventCardProps {
  event: Event;
  onViewDetails?: (eventId: string) => void;
  onEdit?: (eventId: string) => void;
  showActions?: boolean;
  isOwner?: boolean;
}

export function EventCard({
  event,
  onViewDetails,
  onEdit,
  showActions = true,
  isOwner = false,
}: EventCardProps) {
  const handleViewDetails = () => {
    onViewDetails?.(event.eventId);
  };

  const handleEdit = () => {
    onEdit?.(event.eventId);
  };

  const statusColor = getEventStatusColor(event.status);
  const isFullyBooked = event.currentAttendees >= event.maxAttendees;

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-2 flex-1">{event.title}</CardTitle>
          <Badge
            variant={statusColor === 'green' ? 'default' : 'secondary'}
            className={`ml-2 ${
              statusColor === 'green'
                ? 'bg-green-100 text-green-800'
                : statusColor === 'red'
                  ? 'bg-red-100 text-red-800'
                  : statusColor === 'blue'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
            }`}
          >
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </Badge>
        </div>
        <Badge variant="outline" className="w-fit">
          {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <p className="text-sm text-gray-600 line-clamp-3">{event.description}</p>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{formatEventDateRange(event.startDate, event.endDate)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">
              {event.location.address}, {event.location.city}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              <span>
                {event.currentAttendees}/{event.maxAttendees}
                {isFullyBooked && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Full
                  </Badge>
                )}
              </span>
            </div>

            <div className="flex items-center font-semibold">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>{formatEventPrice(event.price, event.currency)}</span>
            </div>
          </div>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="pt-3 gap-2">
          <Button variant="outline" size="sm" onClick={handleViewDetails} className="flex-1">
            View Details
          </Button>
          {isOwner && (
            <Button variant="default" size="sm" onClick={handleEdit} className="flex-1">
              Edit
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
