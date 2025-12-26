/**
 * EventEditPage Component
 *
 * Page for editing existing events
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventForm } from '../../components/events/EventForm';
import { useEvent, useUpdateEvent } from '../../hooks/useEvents';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import type { UpdateEventRequest } from '../../types/event';
import { Card, CardHeader, CardTitle } from '../../components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';

export const EventEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const updateEventMutation = useUpdateEvent();

  useScrollToTop();

  const { data: event, isLoading, error } = useEvent(id!);

  const handleSubmit = (data: UpdateEventRequest) => {
    if (!id) return;

    updateEventMutation.mutate(
      { id, data },
      {
        onSuccess: (updatedEvent) => {
          navigate(`/events/${updatedEvent.id}`);
        },
      }
    );
  };

  const handleCancel = () => {
    navigate(`/events/${id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <div className="p-12 text-center">
            <p className="text-destructive mb-4">Event not found</p>
            <Button onClick={() => navigate('/events')} variant="outline">
              Back to Events
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(`/events/${id}`)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Event
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Event</CardTitle>
            <p className="text-muted-foreground">Update your hackathon event details</p>
          </CardHeader>
        </Card>
      </div>

      {/* Form */}
      <EventForm
        event={event}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={updateEventMutation.isPending}
        isEditing={true}
      />
    </div>
  );
};
