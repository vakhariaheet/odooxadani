/**
 * EventCreatePage Component
 *
 * Page for creating new events
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EventForm } from '../../components/events/EventForm';
import { useCreateEvent } from '../../hooks/useEvents';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import type { CreateEventRequest, UpdateEventRequest } from '../../types/event';
import { Card, CardHeader, CardTitle } from '../../components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';

export const EventCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const createEventMutation = useCreateEvent();

  useScrollToTop();

  const handleSubmit = (data: CreateEventRequest | UpdateEventRequest) => {
    createEventMutation.mutate(data as CreateEventRequest, {
      onSuccess: (newEvent) => {
        navigate(`/events/${newEvent.id}`);
      },
    });
  };

  const handleCancel = () => {
    navigate('/events');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/events')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Event</CardTitle>
            <p className="text-muted-foreground">
              Set up your hackathon event and start building an amazing community of developers
            </p>
          </CardHeader>
        </Card>
      </div>

      {/* Form */}
      <EventForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createEventMutation.isPending}
      />
    </div>
  );
};
