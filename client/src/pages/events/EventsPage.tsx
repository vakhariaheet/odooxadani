/**
 * EventsPage Component
 * Public events listing page
 */

import { useNavigate } from 'react-router-dom';
import { EventList } from '../../components/events/EventList';

export function EventsPage() {
  const navigate = useNavigate();

  const handleViewEvent = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <EventList
        title="Discover Events"
        showFilters={true}
        showCreateButton={false}
        onViewEvent={handleViewEvent}
        initialFilters={{ status: 'published' }}
        isPublicView={true}
      />
    </div>
  );
}
