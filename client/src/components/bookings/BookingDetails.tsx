/**
 * BookingDetails Component
 *
 * Detailed view of a single booking with all information and actions
 */

import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { useBooking, useCancelBooking, useConfirmBooking } from '../../hooks/useBookings';
import { type Booking } from '../../services/bookingsApi';

interface BookingDetailsProps {
  bookingId: string;
  onEdit?: (booking: Booking) => void;
  onClose?: () => void;
}

const statusConfig = {
  pending: {
    label: 'Pending Confirmation',
    variant: 'secondary' as const,
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    description: 'Waiting for venue confirmation',
  },
  confirmed: {
    label: 'Confirmed',
    variant: 'default' as const,
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Your booking is confirmed',
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'destructive' as const,
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'This booking has been cancelled',
  },
  completed: {
    label: 'Completed',
    variant: 'outline' as const,
    icon: CheckCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'This booking has been completed',
  },
};

const paymentStatusConfig = {
  pending: { label: 'Payment Pending', color: 'text-yellow-600', icon: AlertCircle },
  paid: { label: 'Payment Successful', color: 'text-green-600', icon: CheckCircle },
  refunded: { label: 'Refunded', color: 'text-blue-600', icon: CheckCircle },
  failed: { label: 'Payment Failed', color: 'text-red-600', icon: XCircle },
};

export const BookingDetails: React.FC<BookingDetailsProps> = ({ bookingId, onEdit, onClose }) => {
  const { data: booking, isLoading, error } = useBooking(bookingId);
  const cancelBooking = useCancelBooking();
  const confirmBooking = useConfirmBooking();

  const handleCancel = () => {
    if (
      window.confirm(
        'Are you sure you want to cancel this booking? This action cannot be undone and a refund will be processed.'
      )
    ) {
      cancelBooking.mutate(bookingId);
    }
  };

  const handleConfirm = () => {
    if (window.confirm('Are you sure you want to confirm this booking?')) {
      confirmBooking.mutate(bookingId);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !booking) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-12 text-center">
          <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium mb-2">Booking Not Found</h3>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'The requested booking could not be found.'}
          </p>
          {onClose && (
            <Button onClick={onClose} variant="outline">
              Go Back
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const statusInfo = statusConfig[booking.status];
  const StatusIcon = statusInfo.icon;
  const paymentInfo = paymentStatusConfig[booking.paymentStatus];
  const PaymentIcon = paymentInfo.icon;

  const canEdit = booking.status === 'pending';
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
  const canConfirm = booking.status === 'pending';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">
                {booking.bookingType === 'venue' ? 'Venue Booking' : 'Event Booking'}
              </CardTitle>
              <p className="text-muted-foreground">Booking ID: {booking.bookingId}</p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant={statusInfo.variant} className="flex items-center gap-1 px-3 py-1">
                <StatusIcon className="h-4 w-4" />
                {statusInfo.label}
              </Badge>

              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
          </div>

          <div className={`p-3 rounded-lg ${statusInfo.bgColor} border`}>
            <p className={`text-sm ${statusInfo.color} font-medium`}>{statusInfo.description}</p>
          </div>
        </CardHeader>
      </Card>

      {/* Main Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Date & Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Date & Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="text-lg">
                {format(new Date(booking.startDate), 'EEEE, MMMM dd, yyyy')}
                {booking.startDate !== booking.endDate && (
                  <span className="text-muted-foreground">
                    {' '}
                    - {format(new Date(booking.endDate), 'EEEE, MMMM dd, yyyy')}
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time</p>
                <p className="text-lg">
                  {booking.startTime} - {booking.endTime}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendees & Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Attendees</p>
              <p className="text-lg">{booking.attendeeCount} people</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">
                ${booking.totalAmount} {booking.currency}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <PaymentIcon className={`h-4 w-4 ${paymentInfo.color}`} />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                <p className={`font-medium ${paymentInfo.color}`}>{paymentInfo.label}</p>
                {booking.paymentId && (
                  <p className="text-xs text-muted-foreground">ID: {booking.paymentId}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg">{booking.contactInfo.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg">{booking.contactInfo.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-lg">{booking.contactInfo.phone || 'Not provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Requests */}
      {booking.specialRequests && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Special Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{booking.specialRequests}</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3">
            {canEdit && onEdit && (
              <Button onClick={() => onEdit(booking)} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Booking
              </Button>
            )}

            {canConfirm && (
              <Button
                onClick={handleConfirm}
                disabled={confirmBooking.isPending}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                {confirmBooking.isPending ? 'Confirming...' : 'Confirm Booking'}
              </Button>
            )}

            {canCancel && (
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={cancelBooking.isPending}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {cancelBooking.isPending ? 'Cancelling...' : 'Cancel Booking'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-medium">Booking Created</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(booking.createdAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>

            {booking.confirmedAt && (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Booking Confirmed</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(booking.confirmedAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
            )}

            {booking.cancelledAt && (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Booking Cancelled</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(booking.cancelledAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
