/**
 * EventDetails Component
 * Displays detailed event information
 */

import { useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  User,
  Edit,
  Trash2,
  Share2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import type { Event } from '../../types/event';
import {
  formatEventDateRange,
  formatEventPrice,
  getEventStatusColor,
  isEventPast,
  isEventActive,
} from '../../services/eventsApi';

interface EventDetailsProps {
  event: Event;
  isLoading?: boolean;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPublish?: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
  onBook?: () => void;
}

export function EventDetails({
  event,
  isLoading = false,
  isOwner = false,
  onEdit,
  onDelete,
  onPublish,
  onCancel,
  onComplete,
  onBook,
}: EventDetailsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (isLoading) {
    return <EventDetailsSkeleton />;
  }

  const statusColor = getEventStatusColor(event.status);
  const isFullyBooked = event.currentAttendees >= event.maxAttendees;
  const isPast = isEventPast(event.endDate);
  const isActive = isEventActive(event.startDate, event.endDate);

  const canBook = event.status === 'published' && !isFullyBooked && !isPast && !isOwner;
  const canEdit = isOwner && (event.status === 'draft' || event.status === 'published');
  const canPublish = isOwner && event.status === 'draft';
  const canCancelEvent =
    isOwner && (event.status === 'published' || event.status === 'draft') && !isPast;
  const canComplete = isOwner && event.status === 'published' && isPast;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleDeleteConfirm = () => {
    onDelete?.();
    setShowDeleteDialog(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge
                  variant={statusColor === 'green' ? 'default' : 'secondary'}
                  className={`${
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
                <Badge variant="outline">
                  {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                </Badge>
                {isActive && <Badge className="bg-orange-100 text-orange-800">Live Now</Badge>}
                {isFullyBooked && <Badge variant="secondary">Fully Booked</Badge>}
              </div>
              <CardTitle className="text-3xl font-bold mb-2">{event.title}</CardTitle>
              <p className="text-gray-600 text-lg">{event.description}</p>
            </div>

            <div className="flex gap-2 ml-4">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              {isOwner && canEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-3" />
                <div>
                  <p className="font-medium">Date & Time</p>
                  <p>{formatEventDateRange(event.startDate, event.endDate)}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-3" />
                <div>
                  <p className="font-medium">Location</p>
                  <p>{event.location.address}</p>
                  <p>{event.location.city}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                <Users className="h-5 w-5 mr-3" />
                <div>
                  <p className="font-medium">Capacity</p>
                  <p>
                    {event.currentAttendees} / {event.maxAttendees} attendees
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((event.currentAttendees / event.maxAttendees) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                <DollarSign className="h-5 w-5 mr-3" />
                <div>
                  <p className="font-medium">Price</p>
                  <p className="text-2xl font-bold text-black">
                    {formatEventPrice(event.price, event.currency || 'USD')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organizer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Organizer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <User className="h-5 w-5 mr-3 text-gray-600" />
                <div>
                  <p className="font-medium">Event Organizer</p>
                  <p className="text-gray-600">ID: {event.organizerId}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Booking Button */}
                {canBook && (
                  <Button onClick={onBook} className="w-full" size="lg">
                    Book Now
                  </Button>
                )}

                {/* Owner Actions */}
                {isOwner && (
                  <div className="space-y-2">
                    {canPublish && (
                      <Button onClick={onPublish} className="w-full" variant="default">
                        Publish Event
                      </Button>
                    )}

                    {canCancelEvent && (
                      <Button onClick={onCancel} className="w-full" variant="destructive">
                        Cancel Event
                      </Button>
                    )}

                    {canComplete && (
                      <Button onClick={onComplete} className="w-full" variant="outline">
                        Mark as Completed
                      </Button>
                    )}
                  </div>
                )}

                {/* Status Messages */}
                {event.status === 'cancelled' && (
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-red-800 font-medium">This event has been cancelled</p>
                  </div>
                )}

                {event.status === 'completed' && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 font-medium">This event has ended</p>
                  </div>
                )}

                {isFullyBooked && event.status === 'published' && (
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-yellow-800 font-medium">This event is fully booked</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Event Meta */}
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>Created {new Date(event.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>Updated {new Date(event.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{event.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EventDetailsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-full" />
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-5 w-5" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
