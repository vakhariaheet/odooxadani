/**
 * EventsListPage Component
 *
 * Main page for browsing all public events
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { EventList } from '../../components/events/EventList';
import { useDeleteEvent } from '../../hooks/useEvents';
import { useScrollToTop } from '../../hooks/useScrollToTop';

export const EventsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const deleteMutation = useDeleteEvent();

  useScrollToTop();

  const handleCreateEvent = () => {
    navigate('/events/new');
  };

  const handleEditEvent = (eventId: string) => {
    navigate(`/events/${eventId}/edit`);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (
      window.confirm('Are you sure you want to delete this event? This action cannot be undone.')
    ) {
      deleteMutation.mutate(eventId);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <EventList
        title="Discover Hackathon Events"
        description="Join exciting hackathons and build amazing projects with fellow developers"
        showCreateButton={!!userId}
        onCreateEvent={handleCreateEvent}
        onEditEvent={handleEditEvent}
        onDeleteEvent={handleDeleteEvent}
        currentUserId={userId || undefined}
      />
    </div>
  );
};
