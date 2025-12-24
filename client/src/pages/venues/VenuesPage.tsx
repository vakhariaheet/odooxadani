import { useEffect } from 'react';
import { VenueList } from '../../components/venues/VenueList';

export function VenuesPage() {
  useEffect(() => {
    document.title = 'Find Venues - Odoo Xadani';
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find the Perfect Venue</h1>
        <p className="text-muted-foreground text-lg">
          Discover amazing spaces for your events. From intimate gatherings to large celebrations.
        </p>
      </div>

      <VenueList />
    </div>
  );
}