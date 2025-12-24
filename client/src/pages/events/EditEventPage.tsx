/**
 * EditEventPage Component
 * Page for editing existing events
 */

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { EventForm } from '../../components/events/EventForm';
import { useEvent, useUpdateEvent } from '../../hooks/useEvents';
import type { UpdateEventRequest } from '../../types/event';
import { toast } from 'sonner';

export function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: eventData, isLoading: isLoadingEvent, error } = useEvent(id!);
  const updateEvent = useUpdateEvent();

  const event = eventData?.data;

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleSubmit = async (data: UpdateEventRequest) => {
    if (!id) return;

    try {
      await updateEvent.mutateAsync({ eventId: id, data });
      toast.success('Event updated successfully!');
      navigate(`/events/${id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update event');
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-6">
            The event you're trying to edit doesn't exist or you don't have permission to edit it.
          </p>
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (isLoadingEvent || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Loading event...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button onClick={handleBack} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Edit Event Form */}
      <EventForm
        mode="edit"
        event={event}
        onSubmit={handleSubmit}
        onCancel={handleBack}
        isLoading={updateEvent.isPending}
      />
    </div>
  );
}
