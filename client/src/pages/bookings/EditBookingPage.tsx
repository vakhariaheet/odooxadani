/**
 * EditBookingPage Component
 *
 * Standalone page for editing an existing booking
 */

import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { BookingForm } from '../../components/bookings/BookingForm';
import { Skeleton } from '../../components/ui/skeleton';
import { Card, CardContent } from '../../components/ui/card';
import { useBooking } from '../../hooks/useBookings';
import { type Booking } from '../../services/bookingsApi';

export const EditBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: booking, isLoading, error } = useBooking(id || '');

  const handleSuccess = (updatedBooking: Booking) => {
    navigate(`/bookings/${updatedBooking.bookingId}`);
  };

  const handleCancel = () => {
    navigate(`/bookings/${id}`);
  };

  if (!id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Invalid Booking ID</h1>
          <p className="text-muted-foreground mt-2">The booking ID is missing from the URL.</p>
          <Button onClick={() => navigate('/bookings')} className="mt-4">
            Go to Bookings
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-10 w-24 mb-4" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>

        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-6 space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Booking Not Found</h1>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error ? error.message : 'The requested booking could not be found.'}
          </p>
          <Button onClick={() => navigate('/bookings')} className="mt-4">
            Go to Bookings
          </Button>
        </div>
      </div>
    );
  }

  if (booking.status !== 'pending') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-yellow-600">Cannot Edit Booking</h1>
          <p className="text-muted-foreground mt-2">
            Only pending bookings can be edited. This booking is currently {booking.status}.
          </p>
          <Button onClick={handleCancel} className="mt-4">
            View Booking Details
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={handleCancel} className="mb-4 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Booking
        </Button>

        <div>
          <h1 className="text-3xl font-bold">Edit Booking</h1>
          <p className="text-muted-foreground mt-2">
            Update your booking details. Changes will be saved immediately.
          </p>
        </div>
      </div>

      {/* Form */}
      <BookingForm booking={booking} onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
};
