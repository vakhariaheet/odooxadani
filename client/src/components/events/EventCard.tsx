/**
 * EventCard Component
 *
 * Individual event display card with registration and management actions
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar, MapPin, Users, TrendingUp, Clock, Edit, Trash2 } from 'lucide-react';
import type { Event } from '../../types/event';
import { EVENT_STATUS_LABELS } from '../../types/event';
import { formatDistanceToNow, format } from 'date-fns';

interface EventCardProps {
  event: Event;
  onRegister?: (eventId: string) => void;
  onEdit?: (eventId: string) => void;
  onDelete?: (eventId: string) => void;
  showActions?: boolean;
  isOwner?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onRegister,
  onEdit,
  onDelete,
  showActions = true,
  isOwner = false,
}) => {
  const isRegistrationOpen = new Date() < new Date(event.registrationDeadline);
  const isFull = event.currentParticipants >= event.maxParticipants;
  const isUpcoming = new Date() < new Date(event.startDate);
  const isOngoing =
    new Date() >= new Date(event.startDate) && new Date() <= new Date(event.endDate);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'ongoing':
        return 'secondary';
      case 'completed':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const canRegister =
    showActions &&
    !isOwner &&
    event.status === 'published' &&
    isRegistrationOpen &&
    !isFull &&
    onRegister;

  const canEdit = isOwner && onEdit && event.status !== 'cancelled';
  const canDelete = isOwner && onDelete && event.status !== 'cancelled';

  return (
    <Card
      className={`hover:shadow-lg transition-shadow duration-200 h-full flex flex-col ${
        event.status === 'cancelled' ? 'opacity-75 border-destructive/50 bg-destructive/5' : ''
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle
            className={`text-lg font-semibold line-clamp-2 flex-1 ${
              event.status === 'cancelled' ? 'line-through text-muted-foreground' : ''
            }`}
          >
            {event.name}
          </CardTitle>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="font-medium">{event.trendScore}/10</span>
            </div>
            <Badge variant={getStatusBadgeVariant(event.status)}>
              {EVENT_STATUS_LABELS[event.status]}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(event.startDate), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span className="truncate max-w-[120px]">{event.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>
              {event.currentParticipants}/{event.maxParticipants}
            </span>
          </div>
          {isUpcoming && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">
                Starts {formatDistanceToNow(new Date(event.startDate), { addSuffix: true })}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
          {event.description}
        </p>

        {/* Categories */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {event.categories.slice(0, 3).map((category) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {category}
              </Badge>
            ))}
            {event.categories.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{event.categories.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* AI Tags */}
        {event.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {event.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {event.tags.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{event.tags.length - 4}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Registration Status */}
        {event.status === 'cancelled' ? (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <div className="text-sm font-medium text-destructive">
              ⚠️ This event has been cancelled
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Contact the organizer for more information
            </div>
          </div>
        ) : (
          event.status === 'published' && (
            <div className="mb-4">
              {!isRegistrationOpen ? (
                <div className="text-sm text-muted-foreground">
                  Registration closed on{' '}
                  {format(new Date(event.registrationDeadline), 'MMM dd, yyyy')}
                </div>
              ) : isFull ? (
                <div className="text-sm text-amber-600">
                  Event is full ({event.maxParticipants} participants)
                </div>
              ) : (
                <div className="text-sm text-green-600">
                  Registration open until{' '}
                  {format(new Date(event.registrationDeadline), 'MMM dd, yyyy')}
                </div>
              )}
            </div>
          )
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          {event.status === 'cancelled' ? (
            <Button disabled variant="outline" className="flex-1" size="sm">
              Event Cancelled
            </Button>
          ) : (
            <>
              {canRegister && (
                <Button onClick={() => onRegister(event.id)} className="flex-1" size="sm">
                  {event.requiresApproval ? 'Apply to Join' : 'Register Now'}
                </Button>
              )}

              {!canRegister && !isOwner && event.status === 'published' && (
                <Button disabled variant="outline" className="flex-1" size="sm">
                  {!isRegistrationOpen
                    ? 'Registration Closed'
                    : isFull
                      ? 'Event Full'
                      : 'View Details'}
                </Button>
              )}

              {isOwner && (
                <>
                  {canEdit && (
                    <Button
                      onClick={() => onEdit(event.id)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      onClick={() => onDelete(event.id)}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Organizer Info */}
        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
          Organized by {event.organizerName}
          {isOngoing && (
            <Badge variant="secondary" className="ml-2 text-xs">
              Live Now
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
