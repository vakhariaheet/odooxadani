/**
 * BookingForm Component
 *
 * Form for creating and editing bookings
 */

import { useForm } from 'react-hook-form';
import { Calendar, Users, MapPin, CreditCard, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useCreateBooking, useUpdateBooking } from '../../hooks/useBookings';
import {
  type CreateBookingRequest,
  type UpdateBookingRequest,
  type Booking,
} from '../../services/bookingsApi';

interface BookingFormProps {
  booking?: Booking; // For editing existing booking
  venueId?: string; // Pre-fill venue ID
  eventId?: string; // Pre-fill event ID
  onSuccess?: (booking: Booking) => void;
  onCancel?: () => void;
}

type FormData = CreateBookingRequest;

export const BookingForm: React.FC<BookingFormProps> = ({
  booking,
  venueId,
  eventId,
  onSuccess,
  onCancel,
}) => {
  const isEditing = !!booking;
  const createBooking = useCreateBooking();
  const updateBooking = useUpdateBooking();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: booking
      ? {
          venueId: booking.venueId,
          eventId: booking.eventId,
          bookingType: booking.bookingType,
          startDate: booking.startDate,
          endDate: booking.endDate,
          startTime: booking.startTime,
          endTime: booking.endTime,
          attendeeCount: booking.attendeeCount,
          specialRequests: booking.specialRequests || '',
          contactInfo: booking.contactInfo,
        }
      : {
          venueId: venueId || '',
          eventId: eventId || '',
          bookingType: venueId ? 'venue' : eventId ? 'event' : 'venue',
          startDate: '',
          endDate: '',
          startTime: '09:00',
          endTime: '17:00',
          attendeeCount: 1,
          specialRequests: '',
          contactInfo: {
            name: '',
            email: '',
            phone: '',
          },
        },
  });

  const watchedBookingType = watch('bookingType');
  const watchedStartDate = watch('startDate');

  // Auto-set end date to start date if not set
  const handleStartDateChange = (date: string) => {
    setValue('startDate', date);
    if (!watch('endDate')) {
      setValue('endDate', date);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && booking) {
        const updateData: UpdateBookingRequest = {
          startDate: data.startDate,
          endDate: data.endDate,
          startTime: data.startTime,
          endTime: data.endTime,
          attendeeCount: data.attendeeCount,
          specialRequests: data.specialRequests,
          contactInfo: data.contactInfo,
        };

        const result = await updateBooking.mutateAsync({
          bookingId: booking.bookingId,
          data: updateData,
        });
        onSuccess?.(result);
      } else {
        const result = await createBooking.mutateAsync(data);
        onSuccess?.(result);
      }
    } catch (error) {
      // Error handling is done in the hooks
      console.error('Booking form error:', error);
    }
  };

  const isLoading = isSubmitting || createBooking.isPending || updateBooking.isPending;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {isEditing ? 'Edit Booking' : 'Create New Booking'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Booking Type and Resource */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bookingType">Booking Type</Label>
              <Select
                value={watchedBookingType}
                onValueChange={(value: 'venue' | 'event') => setValue('bookingType', value)}
                disabled={isEditing} // Can't change type when editing
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venue">Venue Booking</SelectItem>
                  <SelectItem value="event">Event Booking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor={watchedBookingType === 'venue' ? 'venueId' : 'eventId'}>
                {watchedBookingType === 'venue' ? 'Venue ID' : 'Event ID'}
              </Label>
              <Input
                {...register(watchedBookingType === 'venue' ? 'venueId' : 'eventId', {
                  required: `${watchedBookingType === 'venue' ? 'Venue' : 'Event'} ID is required`,
                })}
                placeholder={`Enter ${watchedBookingType} ID`}
                disabled={isEditing} // Can't change resource when editing
              />
              {errors.venueId && (
                <p className="text-sm text-red-600 mt-1">{errors.venueId.message}</p>
              )}
              {errors.eventId && (
                <p className="text-sm text-red-600 mt-1">{errors.eventId.message}</p>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4" />
              <Label className="text-base font-medium">Date & Time</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  type="date"
                  {...register('startDate', { required: 'Start date is required' })}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]} // Can't book in the past
                />
                {errors.startDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  type="date"
                  {...register('endDate', { required: 'End date is required' })}
                  min={watchedStartDate || new Date().toISOString().split('T')[0]}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  type="time"
                  {...register('startTime', { required: 'Start time is required' })}
                />
                {errors.startTime && (
                  <p className="text-sm text-red-600 mt-1">{errors.startTime.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input type="time" {...register('endTime', { required: 'End time is required' })} />
                {errors.endTime && (
                  <p className="text-sm text-red-600 mt-1">{errors.endTime.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Attendees */}
          <div>
            <Label htmlFor="attendeeCount" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Number of Attendees
            </Label>
            <Input
              type="number"
              min="1"
              max="1000"
              {...register('attendeeCount', {
                required: 'Number of attendees is required',
                min: { value: 1, message: 'At least 1 attendee is required' },
                valueAsNumber: true,
              })}
            />
            {errors.attendeeCount && (
              <p className="text-sm text-red-600 mt-1">{errors.attendeeCount.message}</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4" />
              <Label className="text-base font-medium">Contact Information</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactInfo.name">Full Name</Label>
                <Input
                  {...register('contactInfo.name', { required: 'Name is required' })}
                  placeholder="Enter your full name"
                />
                {errors.contactInfo?.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.contactInfo.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="contactInfo.email">Email</Label>
                <Input
                  type="email"
                  {...register('contactInfo.email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  placeholder="Enter your email"
                />
                {errors.contactInfo?.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.contactInfo.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="contactInfo.phone">Phone Number</Label>
              <Input
                type="tel"
                {...register('contactInfo.phone')}
                placeholder="Enter your phone number (optional)"
              />
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <Label htmlFor="specialRequests" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Special Requests (Optional)
            </Label>
            <textarea
              {...register('specialRequests')}
              className="w-full min-h-[100px] px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
              placeholder="Any special requirements or notes for your booking..."
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {isLoading
                ? isEditing
                  ? 'Updating...'
                  : 'Creating...'
                : isEditing
                  ? 'Update Booking'
                  : 'Create Booking'}
            </Button>

            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
            )}
          </div>

          {!isEditing && (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
              <p className="font-medium mb-1">Payment Information:</p>
              <p>
                This is a demo booking system. Payment processing is simulated and no actual charges
                will be made. In a real system, you would be redirected to a secure payment
                processor.
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
