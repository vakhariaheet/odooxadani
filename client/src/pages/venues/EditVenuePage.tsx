import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { VenueForm } from '../../components/venues/VenueForm';
import { useVenueDetails, useUpdateVenue } from '../../hooks/useVenues';
import { toast } from 'sonner';
import type { UpdateVenueRequest } from '../../types/venue';

export function EditVenuePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: venueResponse, isLoading: isLoadingVenue, error } = useVenueDetails(id || '');
  const updateVenueMutation = useUpdateVenue();
  
  const venue = venueResponse?.data;

  useEffect(() => {
    if (venue) {
      document.title = `Edit ${venue.name} - Odoo Xadani`;
    }
  }, [venue]);

  const handleSubmit = async (data: UpdateVenueRequest) => {
    if (!id) return;
    
    try {
      await updateVenueMutation.mutateAsync({ venueId: id, data });
      toast.success('Venue updated successfully!');
      navigate('/dashboard/venues');
    } catch (error) {
      toast.error('Failed to update venue. Please try again.');
      throw error; // Re-throw to prevent form from closing
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/venues');
  };

  if (isLoadingVenue) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-96 bg-muted rounded"></div>
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
              The venue you're trying to edit doesn't exist or you don't have permission to edit it.
            </p>
            <Button onClick={() => navigate('/dashboard/venues')}>
              Back to My Venues
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Venues
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold mb-2">Edit Venue</h1>
            <p className="text-muted-foreground">
              Update your venue details and settings
            </p>
          </div>
        </div>

        {/* Form */}
        <VenueForm
          venue={venue}
          onSubmit={handleSubmit as any}
          onCancel={handleCancel}
          isLoading={updateVenueMutation.isPending}
        />
      </div>
  );
}