import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { VenueForm } from '../../components/venues/VenueForm';
import { useCreateVenue } from '../../hooks/useVenues';
import { toast } from 'sonner';
import type { CreateVenueRequest } from '../../types/venue';

export function CreateVenuePage() {
  const navigate = useNavigate();
  const createVenueMutation = useCreateVenue();

  useEffect(() => {
    document.title = 'Create New Venue - Odoo Xadani';
  }, []);

  const handleSubmit = async (data: CreateVenueRequest) => {
    try {
      const response = await createVenueMutation.mutateAsync(data);
      toast.success('Venue created successfully!');
      navigate(`/dashboard/venues/${response.data.venueId}/edit`);
    } catch (error) {
      toast.error('Failed to create venue. Please try again.');
      throw error; // Re-throw to prevent form from closing
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/venues');
  };

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
            <h1 className="text-3xl font-bold mb-2">Create New Venue</h1>
            <p className="text-muted-foreground">
              Fill in the details below to create your venue listing
            </p>
          </div>
        </div>

        {/* Form */}
        <VenueForm
          onSubmit={handleSubmit as any}
          onCancel={handleCancel}
          isLoading={createVenueMutation.isPending}
        />
      </div>
  );
}