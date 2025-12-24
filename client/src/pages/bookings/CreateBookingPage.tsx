/**
 * CreateBookingPage Component
 *
 * Standalone page for creating a new booking
 */

import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { BookingForm } from '../../components/bookings/BookingForm';
import { type Booking } from '../../services/bookingsApi';

export const CreateBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get pre-filled data from URL params
  const venueId = searchParams.get('venueId') || undefined;
  const eventId = searchParams.get('eventId') || undefined;

  const handleSuccess = (booking: Booking) => {
    // Navigate to booking details or bookings list
    navigate(`/bookings/${booking.bookingId}`);
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={handleCancel} className="mb-4 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div>
          <h1 className="text-3xl font-bold">Create New Booking</h1>
          <p className="text-muted-foreground mt-2">
            Fill out the form below to create your booking. Payment will be processed securely.
          </p>
        </div>
      </div>

      {/* Form */}
      <BookingForm
        venueId={venueId}
        eventId={eventId}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};
