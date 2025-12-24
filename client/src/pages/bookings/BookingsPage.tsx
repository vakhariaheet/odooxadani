/**
 * BookingsPage Component
 *
 * Main page for viewing and managing user bookings
 */

import { useState } from 'react';
import { BookingList } from '../../components/bookings/BookingList';
import { BookingDetails } from '../../components/bookings/BookingDetails';
import { BookingForm } from '../../components/bookings/BookingForm';
import { type Booking } from '../../services/bookingsApi';

type ViewMode = 'list' | 'details' | 'create' | 'edit';

export const BookingsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const handleCreateBooking = () => {
    setViewMode('create');
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setViewMode('details');
  };

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setViewMode('edit');
  };

  const handleBookingSuccess = (booking: Booking) => {
    setSelectedBooking(booking);
    setViewMode('details');
  };

  const handleClose = () => {
    setSelectedBooking(null);
    setViewMode('list');
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'list':
        return (
          <BookingList onCreateBooking={handleCreateBooking} onViewBooking={handleViewBooking} />
        );

      case 'details':
        return selectedBooking ? (
          <BookingDetails
            bookingId={selectedBooking.bookingId}
            onEdit={handleEditBooking}
            onClose={handleClose}
          />
        ) : null;

      case 'create':
        return <BookingForm onSuccess={handleBookingSuccess} onCancel={handleClose} />;

      case 'edit':
        return selectedBooking ? (
          <BookingForm
            booking={selectedBooking}
            onSuccess={handleBookingSuccess}
            onCancel={handleClose}
          />
        ) : null;

      default:
        return null;
    }
  };

  return <div className="container mx-auto px-4 py-8">{renderContent()}</div>;
};
