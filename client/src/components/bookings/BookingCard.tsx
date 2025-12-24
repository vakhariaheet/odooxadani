/**
 * BookingCard Component
 *
 * Displays individual booking information in a card format
 */

import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { type Booking } from '../../services/bookingsApi';
import { useCancelBooking, useConfirmBooking } from '../../hooks/useBookings';

interface BookingCardProps {
  booking: Booking;
  showActions?: boolean;
  onViewDetails?: (booking: Booking) => void;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    variant: 'secondary' as const,
    icon: AlertCircle,
    color: 'text-yellow-600',
  },
  confirmed: {
    label: 'Confirmed',
    variant: 'default' as const,
    icon: CheckCircle,
    color: 'text-green-600',
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'destructive' as const,
    icon: XCircle,
    color: 'text-red-600',
  },
  completed: {
    label: 'Completed',
    variant: 'outline' as const,
    icon: CheckCircle,
    color: 'text-blue-600',
  },
};

const paymentStatusConfig = {
  pending: { label: 'Payment Pending', color: 'text-yellow-600' },
  paid: { label: 'Paid', color: 'text-green-600' },
  refunded: { label: 'Refunded', color: 'text-blue-600' },
  failed: { label: 'Payment Failed', color: 'text-red-600' },
};

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  showActions = true,
  onViewDetails,
}) => {
  const cancelBooking = useCancelBooking();
  const confirmBooking = useConfirmBooking();

  const statusInfo = statusConfig[booking.status];
  const StatusIcon = statusInfo.icon;
  const paymentInfo = paymentStatusConfig[booking.paymentStatus];

  const handleCancel = () => {
    if (
      window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')
    ) {
      cancelBooking.mutate(booking.bookingId);
    }
  };

  const handleConfirm = () => {
    confirmBooking.mutate(booking.bookingId);
  };

  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
  const canConfirm = booking.status === 'pending';

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              {booking.bookingType === 'venue' ? 'Venue Booking' : 'Event Booking'}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">ID: {booking.bookingId}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusInfo.variant} className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Date</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(booking.startDate), 'MMM dd, yyyy')}
                {booking.startDate !== booking.endDate && (
                  <span> - {format(new Date(booking.endDate), 'MMM dd, yyyy')}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Time</p>
              <p className="text-sm text-muted-foreground">
                {booking.startTime} - {booking.endTime}
              </p>
            </div>
          </div>
        </div>

        {/* Attendees and Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Attendees</p>
              <p className="text-sm text-muted-foreground">{booking.attendeeCount} people</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Amount</p>
              <p className="text-sm text-muted-foreground">
                ${booking.totalAmount} {booking.currency}
              </p>
              <p className={`text-xs ${paymentInfo.color}`}>{paymentInfo.label}</p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Contact</p>
            <p className="text-sm text-muted-foreground">
              {booking.contactInfo.name} • {booking.contactInfo.email}
            </p>
          </div>
        </div>

        {/* Special Requests */}
        {booking.specialRequests && (
          <div>
            <p className="text-sm font-medium mb-1">Special Requests</p>
            <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
              {booking.specialRequests}
            </p>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={() => onViewDetails?.(booking)}>
              View Details
            </Button>

            {canConfirm && (
              <Button size="sm" onClick={handleConfirm} disabled={confirmBooking.isPending}>
                {confirmBooking.isPending ? 'Confirming...' : 'Confirm'}
              </Button>
            )}

            {canCancel && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancel}
                disabled={cancelBooking.isPending}
              >
                {cancelBooking.isPending ? 'Cancelling...' : 'Cancel'}
              </Button>
            )}
          </div>
        )}

        {/* Timestamps */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p>Created: {format(new Date(booking.createdAt), 'MMM dd, yyyy HH:mm')}</p>
          {booking.confirmedAt && (
            <p>Confirmed: {format(new Date(booking.confirmedAt), 'MMM dd, yyyy HH:mm')}</p>
          )}
          {booking.cancelledAt && (
            <p>Cancelled: {format(new Date(booking.cancelledAt), 'MMM dd, yyyy HH:mm')}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
