/**
 * BookingConfirmation Component
 *
 * Success page shown after booking creation
 */

import { CheckCircle, Calendar, Clock, Users, CreditCard, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { type Booking } from '../../services/bookingsApi';

interface BookingConfirmationProps {
  booking: Booking;
  onViewBooking?: () => void;
  onCreateAnother?: () => void;
  onGoToBookings?: () => void;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  booking,
  onViewBooking,
  onCreateAnother,
  onGoToBookings,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Success Header */}
      <Card className="text-center">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
              <p className="text-muted-foreground">
                Your booking has been created successfully. You'll receive a confirmation email
                shortly.
              </p>
            </div>

            <Badge variant="outline" className="text-sm">
              Booking ID: {booking.bookingId}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(booking.startDate), 'EEEE, MMMM dd, yyyy')}
                  {booking.startDate !== booking.endDate && (
                    <span> - {format(new Date(booking.endDate), 'MMMM dd, yyyy')}</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Time</p>
                <p className="text-sm text-muted-foreground">
                  {booking.startTime} - {booking.endTime}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Attendees</p>
                <p className="text-sm text-muted-foreground">{booking.attendeeCount} people</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Amount</p>
                <p className="text-sm text-muted-foreground">
                  ${booking.totalAmount} {booking.currency}
                </p>
              </div>
            </div>
          </div>

          {booking.specialRequests && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Special Requests</p>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                {booking.specialRequests}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-blue-600">1</span>
              </div>
              <div>
                <p className="font-medium">Confirmation Email</p>
                <p className="text-muted-foreground">
                  You'll receive a confirmation email at {booking.contactInfo.email} with all the
                  details.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-blue-600">2</span>
              </div>
              <div>
                <p className="font-medium">Venue Confirmation</p>
                <p className="text-muted-foreground">
                  The venue will review and confirm your booking. You'll be notified once it's
                  approved.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-blue-600">3</span>
              </div>
              <div>
                <p className="font-medium">Payment Processing</p>
                <p className="text-muted-foreground">
                  Your payment has been processed successfully. You can view the receipt in your
                  booking details.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {onViewBooking && (
          <Button onClick={onViewBooking} className="flex items-center gap-2">
            View Booking Details
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}

        {onGoToBookings && (
          <Button variant="outline" onClick={onGoToBookings}>
            View All Bookings
          </Button>
        )}

        {onCreateAnother && (
          <Button variant="outline" onClick={onCreateAnother}>
            Create Another Booking
          </Button>
        )}
      </div>

      {/* Demo Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-white">i</span>
            </div>
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-1">Demo Mode</p>
              <p className="text-blue-700">
                This is a demonstration booking system. No actual charges have been made and no real
                venue has been booked. In a production system, this would integrate with real
                payment processors and venue management systems.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
