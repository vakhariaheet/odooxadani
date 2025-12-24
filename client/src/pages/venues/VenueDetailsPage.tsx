import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { VenueDetails } from '../../components/venues/VenueDetails';
import { useVenueDetails } from '../../hooks/useVenues';

export function VenueDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: venueResponse, isLoading, error } = useVenueDetails(id || '');
  const venue = venueResponse?.data;

  useEffect(() => {
    if (venue) {
      document.title = `${venue.name} - Odoo Xadani`;
    }
  }, [venue]);

  const handleBookNow = () => {
    // Navigate to booking page (to be implemented)
    navigate(`/venues/${id}/book`);
  };

  const handleContactOwner = () => {
    // Open contact modal or navigate to contact page
    console.log('Contact owner for venue:', id);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="aspect-video bg-muted rounded-lg"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-48 bg-muted rounded"></div>
            </div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-semibold mb-4">Venue Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The venue you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/venues')}>
              Browse All Venues
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <VenueDetails
        venue={venue}
        onBookNow={handleBookNow}
        onContactOwner={handleContactOwner}
      />
    </div>
  );
}