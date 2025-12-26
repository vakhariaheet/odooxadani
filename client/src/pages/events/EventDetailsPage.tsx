/**
 * EventDetailsPage Component
 *
 * Detailed view of a single event with registration functionality
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { format } from 'date-fns';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  TrendingUp,
  ArrowLeft,
  Edit,
  Trash2,
  Trophy,
  FileText,
  Share2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { useEvent, useRegisterForEvent, useDeleteEvent } from '../../hooks/useEvents';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import { EVENT_STATUS_LABELS } from '../../types/event';
import { RegistrationModal } from '../../components/events/RegistrationModal';

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  useScrollToTop();

  const { data: event, isLoading, error } = useEvent(id!);
  const registerMutation = useRegisterForEvent();
  const deleteMutation = useDeleteEvent();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-destructive mb-4">Event not found</p>
            <Button onClick={() => navigate('/events')} variant="outline">
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = userId === event.organizerId;
  const isRegistrationOpen = new Date() < new Date(event.registrationDeadline);
  const isFull = event.currentParticipants >= event.maxParticipants;
  const canRegister = !isOwner && event.status === 'published' && isRegistrationOpen && !isFull;
  const canEdit = isOwner && event.status !== 'cancelled';
  const canDelete = isOwner && event.status !== 'cancelled';

  const handleRegister = () => {
    setShowRegistrationModal(true);
  };

  const handleRegistrationSubmit = (skills: string[]) => {
    registerMutation.mutate(
      {
        id: event.id,
        data: { skills },
      },
      {
        onSuccess: () => {
          setShowRegistrationModal(false);
        },
      }
    );
  };

  const handleEdit = () => {
    navigate(`/events/${event.id}/edit`);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteMutation.mutate(event.id, {
        onSuccess: () => {
          navigate('/events');
        },
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.name,
        text: event.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast here
    }
  };

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/events')} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Events
      </Button>

      {/* Header */}
      <Card
        className={`mb-6 ${
          event.status === 'cancelled' ? 'opacity-75 border-destructive/50 bg-destructive/5' : ''
        }`}
      >
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={getStatusBadgeVariant(event.status)}>
                  {EVENT_STATUS_LABELS[event.status]}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>{event.trendScore}/10 Trending</span>
                </div>
              </div>
              <CardTitle
                className={`text-3xl mb-2 ${
                  event.status === 'cancelled' ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {event.name}
              </CardTitle>
              <p className="text-muted-foreground">Organized by {event.organizerName}</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
              {canEdit && (
                <Button variant="outline" size="icon" onClick={handleEdit}>
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDelete}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Cancelled Event Warning */}
          {event.status === 'cancelled' && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="text-sm font-medium text-destructive">
                ⚠️ This event has been cancelled
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Contact the organizer for more information
              </div>
            </div>
          )}

          {/* Event Meta */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Start Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(event.startDate), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">
                  {Math.ceil(
                    (new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{' '}
                  days
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{event.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Participants</p>
                <p className="text-sm text-muted-foreground">
                  {event.currentParticipants}/{event.maxParticipants}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Event</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {event.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Rules & Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {event.rules.split('\n').map((rule, index) => (
                  <p key={index} className="mb-4 last:mb-0">
                    {rule}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Prizes */}
          {event.prizes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Prizes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {event.prizes.map((prize) => (
                    <div key={prize.position} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{prize.position}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{prize.title}</h4>
                        <p className="text-sm text-muted-foreground">{prize.description}</p>
                        {prize.value && (
                          <p className="text-sm font-medium text-green-600 mt-1">{prize.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration */}
          <Card>
            <CardHeader>
              <CardTitle>Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.status === 'cancelled' ? (
                <div className="text-center py-4">
                  <p className="text-destructive font-medium mb-2">Event Cancelled</p>
                  <p className="text-sm text-muted-foreground">
                    This event has been cancelled by the organizer.
                  </p>
                </div>
              ) : event.status === 'published' ? (
                <>
                  <div className="text-sm">
                    <p className="font-medium">Registration Deadline</p>
                    <p className="text-muted-foreground">
                      {format(new Date(event.registrationDeadline), 'MMM dd, yyyy')}
                    </p>
                  </div>

                  <div className="text-sm">
                    <p className="font-medium">Approval Required</p>
                    <p className="text-muted-foreground">{event.requiresApproval ? 'Yes' : 'No'}</p>
                  </div>

                  <Separator />

                  {canRegister ? (
                    <Button
                      onClick={handleRegister}
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {event.requiresApproval ? 'Apply to Join' : 'Register Now'}
                    </Button>
                  ) : (
                    <Button disabled variant="outline" className="w-full">
                      {!isRegistrationOpen
                        ? 'Registration Closed'
                        : isFull
                          ? 'Event Full'
                          : isOwner
                            ? 'You are the organizer'
                            : 'Cannot Register'}
                    </Button>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    Registration not available for {EVENT_STATUS_LABELS[event.status].toLowerCase()}{' '}
                    events
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {event.categories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {event.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && (
        <RegistrationModal
          event={event}
          onSubmit={handleRegistrationSubmit}
          onClose={() => setShowRegistrationModal(false)}
          isLoading={registerMutation.isPending}
        />
      )}
    </div>
  );
};
