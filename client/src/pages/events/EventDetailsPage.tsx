/**
 * EventDetailsPage Component
 * Event detail view page
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { EventDetails } from '../../components/events/EventDetails';
import { useEvent, useUpdateEvent, useDeleteEvent } from '../../hooks/useEvents';
import { toast } from 'sonner';

export function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();

  const { data: eventData, isLoading, error } = useEvent(id!);
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const event = eventData?.data;
  const isOwner = !!(event && user && event.organizerId === user.id);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    navigate(`/dashboard/events/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteEvent.mutateAsync(id);
      toast.success('Event deleted successfully');
      navigate('/dashboard/events');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete event');
    }
  };

  const handlePublish = async () => {
    if (!id) return;

    try {
      await updateEvent.mutateAsync({
        eventId: id,
        data: { status: 'published' },
      });
      toast.success('Event published successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish event');
    }
  };

  const handleCancel = async () => {
    if (!id) return;

    try {
      await updateEvent.mutateAsync({
        eventId: id,
        data: { status: 'cancelled' },
      });
      toast.success('Event cancelled');
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel event');
    }
  };

  const handleComplete = async () => {
    if (!id) return;

    try {
      await updateEvent.mutateAsync({
        eventId: id,
        data: { status: 'completed' },
      });
      toast.success('Event marked as completed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete event');
    }
  };

  const handleBook = () => {
    // TODO: Implement booking functionality in future modules
    toast.info('Booking functionality will be available soon!');
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-6">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
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
          Back
        </Button>
      </div>

      {/* Event Details */}
      {event && (
        <EventDetails
          event={event}
          isLoading={isLoading}
          isOwner={isOwner}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPublish={handlePublish}
          onCancel={handleCancel}
          onComplete={handleComplete}
          onBook={handleBook}
        />
      )}
    </div>
  );
}
