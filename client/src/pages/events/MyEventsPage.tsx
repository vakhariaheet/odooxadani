/**
 * MyEventsPage Component
 * Organizer's events management page
 */

import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { EventList } from '../../components/events/EventList';

export function MyEventsPage() {
  const navigate = useNavigate();
  const { user } = useUser();

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

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
      {/* Back to Dashboard Button */}
      <div className="mb-6">
        <Button onClick={handleBackToDashboard} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

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
