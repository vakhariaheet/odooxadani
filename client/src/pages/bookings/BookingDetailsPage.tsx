/**
 * BookingDetailsPage Component
 *
 * Standalone page for viewing booking details
 */

import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { BookingDetails } from '../../components/bookings/BookingDetails';
import { type Booking } from '../../services/bookingsApi';

export const BookingDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const handleEdit = (booking: Booking) => {
    navigate(`/bookings/${booking.bookingId}/edit`);
  };

  const handleClose = () => {
    navigate('/bookings');
  };

  if (!id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Invalid Booking ID</h1>
          <p className="text-muted-foreground mt-2">The booking ID is missing from the URL.</p>
          <Button onClick={handleClose} className="mt-4">
            Go to Bookings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={handleClose} className="mb-4 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Bookings
        </Button>
      </div>

      {/* Booking Details */}
      <BookingDetails bookingId={id} onEdit={handleEdit} onClose={handleClose} />
    </div>
  );
};
