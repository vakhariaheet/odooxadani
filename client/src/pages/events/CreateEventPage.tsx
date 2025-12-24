/**
 * CreateEventPage Component
 * Page for creating new events
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { EventForm } from '../../components/events/EventForm';
import { useCreateEvent } from '../../hooks/useEvents';
import type { CreateEventRequest, UpdateEventRequest } from '../../types/event';
import { toast } from 'sonner';

export function CreateEventPage() {
  const navigate = useNavigate();
  const createEvent = useCreateEvent();

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleSubmit = async (data: CreateEventRequest | UpdateEventRequest) => {
    // Type guard to ensure we have CreateEventRequest
    const createData = data as CreateEventRequest;

    try {
      const response = await createEvent.mutateAsync(createData);
      toast.success('Event created successfully!');
      navigate(`/events/${response.data.eventId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create event');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button onClick={handleBack} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Create Event Form */}
      <EventForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleBack}
        isLoading={createEvent.isPending}
      />
    </div>
  );
}
