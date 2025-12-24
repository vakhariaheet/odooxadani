/**
 * MyEventsPage Component
 * Organizer's events management page
 */

import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { EventList } from '../../components/events/EventList';

export function MyEventsPage() {
  const navigate = useNavigate();
  const { user } = useUser();

  const handleCreateEvent = () => {
    navigate('/dashboard/events/create');
  };

  const handleViewEvent = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const handleEditEvent = (eventId: string) => {
    navigate(`/dashboard/events/${eventId}/edit`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <EventList
        title="My Events"
        showFilters={true}
        showCreateButton={true}
        onCreateEvent={handleCreateEvent}
        onViewEvent={handleViewEvent}
        onEditEvent={handleEditEvent}
        initialFilters={{ organizerId: user?.id }}
        isOwnerView={true}
      />
    </div>
  );
}
